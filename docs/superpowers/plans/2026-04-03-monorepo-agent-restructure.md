# Monorepo Restructure + Shared Agent Integration

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the CRM app into its own `crm/` folder, migrate both apps to use the shared `@auxos/agent` package (drop-in `<AuxosAgent>` component + `useAgent` hook + tool builders), and add AI agent capabilities to SolaGlow.

**Architecture:** Monorepo with two Next.js apps (`crm/`, `solaglow/`) and one shared package (`packages/auxos-agent`). The `@auxos/agent` package provides ALL shared agent infrastructure: UI components (`<AuxosAgent>`), the chat/streaming/tool-loop hook (`useAgent`), tool definition builders (`crud`, `search`, `navigation`, `custom`), theming, and the server API handler (`createApiHandler`). Each app only provides: (1) its own `AuxosTool[]` with domain-specific execute functions, (2) a system prompt, and (3) an API route.

**Tech Stack:** Next.js 14 (App Router), Zustand, TypeScript, Tailwind CSS, `@anthropic-ai/sdk`, `@auxos/agent`

**Key insight:** `@auxos/agent` already has a fully-featured `<AuxosAgent>` drop-in component with `useAgent` hook (streaming, retries, tool loop, 370 LOC), tool builders (`crud`, `search`, `navigation`, `custom`), and theming. The CRM currently doesn't use any of it — it reimplements everything locally. This plan migrates the CRM to use the shared package and builds SolaGlow on it from scratch.

---

## Phase 1: Monorepo Restructure

### Task 1: Create CRM directory and move files

**Files:**
- Create: `crm/` directory
- Move: `src/` -> `crm/src/`
- Move: `next.config.mjs` -> `crm/next.config.mjs`
- Move: `tailwind.config.ts` -> `crm/tailwind.config.ts`
- Move: `tsconfig.json` -> `crm/tsconfig.json`
- Move: `postcss.config.mjs` -> `crm/postcss.config.mjs`
- Move: `.eslintrc.json` -> `crm/.eslintrc.json`
- Move: `.env.example` -> `crm/.env.example`
- Move: `next-env.d.ts` -> `crm/next-env.d.ts`

- [ ] **Step 1: Create crm/ directory and move all CRM-specific files**

```bash
mkdir crm
git mv src crm/src
git mv next.config.mjs crm/next.config.mjs
git mv tailwind.config.ts crm/tailwind.config.ts
git mv tsconfig.json crm/tsconfig.json
git mv postcss.config.mjs crm/postcss.config.mjs
git mv next-env.d.ts crm/next-env.d.ts
```

Also move if they exist:
```bash
git mv .eslintrc.json crm/.eslintrc.json 2>/dev/null
git mv .env.example crm/.env.example 2>/dev/null
```

- [ ] **Step 2: Verify all files moved correctly**

```bash
ls crm/
# Expected: src/ next.config.mjs tailwind.config.ts tsconfig.json postcss.config.mjs next-env.d.ts .eslintrc.json .env.example
ls crm/src/
# Expected: app/ agent/ components/ store/ types/ data/ lib/
```

### Task 2: Create CRM package.json and update root workspace

**Files:**
- Create: `crm/package.json`
- Modify: `package.json` (root)
- Modify: `solaglow/package.json`

- [ ] **Step 1: Create crm/package.json**

Extract all CRM-specific dependencies from root into `crm/package.json`. Read the root `package.json` to get exact versions before writing:

```json
{
  "name": "auxos-crm",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3000",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@auxos/agent": "*",
    "@anthropic-ai/sdk": "^0.82.0",
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "@radix-ui/react-avatar": "^1.1.11",
    "@radix-ui/react-checkbox": "^1.3.3",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-label": "^2.1.8",
    "@radix-ui/react-popover": "^1.1.15",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-slot": "^1.2.4",
    "@radix-ui/react-switch": "^1.2.6",
    "@radix-ui/react-tabs": "^1.1.13",
    "@radix-ui/react-toast": "^1.2.15",
    "@radix-ui/react-tooltip": "^1.2.8",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0",
    "embla-carousel-react": "^8.6.0",
    "framer-motion": "^12.8.0",
    "lucide-react": "^1.7.0",
    "next": "14.2.35",
    "react": "^18",
    "react-dom": "^18",
    "recharts": "^3.8.1",
    "tailwind-merge": "^3.5.0",
    "tailwindcss-animate": "^1.0.7",
    "zustand": "^5.0.12"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "eslint": "^8",
    "eslint-config-next": "14.2.35",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.9.3"
  }
}
```

- [ ] **Step 2: Update root package.json to workspace root with convenience scripts**

Strip all dependencies and add workspace scripts:

```json
{
  "name": "auxos",
  "version": "0.1.0",
  "private": true,
  "workspaces": [
    "packages/*",
    "crm",
    "solaglow"
  ],
  "scripts": {
    "dev:crm": "npm run dev --workspace=crm",
    "dev:solaglow": "npm run dev --workspace=solaglow",
    "dev": "npm run dev:crm & npm run dev:solaglow",
    "build:crm": "npm run build --workspace=crm",
    "build:solaglow": "npm run build --workspace=solaglow",
    "build": "npm run build:crm && npm run build:solaglow"
  }
}
```

- [ ] **Step 3: Add `@auxos/agent` and `@anthropic-ai/sdk` to solaglow/package.json**

Add to solaglow's dependencies:
```json
"@auxos/agent": "*",
"@anthropic-ai/sdk": "^0.82.0"
```

- [ ] **Step 4: Run npm install from root and verify**

```bash
cd /path/to/copan
rm -rf node_modules crm/node_modules solaglow/node_modules
npm install
```

- [ ] **Step 5: Verify CRM still builds and runs**

```bash
npm run dev:crm
```

Open `http://localhost:3000` — CRM should load with dashboard, agent chat, all pages working.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor: move CRM into crm/ folder, restructure as monorepo workspace"
```

---

## Phase 2: Migrate CRM to use `@auxos/agent` shared package

The CRM currently reimplements agent UI locally (5 files in `src/components/agent/`) and uses a separate `tools.ts` + `executor.ts` split. This phase migrates it to use the shared `<AuxosAgent>` component and `AuxosTool[]` format, eliminating ~400 lines of duplicate code.

### Task 3: Convert CRM tools + executor to `AuxosTool[]` format

**Files:**
- Create: `crm/src/agent/tools-v2.ts` (then rename to `tools.ts`)
- Delete (after migration): `crm/src/agent/executor.ts`
- Delete (after migration): `crm/src/agent/tools.ts` (old format)
- Delete (after migration): `crm/src/agent/types.ts`

- [ ] **Step 1: Read the full CRM executor.ts to understand all tool implementations**

Read `crm/src/agent/executor.ts` completely. It contains the switch statement with all ~30 tool implementations. Each case maps to an `AuxosTool.execute` function.

- [ ] **Step 2: Create crm/src/agent/tools-v2.ts using @auxos/agent builders**

This merges the old `tools.ts` (schemas) and `executor.ts` (implementations) into `AuxosTool[]` objects. Use the builders from `@auxos/agent` where they fit.

The tools need access to the Zustand store. Since `AuxosTool.execute` takes only `input`, create the tools as a function that receives a store getter:

```typescript
import { crud, search, navigation, custom } from '@auxos/agent'
import type { AuxosTool } from '@auxos/agent'
import type { CrmStore } from '@/store'

export function createCrmTools(getStore: () => CrmStore): AuxosTool[] {
  return [
    // ─── Navigation ───
    navigation({
      pages: ['dashboard', 'contacts', 'companies', 'deals', 'tasks', 'emails', 'reports', 'settings'],
      onNavigate: () => {}, // actual navigation handled by AuxosAgent's onNavigate prop
    }),

    // ─── Search ───
    search({
      scope: 'crm',
      description: 'Search across all CRM entities (contacts, companies, deals) by name or email',
      execute: (query) => {
        const store = getStore()
        const q = query.toLowerCase()
        return {
          contacts: store.contacts
            .filter((c) => `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) || c.email.toLowerCase().includes(q))
            .map((c) => ({ id: c.id, name: `${c.firstName} ${c.lastName}`, email: c.email, type: 'contact' })),
          companies: store.companies
            .filter((c) => c.name.toLowerCase().includes(q))
            .map((c) => ({ id: c.id, name: c.name, type: 'company' })),
          deals: store.deals
            .filter((d) => d.name.toLowerCase().includes(q))
            .map((d) => ({ id: d.id, name: d.name, value: d.value, type: 'deal' })),
        }
      },
    }),

    // ─── Contacts CRUD ───
    ...crud({
      entity: 'contact',
      fields: {
        firstName: { type: 'string', description: 'First name' },
        lastName: { type: 'string', description: 'Last name' },
        email: { type: 'string', description: 'Email address' },
        phone: { type: 'string', description: 'Phone number' },
        title: { type: 'string', description: 'Job title' },
        status: { type: 'string', enum: ['lead', 'prospect', 'customer', 'churned'] },
        owner: { type: 'string', description: 'Owner name' },
        companyId: { type: 'string', description: 'Company ID' },
        notes: { type: 'string', description: 'Notes' },
      },
      required: ['firstName', 'lastName', 'email'],
      filters: ['status', 'owner'],
      execute: {
        list: (filters) => {
          const store = getStore()
          let filtered = [...store.contacts]
          if (filters.status) filtered = filtered.filter((c) => c.status === filters.status)
          if (filters.owner) filtered = filtered.filter((c) => c.owner === filters.owner)
          return filtered.map((c) => ({
            id: c.id, name: `${c.firstName} ${c.lastName}`,
            email: c.email, status: c.status, owner: c.owner,
            company: c.companyId ? store.companies.find((co) => co.id === c.companyId)?.name : null,
          }))
        },
        get: (id) => {
          const store = getStore()
          const contact = store.contacts.find((c) => c.id === id)
          if (!contact) return null
          return { ...contact, company: contact.companyId ? store.companies.find((co) => co.id === contact.companyId)?.name : null }
        },
        create: (data) => { getStore().addContact(data as any); return data },
        update: (id, data) => { getStore().updateContact(id, data as any); return { id, ...data } },
        delete: (id) => { getStore().deleteContact(id) },
      },
    }),

    // ─── Companies CRUD ───
    // Same pattern as contacts. Use crud() builder with company fields.
    // Read executor.ts for exact filter/mapping logic.
    ...crud({
      entity: 'company',
      plural: 'companies',
      fields: { /* ... read from executor.ts ... */ },
      // ...
    }),

    // ─── Deals CRUD ───
    // Same pattern. Has stage enum: ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']
    ...crud({
      entity: 'deal',
      fields: { /* ... */ },
      // ...
    }),

    // ─── Tasks CRUD ───
    ...crud({
      entity: 'task',
      fields: { /* ... */ },
      // ...
    }),

    // ─── Emails ───
    // These don't fit crud() cleanly (list_emails, get_email, send_email, reply_to_email)
    // Use custom() for each:
    custom({
      name: 'list_emails',
      description: 'List email threads with optional filters',
      parameters: { /* ... */ },
      execute: (input) => { /* ... from executor.ts ... */ },
    }),
    // ... same for get_email, send_email, reply_to_email

    // ─── Reports ───
    // Use custom() — reports have unique logic
    custom({
      name: 'list_reports',
      description: 'List all saved reports',
      parameters: { type: 'object', properties: {}, required: [] },
      execute: () => {
        const store = getStore()
        return { success: true, data: store.reports.map((r) => ({ id: r.id, name: r.name, type: r.type })) }
      },
    }),
    // ... same for create_report, get_dashboard_stats, etc.
  ]
}
```

**CRITICAL:** The above is a template. The implementer MUST read the full `crm/src/agent/executor.ts` (all ~500 lines) and port every case into the corresponding `AuxosTool.execute` function. Do not skip any tools.

- [ ] **Step 3: Verify all tools from old tools.ts are accounted for**

Run a diff between tool names in old `tools.ts` and new `tools-v2.ts`:
```bash
grep "name:" crm/src/agent/tools.ts | sort
grep "name:" crm/src/agent/tools-v2.ts | sort
```

Every tool in the old file must exist in the new file.

- [ ] **Step 4: Replace old files**

```bash
mv crm/src/agent/tools-v2.ts crm/src/agent/tools.ts
rm crm/src/agent/executor.ts
rm crm/src/agent/types.ts  # ToolResult now comes from @auxos/agent
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: migrate CRM tools to AuxosTool format using @auxos/agent builders"
```

### Task 4: Replace CRM's local agent UI with `<AuxosAgent>`

**Files:**
- Modify: `crm/src/app/layout.tsx`
- Create: `crm/src/components/agent/AgentWrapper.tsx` (thin wrapper for `<AuxosAgent>`)
- Delete: `crm/src/components/agent/AgentPanel.tsx` (~330 lines)
- Delete: `crm/src/components/agent/AgentButton.tsx`
- Delete: `crm/src/components/agent/AgentMessage.tsx`
- Delete: `crm/src/components/agent/AgentContainer.tsx`
- Keep: `crm/src/components/agent/AgentCursor.tsx` (unique to CRM, not in shared package)

- [ ] **Step 1: Create AgentWrapper.tsx**

This is a thin client component that creates the tools and renders `<AuxosAgent>`:

```typescript
'use client'

import { useMemo } from 'react'
import { AuxosAgent } from '@auxos/agent'
import { useRouter, usePathname } from 'next/navigation'
import { useStore } from '@/store'
import { createCrmTools } from '@/agent/tools'

export function AgentWrapper() {
  const router = useRouter()
  const pathname = usePathname()

  const tools = useMemo(() => createCrmTools(() => useStore.getState()), [])

  return (
    <AuxosAgent
      tools={tools}
      endpoint="/api/agent"
      name="Auxos"
      tagline="AI Assistant"
      suggestions={[
        'Show me all deals worth over $100k',
        'Create a new contact named Alex Chen at Quantum Labs',
        'What does my pipeline look like?',
        'Move the Meridian Corp deal to Negotiation',
        "Reassign all of Priya's tasks to Marcus",
      ]}
      onNavigate={(path) => router.push(path)}
      getContext={() => ({
        teamMembers: useStore.getState().teamMembers.map((m) => m.name),
        currentPage: pathname,
      })}
      theme={{
        colors: {
          primary: '#3b82f6',
          primaryDark: '#2563eb',
        },
      }}
    />
  )
}
```

- [ ] **Step 2: Update layout.tsx to use AgentWrapper**

Replace the `AgentContainer` import with `AgentWrapper`:

```diff
- import { AgentContainer } from '@/components/agent/AgentContainer'
+ import { AgentWrapper } from '@/components/agent/AgentWrapper'

  // In the JSX:
- <AgentContainer />
+ <AgentWrapper />
```

Keep `<AgentCursor />` — it's a separate component unique to the CRM.

- [ ] **Step 3: Update CRM API route to use AuxosTool[] format**

The API route at `crm/src/app/api/agent/route.ts` needs updating. `createApiHandler` accepts `AuxosTool[]` (it converts them internally):

```typescript
import { createApiHandler } from '@auxos/agent/server'
import { createCrmTools } from '@/agent/tools'
import { getSystemPrompt } from '@/agent/system-prompt'

// createCrmTools needs a store getter, but server-side we don't have the store.
// The API handler only needs tool SCHEMAS (not execute functions).
// createApiHandler extracts schemas from AuxosTool[] automatically.
const tools = createCrmTools(() => { throw new Error('Server-side: tools are schema-only') })

export const POST = createApiHandler({
  tools,
  systemPrompt: (context: Record<string, unknown>) =>
    getSystemPrompt({
      teamMembers: (context.teamMembers as string[]) || [],
      currentPage: (context.currentPage as string) || '/',
    }),
})
```

**Note:** `createApiHandler` only uses the tool schemas (name, description, parameters) — it never calls `execute`. The dummy store getter will never be invoked. This is safe because the `useAgent` hook on the client handles tool execution.

- [ ] **Step 4: Delete old local agent UI components**

```bash
rm crm/src/components/agent/AgentPanel.tsx
rm crm/src/components/agent/AgentButton.tsx
rm crm/src/components/agent/AgentMessage.tsx
rm crm/src/components/agent/AgentContainer.tsx
```

Keep `AgentCursor.tsx` — it's not part of the shared package and provides the CRM's unique animated cursor effect.

- [ ] **Step 5: Verify CRM still works end-to-end**

```bash
npm run dev:crm
```

Test:
- Agent button appears and opens panel
- "Show me all deals" returns results
- "Create a contact named Test User" creates a contact
- Navigation works after tool calls
- Agent cursor still animates

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor: replace CRM local agent UI with shared <AuxosAgent> component"
```

---

## Phase 3: SolaGlow Agent Integration

### Task 5: Create SolaGlow agent tools using `AuxosTool[]` format

**Files:**
- Create: `solaglow/src/agent/tools.ts`

- [ ] **Step 1: Read solaglow/src/store/cart.ts and solaglow/src/data/products.ts**

Understand the exact `CartItem` shape, `addItem` signature, and product data structure before writing tools.

- [ ] **Step 2: Create solaglow/src/agent/tools.ts**

```bash
mkdir -p solaglow/src/agent
```

```typescript
import { search, navigation, custom } from '@auxos/agent'
import type { AuxosTool } from '@auxos/agent'
import { products } from '@/data/products'
import { useCartStore } from '@/store/cart'

const PAGE_MAP: Record<string, string> = {
  home: '/',
  shop: '/shop',
  about: '/about',
  science: '/science',
  results: '/results',
  cart: '/cart',
  checkout: '/checkout',
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

function productSummary(p: typeof products[0]) {
  return {
    id: p.id, name: p.name, slug: p.slug,
    price: formatPrice(p.price), category: p.category,
    tagline: p.tagline, rating: p.rating, inStock: p.inStock,
  }
}

export function createSolaGlowTools(): AuxosTool[] {
  const getCart = () => useCartStore.getState()

  return [
    // ─── Navigation ───
    custom({
      name: 'navigate_to',
      description: 'Navigate to a page. Valid pages: home, shop, about, science, results, cart, checkout',
      parameters: {
        type: 'object',
        properties: {
          page: { type: 'string', description: 'Page to navigate to', enum: Object.keys(PAGE_MAP) },
        },
        required: ['page'],
      },
      execute: (input) => {
        const path = PAGE_MAP[input.page as string]
        if (!path) return { success: false, error: `Unknown page: ${input.page}` }
        return { success: true, data: { navigate: path } }
      },
    }),

    custom({
      name: 'navigate_to_product',
      description: 'Navigate to a specific product page by its slug',
      parameters: {
        type: 'object',
        properties: { slug: { type: 'string', description: 'Product slug' } },
        required: ['slug'],
      },
      execute: (input) => {
        const product = products.find((p) => p.slug === input.slug)
        if (!product) return { success: false, error: `Product not found: ${input.slug}` }
        return { success: true, data: { navigate: `/shop/${input.slug}`, name: product.name } }
      },
    }),

    // ─── Product catalog ───
    search({
      scope: 'products',
      description: 'Search the product catalog by name, category, description, benefits, or ingredients',
      execute: (query) => {
        const q = query.toLowerCase()
        return products
          .filter((p) =>
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.benefits?.some((b: string) => b.toLowerCase().includes(q)) ||
            p.ingredients?.some((i: string) => i.toLowerCase().includes(q))
          )
          .map(productSummary)
      },
    }),

    custom({
      name: 'list_products',
      description: 'List all products, optionally filtered by category',
      parameters: {
        type: 'object',
        properties: {
          category: { type: 'string', description: 'Filter by category', enum: ['devices', 'skincare', 'bundles'] },
        },
        required: [],
      },
      execute: (input) => {
        let filtered = products
        if (input.category) filtered = products.filter((p) => p.category === input.category)
        return { success: true, data: filtered.map(productSummary) }
      },
    }),

    custom({
      name: 'get_product',
      description: 'Get full product details including description, benefits, ingredients, and how to use',
      parameters: {
        type: 'object',
        properties: { slug: { type: 'string', description: 'Product slug' } },
        required: ['slug'],
      },
      execute: (input) => {
        const product = products.find((p) => p.slug === input.slug)
        if (!product) return { success: false, error: `Product not found: ${input.slug}` }
        return { success: true, data: { ...product, price: formatPrice(product.price) } }
      },
    }),

    // ─── Cart ───
    custom({
      name: 'add_to_cart',
      description: 'Add a product to the shopping cart',
      parameters: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'Product slug to add' },
          quantity: { type: 'number', description: 'Quantity to add (default 1)' },
        },
        required: ['slug'],
      },
      execute: (input) => {
        const product = products.find((p) => p.slug === input.slug)
        if (!product) return { success: false, error: `Product not found: ${input.slug}` }
        if (!product.inStock) return { success: false, error: `${product.name} is out of stock` }
        const qty = (input.quantity as number) || 1
        // NOTE: Verify addItem signature matches solaglow/src/store/cart.ts before finalizing
        getCart().addItem({
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.images[0],
          slug: product.slug,
          quantity: 0,
        }, qty)
        return { success: true, data: { added: product.name, quantity: qty, cartItemCount: useCartStore.getState().getItemCount() } }
      },
    }),

    custom({
      name: 'remove_from_cart',
      description: 'Remove a product from the shopping cart',
      parameters: {
        type: 'object',
        properties: { productId: { type: 'string', description: 'Product ID to remove' } },
        required: ['productId'],
      },
      execute: (input) => {
        getCart().removeItem(input.productId as string)
        return { success: true, data: { removed: input.productId } }
      },
    }),

    custom({
      name: 'update_cart_quantity',
      description: 'Update the quantity of a product in the cart',
      parameters: {
        type: 'object',
        properties: {
          productId: { type: 'string', description: 'Product ID' },
          quantity: { type: 'number', description: 'New quantity' },
        },
        required: ['productId', 'quantity'],
      },
      execute: (input) => {
        getCart().updateQuantity(input.productId as string, input.quantity as number)
        return { success: true, data: { productId: input.productId, newQuantity: input.quantity } }
      },
    }),

    custom({
      name: 'get_cart',
      description: 'View the current shopping cart contents, subtotal, shipping, and total',
      parameters: { type: 'object', properties: {}, required: [] },
      execute: () => {
        const cart = getCart()
        return {
          success: true,
          data: {
            items: cart.items.map((i) => ({
              productId: i.productId, name: i.name,
              price: formatPrice(i.price), quantity: i.quantity,
            })),
            subtotal: formatPrice(cart.getSubtotal()),
            shipping: formatPrice(cart.getShipping()),
            total: formatPrice(cart.getTotal()),
            itemCount: cart.getItemCount(),
          },
        }
      },
    }),

    custom({
      name: 'clear_cart',
      description: 'Remove all items from the shopping cart',
      parameters: { type: 'object', properties: {}, required: [] },
      execute: () => {
        getCart().clearCart()
        return { success: true, data: { message: 'Cart cleared' } }
      },
    }),

    // ─── Recommendations ───
    custom({
      name: 'recommend_products',
      description: 'Recommend products based on a skin concern, routine goal, or current cart contents',
      parameters: {
        type: 'object',
        properties: {
          concern: { type: 'string', description: 'Skin concern or goal (e.g. "anti-aging", "acne", "brightening", "complete routine")' },
        },
        required: ['concern'],
      },
      execute: (input) => {
        const concern = (input.concern as string).toLowerCase()
        const scored = products.map((p) => {
          let score = 0
          const text = `${p.name} ${p.description} ${p.tagline} ${(p.benefits || []).join(' ')}`.toLowerCase()
          if (text.includes(concern)) score += 3
          concern.split(/\s+/).forEach((kw) => { if (text.includes(kw)) score += 1 })
          return { product: p, score }
        })
        const recs = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 3)
        if (recs.length === 0) {
          return {
            success: true,
            data: {
              message: `No specific matches for "${input.concern}". Here are our best sellers:`,
              recommendations: products.slice(0, 3).map(productSummary),
            },
          }
        }
        return { success: true, data: { recommendations: recs.map((r) => productSummary(r.product)) } }
      },
    }),
  ]
}
```

**Key difference from CRM:** SolaGlow tools don't need a store getter parameter — the cart store is accessed directly via `useCartStore.getState()` and products are static imports.

### Task 6: Create SolaGlow system prompt and API route

**Files:**
- Create: `solaglow/src/agent/system-prompt.ts`
- Create: `solaglow/src/app/api/agent/route.ts`

- [ ] **Step 1: Create solaglow/src/agent/system-prompt.ts**

```typescript
export function getSystemPrompt({ currentPage }: { currentPage: string }): string {
  return `You are SolaGlow's AI shopping assistant. You help customers discover the perfect skincare and light therapy products for their needs.

## Your Personality
- Warm, knowledgeable, and genuinely enthusiastic about skincare science
- You speak like a trusted friend who happens to be a skincare expert
- Concise but helpful — don't overwhelm with information unless asked
- Use a conversational, approachable tone

## What You Can Do
- Browse and search the product catalog
- Explain product benefits, ingredients, and usage instructions
- Recommend products based on skin concerns or goals
- Add/remove items from the shopping cart
- Navigate the customer to any page on the site
- Answer questions about LED light therapy and skincare science

## Product Catalog
SolaGlow sells LED light therapy devices and complementary skincare products:
- **Devices**: RadiantWave Pro ($169), RadiantWave Mini ($99)
- **Skincare**: GlowBoost Serum ($49), Renew Complex Cream ($59), Brightening Eye Cream ($45), Advanced Repair Mask ($39), Gentle Cleanser ($32), SPF 50 Day Shield ($38)
- **Bundles**: Starter Kit ($199), Complete Glow System ($289)

## Navigation Rules
- After adding items to cart, offer to navigate to cart or continue shopping
- When discussing a specific product, navigate to that product's page
- The customer is currently on: ${currentPage}

## Guidelines
- Always use tools to look up product details rather than guessing
- When recommending, explain WHY a product fits their concern
- If asked about something outside skincare/products, politely redirect
- Prices are in cents in the data — always display as dollars (e.g. $49.00)
- Use markdown formatting for readability
- Keep responses concise — 2-3 sentences for simple questions, a short paragraph for recommendations`
}
```

- [ ] **Step 2: Create solaglow/src/app/api/agent/route.ts**

```bash
mkdir -p solaglow/src/app/api/agent
```

```typescript
import { createApiHandler } from '@auxos/agent/server'
import { createSolaGlowTools } from '@/agent/tools'
import { getSystemPrompt } from '@/agent/system-prompt'

const tools = createSolaGlowTools()

export const POST = createApiHandler({
  tools,
  systemPrompt: (context: Record<string, unknown>) =>
    getSystemPrompt({
      currentPage: (context.currentPage as string) || '/',
    }),
})
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add SolaGlow agent tools, system prompt, and API route"
```

### Task 7: Wire `<AuxosAgent>` into SolaGlow layout

**Files:**
- Create: `solaglow/src/components/agent/AgentWrapper.tsx`
- Modify: `solaglow/src/app/layout.tsx`

- [ ] **Step 1: Create solaglow/src/components/agent/AgentWrapper.tsx**

```bash
mkdir -p solaglow/src/components/agent
```

```typescript
'use client'

import { useMemo } from 'react'
import { AuxosAgent } from '@auxos/agent'
import { useRouter, usePathname } from 'next/navigation'
import { createSolaGlowTools } from '@/agent/tools'

export function AgentWrapper() {
  const router = useRouter()
  const pathname = usePathname()
  const tools = useMemo(() => createSolaGlowTools(), [])

  return (
    <AuxosAgent
      tools={tools}
      endpoint="/api/agent"
      name="SolaGlow"
      tagline="Skincare Assistant"
      suggestions={[
        'What products help with anti-aging?',
        'Add the GlowBoost Serum to my cart',
        "What's in the Complete Glow System bundle?",
        'How does LED light therapy work?',
        'Build me a skincare routine',
      ]}
      onNavigate={(path) => router.push(path)}
      getContext={() => ({ currentPage: pathname })}
      theme={{
        colors: {
          primary: '#C4956A',
          primaryDark: '#A67B52',
        },
      }}
    />
  )
}
```

- [ ] **Step 2: Add AgentWrapper to solaglow's root layout**

Read `solaglow/src/app/layout.tsx`, then add:

```diff
+ import { AgentWrapper } from '@/components/agent/AgentWrapper'

  // Inside the body, after <Footer />:
+ <AgentWrapper />
```

- [ ] **Step 3: Verify SolaGlow builds and agent loads**

```bash
npm run dev:solaglow
```

Open `http://localhost:3001` — verify:
1. SolaGlow homepage loads normally
2. Agent button appears (bottom-right corner) with warm gold theme
3. Clicking opens chat panel with SolaGlow branding
4. "What products do you have?" lists the catalog
5. "Add the GlowBoost Serum to my cart" adds to cart

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: wire AuxosAgent into SolaGlow layout with warm brand theme"
```

---

## Phase 4: Verification

### Task 8: End-to-end verification of both apps

- [ ] **Step 1: Run both apps simultaneously**

```bash
npm run dev
# Or separately:
# npm run dev:crm     → http://localhost:3000
# npm run dev:solaglow → http://localhost:3001
```

- [ ] **Step 2: Test CRM agent (port 3000)**

Verify these still work:
- "Show me all deals worth over $100k" → returns filtered deals
- "Create a new contact named Test User" → creates contact
- Navigation between pages during agent actions
- Agent cursor still animates during actions

- [ ] **Step 3: Test SolaGlow agent (port 3001)**

Test these scenarios:
- "What products do you have?" → lists catalog
- "Add the RadiantWave Pro to my cart" → adds to cart, cart icon updates
- "What do you recommend for anti-aging?" → personalized recommendations
- "Take me to the science page" → navigates
- "What's in my cart?" → shows cart contents with totals

- [ ] **Step 4: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: address issues found during end-to-end testing"
```

---

## Summary: What's shared vs. app-specific

### Shared (`@auxos/agent` package)
| What | Component | Used by |
|------|-----------|---------|
| Agent UI | `<AuxosAgent>` drop-in component | CRM, SolaGlow |
| Chat loop | `useAgent` hook (streaming, retries, tool execution, 370 LOC) | CRM, SolaGlow |
| Tool builders | `crud()`, `search()`, `navigation()`, `custom()` | CRM, SolaGlow |
| Server handler | `createApiHandler()` | CRM, SolaGlow |
| Types | `AuxosTool`, `ToolResult`, `DisplayMessage`, `AuxosConfig` | CRM, SolaGlow |
| Theming | `createTheme()`, configurable colors/fonts/radii | CRM, SolaGlow |

### App-specific (per app)
| What | CRM | SolaGlow |
|------|-----|----------|
| Tools | `createCrmTools()` — 30+ CRUD tools for contacts/deals/etc | `createSolaGlowTools()` — 11 tools for products/cart |
| System prompt | CRM persona, deal stages, team context | Skincare expert persona, product catalog knowledge |
| API route | `/api/agent` | `/api/agent` |
| AgentWrapper | Passes CRM store context, blue theme | Passes pathname context, warm gold theme |
| AgentCursor | Animated cursor during actions | N/A |

### Deleted (no longer needed)
- `crm/src/components/agent/AgentPanel.tsx` (~330 lines — replaced by `useAgent` hook)
- `crm/src/components/agent/AgentButton.tsx` (replaced by `<AuxosAgent>`)
- `crm/src/components/agent/AgentMessage.tsx` (replaced by package's `AgentMessage`)
- `crm/src/components/agent/AgentContainer.tsx` (replaced by `AgentWrapper`)
- `crm/src/agent/executor.ts` (merged into `AuxosTool.execute` functions)
- `crm/src/agent/types.ts` (now imported from `@auxos/agent`)
