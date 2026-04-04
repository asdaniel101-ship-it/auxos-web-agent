#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join, resolve } from 'path'

const args = process.argv.slice(2)
const command = args[0]

if (command !== 'generate') {
  console.log('Usage: auxos generate --types <path> --store <path> --forms <path> --out <path>')
  process.exit(1)
}

// Parse CLI flags
function getFlag(name) {
  const idx = args.indexOf(`--${name}`)
  return idx !== -1 ? args[idx + 1] : null
}

const typesPath = resolve(getFlag('types') || 'src/types/index.ts')
const storePath = resolve(getFlag('store') || 'src/store/slices')
const formsPath = resolve(getFlag('forms') || 'src/components')
const outPath = resolve(getFlag('out') || 'auxos-tools.json')

console.log('Auxos CLI — generating tools from source...')
console.log(`  Types:  ${typesPath}`)
console.log(`  Store:  ${storePath}`)
console.log(`  Forms:  ${formsPath}`)
console.log(`  Output: ${outPath}`)
console.log()

// ─── Step 1: Parse TypeScript interfaces from types file ───

function parseInterfaces(source) {
  const interfaces = {}
  // Match: export interface Foo { ... }
  const interfaceRegex = /export\s+interface\s+(\w+)\s*\{([^}]+)\}/g
  // Match: export type FooStatus = 'a' | 'b' | 'c'
  const typeAliasRegex = /export\s+type\s+(\w+)\s*=\s*([^;\n]+)/g

  // First collect union types for enum resolution
  const unionTypes = {}
  let match
  while ((match = typeAliasRegex.exec(source)) !== null) {
    const [, name, definition] = match
    const literals = [...definition.matchAll(/'([^']+)'/g)].map(m => m[1])
    if (literals.length > 0) {
      unionTypes[name] = literals
    }
  }

  // Parse interfaces
  while ((match = interfaceRegex.exec(source)) !== null) {
    const [, name, body] = match
    const fields = {}
    const fieldRegex = /(\w+)\s*:\s*([^;\n]+)/g
    let fieldMatch
    while ((fieldMatch = fieldRegex.exec(body)) !== null) {
      const [, fieldName, rawType] = fieldMatch
      const typeStr = rawType.trim()

      // Skip computed/complex fields
      if (fieldName === 'id' || fieldName === 'createdAt') continue

      const field = parseFieldType(typeStr, unionTypes)
      if (field) {
        fields[fieldName] = field
      }
    }
    interfaces[name] = fields
  }

  return { interfaces, unionTypes }
}

function parseFieldType(typeStr, unionTypes) {
  // Handle nullable: string | null
  const isNullable = typeStr.includes('| null')
  const baseType = typeStr.replace(/\s*\|\s*null/, '').trim()

  // Check if it's a known union type
  if (unionTypes[baseType]) {
    return { type: 'string', enum: unionTypes[baseType], nullable: isNullable }
  }

  // Inline union: 'a' | 'b' | 'c'
  const inlineLiterals = [...baseType.matchAll(/'([^']+)'/g)].map(m => m[1])
  if (inlineLiterals.length > 0) {
    return { type: 'string', enum: inlineLiterals, nullable: isNullable }
  }

  // Array type: string[]
  if (baseType.endsWith('[]')) {
    const itemType = baseType.slice(0, -2)
    return { type: 'array', items: { type: tsTypeToJsonType(itemType) }, nullable: isNullable }
  }

  // Primitive types
  const jsonType = tsTypeToJsonType(baseType)
  if (jsonType) {
    return { type: jsonType, nullable: isNullable }
  }

  return null
}

function tsTypeToJsonType(ts) {
  switch (ts) {
    case 'string': return 'string'
    case 'number': return 'number'
    case 'boolean': return 'boolean'
    default: return null
  }
}

// ─── Step 2: Parse store slices to find operations ───

function parseStoreSlices(dirPath) {
  const operations = {}
  const files = readdirSync(dirPath).filter(f => f.endsWith('.ts'))

  for (const file of files) {
    const source = readFileSync(join(dirPath, file), 'utf-8')
    const entityName = file.replace('.ts', '')

    // Find which type is imported
    const importMatch = source.match(/import\s*\{([^}]+)\}\s*from\s*'@\/types'/)
    if (!importMatch) continue
    const importedTypes = importMatch[1].split(',').map(s => s.trim())
    const entityType = importedTypes.find(t => t[0] === t[0].toUpperCase() && !t.includes('Stage') && !t.includes('Status') && !t.includes('Priority'))
    if (!entityType) continue

    const ops = []

    // Detect add method: addFoo(data: Omit<Foo, 'id' | 'createdAt'>) => Foo
    if (source.includes(`add${entityType}`)) {
      ops.push({ operation: 'create', method: `add${entityType}` })
    }
    // Detect update method
    if (source.includes(`update${entityType}`)) {
      ops.push({ operation: 'update', method: `update${entityType}` })
    }
    // Detect delete method
    if (source.includes(`delete${entityType}`)) {
      ops.push({ operation: 'delete', method: `delete${entityType}` })
    }
    // Detect list (the array property)
    if (source.includes(`${entityName}:`)) {
      ops.push({ operation: 'list' })
    }

    if (ops.length > 0) {
      operations[entityName] = { entityType, operations: ops }
    }
  }

  return operations
}

// ─── Step 3: Parse form components to find UI field mappings ───

function parseFormComponents(dirPath) {
  const formMappings = {}

  function scanDir(dir) {
    let entries
    try { entries = readdirSync(dir, { withFileTypes: true }) } catch { return }

    for (const entry of entries) {
      const fullPath = join(dir, entry.name)
      if (entry.isDirectory()) {
        scanDir(fullPath)
      } else if (entry.name.includes('Form') && entry.name.endsWith('.tsx')) {
        const source = readFileSync(fullPath, 'utf-8')
        const mapping = parseFormFile(source, entry.name)
        if (mapping) {
          formMappings[mapping.entity] = mapping
        }
      }
    }
  }

  scanDir(dirPath)
  return formMappings
}

function parseFormFile(source, filename) {
  // Extract entity name from filename: ContactForm.tsx -> contact
  const entityMatch = filename.match(/(\w+)Form\.tsx/)
  if (!entityMatch) return null
  const entity = entityMatch[1].toLowerCase()

  // Find FormData interface or initial form state
  const fields = {}

  // Look for aria-label or Label htmlFor to map field keys to UI labels
  const labelRegex = /(?:aria-label="([^"]+)"|Label\s+htmlFor="([^"]+)"[^>]*>([^<]+))/g
  const idToField = {}
  let match

  // Map id prefixes to field keys from onChange/onValueChange handlers
  // Look for patterns like: id="cf-firstName" ... set('firstName'
  // Limit search window to 300 chars to avoid cross-field matches
  const idRegex = /id="([^"]+)"/g
  const allIds = []
  while ((match = idRegex.exec(source)) !== null) {
    allIds.push({ id: match[1], pos: match.index })
  }
  for (const { id, pos } of allIds) {
    const window = source.slice(pos, pos + 300)
    const setMatch = window.match(/set\('(\w+)'/)
    if (setMatch) {
      idToField[id] = setMatch[1]
    }
  }

  // Extract field info from initialData or FormData interface
  const formDataRegex = /(?:initialData|FormData)[^{]*\{([^}]+)\}/
  const formDataMatch = source.match(formDataRegex)
  if (formDataMatch) {
    const body = formDataMatch[1]
    const fieldLines = body.matchAll(/(\w+)\s*[:=]\s*['"]?([^,\n]*)/g)
    for (const [, key] of fieldLines) {
      fields[key] = { key }
    }
  }

  // Find input elements and map them to field keys
  const inputRegex = /id="([^"]+)"[\s\S]*?aria-label="([^"]+)"/g
  while ((match = inputRegex.exec(source)) !== null) {
    const [, id, ariaLabel] = match
    const fieldKey = idToField[id]
    if (fieldKey && fields[fieldKey]) {
      fields[fieldKey].selector = `#${id}`
      fields[fieldKey].label = ariaLabel
    }
  }

  // Find the submit button
  const submitMatch = source.match(/aria-label="([^"]*[Ss]ubmit[^"]*)"/)
  const submitLabel = submitMatch ? submitMatch[1] : null

  // Find which page this form lives on — handle irregular plurals
  const plurals = { company: 'companies', activity: 'activities' }
  const pageMatch = plurals[entity] || entity + 's'

  return {
    entity,
    page: `/${pageMatch}`,
    fields,
    submitLabel,
  }
}

// ─── Step 4: Generate tool definitions ───

function generateTools(interfaces, unionTypes, storeOps, formMappings) {
  const tools = []

  for (const [sliceName, { entityType, operations }] of Object.entries(storeOps)) {
    const entityFields = interfaces[entityType]
    if (!entityFields) continue

    const formMapping = formMappings[entityType.toLowerCase()]

    for (const op of operations) {
      switch (op.operation) {
        case 'create': {
          const properties = {}
          const required = []

          for (const [fieldName, fieldInfo] of Object.entries(entityFields)) {
            const prop = { type: fieldInfo.type }
            if (fieldInfo.enum) prop.enum = fieldInfo.enum
            if (fieldInfo.items) prop.items = fieldInfo.items
            if (formMapping?.fields[fieldName]?.label) {
              prop.description = formMapping.fields[fieldName].label
            }
            properties[fieldName] = prop

            // Fields are required if: not nullable, not an enum (enums have defaults),
            // not in the "typically optional" list, and are a simple string without defaults
            const hasDefault = fieldInfo.enum || fieldInfo.nullable
            const typicallyOptional = ['notes', 'phone', 'title', 'owner', 'closeDate', 'website', 'address', 'size', 'industry', 'dueDate', 'probability']
            if (!hasDefault && !typicallyOptional.includes(fieldName)) {
              // For create forms, check if the form has a default value for this field
              const formField = formMapping?.fields[fieldName]
              required.push(fieldName)
            }
          }

          tools.push({
            name: `create_${entityType.toLowerCase()}`,
            description: `Create a new ${entityType.toLowerCase()}`,
            parameters: { type: 'object', properties, required },
            ui: formMapping ? {
              page: formMapping.page,
              trigger: `button:Add ${entityType}`,
              fields: Object.fromEntries(
                Object.entries(formMapping.fields)
                  .filter(([, v]) => v.selector)
                  .map(([k, v]) => [k, v.selector])
              ),
              submit: formMapping.submitLabel,
            } : null,
          })
          break
        }

        case 'update': {
          const properties = { id: { type: 'string', description: `${entityType} ID` } }
          for (const [fieldName, fieldInfo] of Object.entries(entityFields)) {
            const prop = { type: fieldInfo.type }
            if (fieldInfo.enum) prop.enum = fieldInfo.enum
            if (fieldInfo.items) prop.items = fieldInfo.items
            properties[fieldName] = prop
          }

          tools.push({
            name: `update_${entityType.toLowerCase()}`,
            description: `Update an existing ${entityType.toLowerCase()}`,
            parameters: { type: 'object', properties, required: ['id'] },
          })
          break
        }

        case 'delete': {
          tools.push({
            name: `delete_${entityType.toLowerCase()}`,
            description: `Delete a ${entityType.toLowerCase()}`,
            parameters: {
              type: 'object',
              properties: { id: { type: 'string', description: `${entityType} ID` } },
              required: ['id'],
            },
          })
          break
        }

        case 'list': {
          tools.push({
            name: `list_${sliceName}`,
            description: `List all ${sliceName}`,
            parameters: { type: 'object', properties: {}, required: [] },
          })
          break
        }
      }
    }
  }

  return tools
}

// ─── Run ───

const typesSource = readFileSync(typesPath, 'utf-8')
const { interfaces, unionTypes } = parseInterfaces(typesSource)
console.log(`Found ${Object.keys(interfaces).length} entity types: ${Object.keys(interfaces).join(', ')}`)

const storeOps = parseStoreSlices(storePath)
console.log(`Found store operations for: ${Object.keys(storeOps).join(', ')}`)

const formMappings = parseFormComponents(formsPath)
console.log(`Found form components for: ${Object.keys(formMappings).join(', ')}`)
console.log()

const tools = generateTools(interfaces, unionTypes, storeOps, formMappings)

const output = {
  version: '1.0',
  generatedAt: new Date().toISOString(),
  source: { types: typesPath, store: storePath, forms: formsPath },
  tools,
}

writeFileSync(outPath, JSON.stringify(output, null, 2))
console.log(`Generated ${tools.length} tools → ${outPath}`)
