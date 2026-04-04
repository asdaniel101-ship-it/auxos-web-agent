# Agent Validation & Pushback Design

**Date:** 2026-04-04
**Problem:** The CRM agent has no input validation, no smart defaults, and inconsistent pushback behavior. Users get asked unnecessary questions or get garbage data written silently.

## Design

Two changes, both scoped to the CRM agent layer:

### 1. System Prompt: Action-biased with smart defaults

Update the behavior guidelines to:
- **Bias toward action**: When the user gives partial info, fill in reasonable defaults rather than asking for every field. Generate emails from names (e.g., `alex.chen@quantumlabs.com`), default status to "lead", default stage to "Prospecting", assign to "Sarah Chen" if no owner specified.
- **Only ask when truly ambiguous**: If the user says "create a contact" with no name at all, ask. If they say "add Alex Chen at Acme", just do it.
- **Error recovery**: When a tool returns an error, explain what went wrong in plain language and suggest a fix. Don't silently retry with the same bad data.
- **Destructive action guardrail**: For deletes and bulk updates, confirm with the user before executing. "I'm about to delete 5 contacts — want me to proceed?"

### 2. Tool-level validation in `tools.ts`

Add validation to `create_*` and `update_*` tool execute functions:

**Contacts:**
- Email format: basic regex check, return `{ success: false, error: "Invalid email format for '...'. Please provide a valid email." }`
- Duplicate detection: check if a contact with the same email already exists, return `{ success: false, error: "A contact with email '...' already exists: [Name] (ID). Did you mean to update them?" }`

**Deals:**
- Value must be > 0: return error if zero or negative
- Stage must be valid (already enforced by enum, but double-check at runtime)

**Companies:**
- Duplicate detection: check if company name already exists (case-insensitive), return helpful error

**Tasks:**
- Name must be non-empty (already required, but validate the string isn't whitespace)

**General pattern for all create tools:**
```typescript
// Before writing to store:
if (!input.email || !(input.email as string).includes('@')) {
  return { success: false, error: `Invalid email "${input.email}". Please provide a valid email address.` }
}
const existing = store.contacts.find(c => c.email === input.email)
if (existing) {
  return { success: false, error: `Contact with email "${input.email}" already exists: ${existing.firstName} ${existing.lastName}. Use update_contact to modify them.` }
}
```

### What we're NOT doing
- No confirmation middleware (kills the autonomous UX)
- No client-side form validation (agent writes directly to store)
- No schema-level changes (Anthropic API already enforces required fields)
- No changes to the agent loop in `useAgent.ts` (error propagation already works)

## Files to change
1. `crm/src/agent/system-prompt.ts` — update behavior guidelines
2. `crm/src/agent/tools.ts` — add validation to create/update execute functions

## Success criteria
- Agent fills in reasonable defaults when user gives partial info
- Agent asks for clarification only when request is truly unclear
- Duplicate contacts/companies are caught before creation
- Invalid emails are rejected with clear error messages
- Delete/bulk operations prompt for confirmation
- Error messages are human-readable and guide Claude to course-correct
