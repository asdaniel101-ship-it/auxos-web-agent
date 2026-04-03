import type { AuxosTool, CrudConfig, CrudField, SearchConfig, NavigationConfig } from '../types'

function normalizeField(field: CrudField | string): CrudField {
  if (typeof field === 'string') return { type: field as CrudField['type'] }
  return field
}

function fieldToSchema(field: CrudField): Record<string, unknown> {
  const schema: Record<string, unknown> = { type: field.type }
  if (field.description) schema.description = field.description
  if (field.enum) schema.enum = field.enum
  if (field.items) schema.items = field.items
  return schema
}

/**
 * Generate CRUD tools for an entity.
 *
 * ```ts
 * const contactTools = crud({
 *   entity: 'contact',
 *   fields: {
 *     firstName: 'string',
 *     lastName: 'string',
 *     email: 'string',
 *     status: { type: 'string', enum: ['lead', 'customer'] },
 *   },
 *   required: ['firstName', 'lastName', 'email'],
 *   filters: ['status'],
 *   execute: {
 *     list: (filters) => db.contacts.findMany({ where: filters }),
 *     get: (id) => db.contacts.findUnique({ where: { id } }),
 *     create: (data) => db.contacts.create({ data }),
 *     update: (id, data) => db.contacts.update({ where: { id }, data }),
 *     delete: (id) => db.contacts.delete({ where: { id } }),
 *   },
 * })
 * ```
 */
export function crud(config: CrudConfig): AuxosTool[] {
  const { entity, fields, required = [], filters = [], execute } = config
  const plural = config.plural || entity + 's'
  const normalized = Object.fromEntries(
    Object.entries(fields).map(([k, v]) => [k, normalizeField(v)])
  )

  const tools: AuxosTool[] = []

  // list
  const filterProps: Record<string, unknown> = {}
  for (const f of filters) {
    if (normalized[f]) {
      filterProps[f] = { ...fieldToSchema(normalized[f]), description: `Filter by ${f}` }
    }
  }
  tools.push({
    name: `list_${plural}`,
    description: `List ${plural} with optional filters`,
    parameters: {
      type: 'object',
      properties: filterProps,
      required: [],
    },
    execute: (input) => {
      const result = execute.list(input)
      return { success: true, data: result }
    },
  })

  // get
  tools.push({
    name: `get_${entity}`,
    description: `Get ${entity} details by ID`,
    parameters: {
      type: 'object',
      properties: { id: { type: 'string', description: `${entity} ID` } },
      required: ['id'],
    },
    execute: (input) => {
      const result = execute.get(input.id as string)
      if (!result) return { success: false, error: `${entity} not found` }
      return { success: true, data: result }
    },
  })

  // create
  const createProps: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(normalized)) {
    createProps[k] = fieldToSchema(v)
  }
  tools.push({
    name: `create_${entity}`,
    description: `Create a new ${entity}`,
    parameters: {
      type: 'object',
      properties: createProps,
      required,
    },
    execute: (input) => {
      const result = execute.create(input)
      return { success: true, data: result }
    },
  })

  // update
  const updateProps: Record<string, unknown> = {
    id: { type: 'string', description: `${entity} ID` },
  }
  for (const [k, v] of Object.entries(normalized)) {
    updateProps[k] = fieldToSchema(v)
  }
  tools.push({
    name: `update_${entity}`,
    description: `Update an existing ${entity}`,
    parameters: {
      type: 'object',
      properties: updateProps,
      required: ['id'],
    },
    execute: (input) => {
      const { id, ...data } = input
      const result = execute.update(id as string, data)
      if (!result) return { success: false, error: `${entity} not found` }
      return { success: true, data: result }
    },
  })

  // delete (optional)
  if (execute.delete) {
    tools.push({
      name: `delete_${entity}`,
      description: `Delete a ${entity}`,
      parameters: {
        type: 'object',
        properties: { id: { type: 'string', description: `${entity} ID` } },
        required: ['id'],
      },
      execute: (input) => {
        execute.delete!(input.id as string)
        return { success: true, data: { id: input.id } }
      },
    })
  }

  return tools
}

/**
 * Generate a search tool.
 *
 * ```ts
 * const searchTool = search({
 *   scope: 'crm',
 *   description: 'Search across contacts, companies, and deals',
 *   execute: (query) => searchIndex.search(query),
 * })
 * ```
 */
export function search(config: SearchConfig): AuxosTool {
  return {
    name: `search_${config.scope}`,
    description: config.description,
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
      },
      required: ['query'],
    },
    execute: (input) => {
      const result = config.execute(input.query as string)
      return { success: true, data: result }
    },
  }
}

/**
 * Generate a navigation tool.
 *
 * ```ts
 * const navTool = navigation({
 *   pages: ['dashboard', 'contacts', 'settings'],
 *   onNavigate: (page) => router.push('/' + page),
 * })
 * ```
 */
export function navigation(config: NavigationConfig): AuxosTool {
  return {
    name: 'navigate_to',
    description: `Navigate to a page. Valid pages: ${config.pages.join(', ')}`,
    parameters: {
      type: 'object',
      properties: {
        page: {
          type: 'string',
          description: 'Page to navigate to',
          enum: config.pages,
        },
      },
      required: ['page'],
    },
    execute: (input) => {
      config.onNavigate(input.page as string)
      return { success: true, data: { navigate: '/' + input.page } }
    },
  }
}

/**
 * Create a custom one-off tool.
 *
 * ```ts
 * const tool = custom({
 *   name: 'onboard_client',
 *   description: 'Full client onboarding workflow',
 *   parameters: { ... },
 *   execute: async (input) => { ... },
 * })
 * ```
 */
export function custom(tool: AuxosTool): AuxosTool {
  return tool
}
