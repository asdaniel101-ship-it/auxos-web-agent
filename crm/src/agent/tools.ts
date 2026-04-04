import { custom, search } from '@auxos/agent'
import type { AuxosTool } from '@auxos/agent'
import type { CrmStore } from '@/store'
import type { DealStage, ContactStatus, TaskPriority, TaskStatus, ChartType, Report, Settings } from '@/types'

export function createCrmTools(getStore: () => CrmStore): AuxosTool[] {
  return [
    // ─── Navigation ───
    custom({
      name: 'navigate_to',
      description: 'Navigate to a page or entity detail. For top-level pages, use just `page`. For entity detail pages (e.g., a specific deal or contact), also provide `entityId`.',
      parameters: {
        type: 'object',
        properties: {
          page: {
            type: 'string',
            description: 'Page to navigate to',
            enum: ['dashboard', 'contacts', 'companies', 'deals', 'tasks', 'emails', 'reports', 'settings'],
          },
          entityId: {
            type: 'string',
            description: 'Optional entity ID to navigate to a detail page (e.g., deal ID to go to /deals/dl-009)',
          },
        },
        required: ['page'],
      },
      execute: (input) => {
        const path = input.entityId
          ? `/${input.page}/${input.entityId}`
          : `/${input.page}`
        return { success: true, data: { navigate: path } }
      },
    }),

    // ─── Search ───
    search({
      scope: 'crm',
      description: 'Search across all CRM entities (contacts, companies, deals) by name or email. Returns matching results.',
      execute: (query: string) => {
        const store = getStore()
        const q = query.toLowerCase()
        const contacts = store.contacts
          .filter(
            (c) =>
              `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
              c.email.toLowerCase().includes(q)
          )
          .map((c) => ({
            id: c.id,
            name: `${c.firstName} ${c.lastName}`,
            email: c.email,
            type: 'contact' as const,
          }))
        const companies = store.companies
          .filter((c) => c.name.toLowerCase().includes(q))
          .map((c) => ({ id: c.id, name: c.name, type: 'company' as const }))
        const deals = store.deals
          .filter((d) => d.name.toLowerCase().includes(q))
          .map((d) => ({ id: d.id, name: d.name, value: d.value, type: 'deal' as const }))
        return { contacts, companies, deals }
      },
    }),

    // ─── Contacts ───
    custom({
      name: 'list_contacts',
      description: 'List contacts with optional filters',
      parameters: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['lead', 'prospect', 'customer', 'churned'], description: 'Filter by status' },
          owner: { type: 'string', description: 'Filter by owner name' },
          company: { type: 'string', description: 'Filter by company name' },
        },
        required: [],
      },
      execute: (input) => {
        const store = getStore()
        let filtered = [...store.contacts]
        if (input.status) filtered = filtered.filter((c) => c.status === input.status)
        if (input.owner) filtered = filtered.filter((c) => c.owner === input.owner)
        if (input.company) {
          const companyName = (input.company as string).toLowerCase()
          const companyIds = store.companies
            .filter((co) => co.name.toLowerCase().includes(companyName))
            .map((co) => co.id)
          filtered = filtered.filter((c) => c.companyId && companyIds.includes(c.companyId))
        }
        const data = filtered.map((c) => ({
          id: c.id,
          name: `${c.firstName} ${c.lastName}`,
          email: c.email,
          company: c.companyId
            ? store.companies.find((co) => co.id === c.companyId)?.name ?? null
            : null,
          status: c.status,
          owner: c.owner,
        }))
        return { success: true, data }
      },
    }),

    custom({
      name: 'get_contact',
      description: 'Get details of a specific contact by ID',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Contact ID' },
        },
        required: ['id'],
      },
      execute: (input) => {
        const store = getStore()
        const contact = store.contacts.find((c) => c.id === input.id)
        if (!contact) return { success: false, error: 'Contact not found' }
        const company = contact.companyId
          ? store.companies.find((co) => co.id === contact.companyId)
          : null
        return {
          success: true,
          data: { ...contact, companyName: company?.name ?? null },
        }
      },
    }),

    custom({
      name: 'create_contact',
      description: 'Create a new contact',
      parameters: {
        type: 'object',
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string' },
          phone: { type: 'string' },
          title: { type: 'string' },
          companyId: { type: 'string', description: 'ID of associated company' },
          companyName: { type: 'string', description: 'Name of company to associate (will be looked up or created)' },
          status: { type: 'string', enum: ['lead', 'prospect', 'customer', 'churned'] },
          owner: { type: 'string', description: 'Owner name (team member)' },
          notes: { type: 'string' },
        },
        required: ['firstName', 'lastName', 'email'],
      },
      execute: (input) => {
        const store = getStore()
        let companyId = (input.companyId as string) || null
        if (!companyId && input.companyName) {
          const name = (input.companyName as string).toLowerCase()
          const existing = store.companies.find((c) => c.name.toLowerCase() === name)
          if (existing) {
            companyId = existing.id
          } else {
            const newCompany = store.addCompany({
              name: input.companyName as string,
              industry: '',
              size: '',
              revenue: 0,
              website: '',
              address: '',
              notes: '',
            })
            companyId = newCompany.id
          }
        }
        const contact = store.addContact({
          firstName: input.firstName as string,
          lastName: input.lastName as string,
          email: input.email as string,
          phone: (input.phone as string) || '',
          title: (input.title as string) || '',
          companyId,
          status: (input.status as ContactStatus) || 'lead',
          owner: (input.owner as string) || '',
          lastContacted: new Date().toISOString(),
          notes: (input.notes as string) || '',
        })
        store.addActivity({
          type: 'contact_created',
          description: `Created contact ${contact.firstName} ${contact.lastName}`,
          entityType: 'contact',
          entityId: contact.id,
          userId: 'agent',
        })
        return {
          success: true,
          data: { id: contact.id, name: `${contact.firstName} ${contact.lastName}` },
        }
      },
    }),

    custom({
      name: 'update_contact',
      description: 'Update an existing contact',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Contact ID' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string' },
          phone: { type: 'string' },
          title: { type: 'string' },
          status: { type: 'string', enum: ['lead', 'prospect', 'customer', 'churned'] },
          owner: { type: 'string' },
          notes: { type: 'string' },
        },
        required: ['id'],
      },
      execute: (input) => {
        const store = getStore()
        const id = input.id as string
        const contact = store.contacts.find((c) => c.id === id)
        if (!contact) return { success: false, error: 'Contact not found' }
        const { id: _id, ...updates } = input
        store.updateContact(id, updates as Partial<typeof contact>)
        store.addActivity({
          type: 'contact_updated',
          description: `Updated contact ${contact.firstName} ${contact.lastName}`,
          entityType: 'contact',
          entityId: id,
          userId: 'agent',
        })
        return { success: true, data: { id } }
      },
    }),

    custom({
      name: 'delete_contact',
      description: 'Delete a contact',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Contact ID' },
        },
        required: ['id'],
      },
      execute: (input) => {
        const store = getStore()
        const id = input.id as string
        const contact = store.contacts.find((c) => c.id === id)
        if (!contact) return { success: false, error: 'Contact not found' }
        store.deleteContact(id)
        store.addActivity({
          type: 'contact_deleted',
          description: `Deleted contact ${contact.firstName} ${contact.lastName}`,
          entityType: 'contact',
          entityId: id,
          userId: 'agent',
        })
        return { success: true, data: { id } }
      },
    }),

    custom({
      name: 'bulk_update_contacts',
      description: 'Update multiple contacts at once',
      parameters: {
        type: 'object',
        properties: {
          ids: { type: 'array', items: { type: 'string' }, description: 'Contact IDs to update' },
          owner: { type: 'string', description: 'New owner' },
          status: { type: 'string', enum: ['lead', 'prospect', 'customer', 'churned'] },
        },
        required: ['ids'],
      },
      execute: (input) => {
        const store = getStore()
        const ids = input.ids as string[]
        const updates: Record<string, unknown> = {}
        if (input.owner) updates.owner = input.owner
        if (input.status) updates.status = input.status
        store.bulkUpdateContacts(ids, updates)
        for (const id of ids) {
          const contact = store.contacts.find((c) => c.id === id)
          store.addActivity({
            type: 'contact_updated',
            description: `Bulk updated contact ${contact ? `${contact.firstName} ${contact.lastName}` : id}`,
            entityType: 'contact',
            entityId: id,
            userId: 'agent',
          })
        }
        return { success: true, data: { updatedCount: ids.length } }
      },
    }),

    // ─── Companies ───
    custom({
      name: 'list_companies',
      description: 'List all companies with optional filters',
      parameters: {
        type: 'object',
        properties: {
          industry: { type: 'string', description: 'Filter by industry' },
        },
        required: [],
      },
      execute: (input) => {
        const store = getStore()
        let filtered = [...store.companies]
        if (input.industry) {
          const industry = (input.industry as string).toLowerCase()
          filtered = filtered.filter((c) => c.industry.toLowerCase().includes(industry))
        }
        const data = filtered.map((c) => ({
          id: c.id,
          name: c.name,
          industry: c.industry,
          size: c.size,
          contactCount: store.contacts.filter((ct) => ct.companyId === c.id).length,
          dealCount: store.deals.filter((d) => d.companyId === c.id).length,
        }))
        return { success: true, data }
      },
    }),

    custom({
      name: 'get_company',
      description: 'Get company details by ID',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      execute: (input) => {
        const store = getStore()
        const company = store.companies.find((c) => c.id === input.id)
        if (!company) return { success: false, error: 'Company not found' }
        return {
          success: true,
          data: {
            ...company,
            contactCount: store.contacts.filter((c) => c.companyId === company.id).length,
            dealCount: store.deals.filter((d) => d.companyId === company.id).length,
          },
        }
      },
    }),

    custom({
      name: 'create_company',
      description: 'Create a new company',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          industry: { type: 'string' },
          size: { type: 'string' },
          website: { type: 'string' },
          address: { type: 'string' },
          notes: { type: 'string' },
        },
        required: ['name'],
      },
      execute: (input) => {
        const store = getStore()
        const company = store.addCompany({
          name: input.name as string,
          industry: (input.industry as string) || '',
          size: (input.size as string) || '',
          revenue: 0,
          website: (input.website as string) || '',
          address: (input.address as string) || '',
          notes: (input.notes as string) || '',
        })
        store.addActivity({
          type: 'company_created',
          description: `Created company ${company.name}`,
          entityType: 'company',
          entityId: company.id,
          userId: 'agent',
        })
        return { success: true, data: { id: company.id, name: company.name } }
      },
    }),

    custom({
      name: 'update_company',
      description: 'Update an existing company',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          industry: { type: 'string' },
          size: { type: 'string' },
          website: { type: 'string' },
          address: { type: 'string' },
          notes: { type: 'string' },
        },
        required: ['id'],
      },
      execute: (input) => {
        const store = getStore()
        const id = input.id as string
        const company = store.companies.find((c) => c.id === id)
        if (!company) return { success: false, error: 'Company not found' }
        const { id: _id, ...updates } = input
        store.updateCompany(id, updates as Partial<typeof company>)
        store.addActivity({
          type: 'company_updated',
          description: `Updated company ${company.name}`,
          entityType: 'company',
          entityId: id,
          userId: 'agent',
        })
        return { success: true, data: { id } }
      },
    }),

    // ─── Deals ───
    custom({
      name: 'list_deals',
      description: 'List deals with optional filters',
      parameters: {
        type: 'object',
        properties: {
          stage: { type: 'string', enum: ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'] },
          owner: { type: 'string' },
          minValue: { type: 'number', description: 'Minimum deal value' },
          maxValue: { type: 'number', description: 'Maximum deal value' },
        },
        required: [],
      },
      execute: (input) => {
        const store = getStore()
        let filtered = [...store.deals]
        if (input.stage) filtered = filtered.filter((d) => d.stage === input.stage)
        if (input.owner) filtered = filtered.filter((d) => d.owner === input.owner)
        if (input.minValue != null)
          filtered = filtered.filter((d) => d.value >= (input.minValue as number))
        if (input.maxValue != null)
          filtered = filtered.filter((d) => d.value <= (input.maxValue as number))
        const data = filtered.map((d) => ({
          id: d.id,
          name: d.name,
          value: d.value,
          stage: d.stage,
          owner: d.owner,
          company: d.companyId
            ? store.companies.find((c) => c.id === d.companyId)?.name ?? null
            : null,
        }))
        return { success: true, data }
      },
    }),

    custom({
      name: 'get_deal',
      description: 'Get deal details by ID',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      execute: (input) => {
        const store = getStore()
        const deal = store.deals.find((d) => d.id === input.id)
        if (!deal) return { success: false, error: 'Deal not found' }
        const company = deal.companyId
          ? store.companies.find((c) => c.id === deal.companyId)
          : null
        const contacts = deal.contactIds
          .map((cid) => {
            const c = store.contacts.find((ct) => ct.id === cid)
            return c ? { id: c.id, name: `${c.firstName} ${c.lastName}`, email: c.email, title: c.title } : null
          })
          .filter(Boolean)
        const linkedTasks = store.tasks.filter((t) => t.linkedDealId === deal.id)
        return {
          success: true,
          data: {
            ...deal,
            companyName: company?.name ?? null,
            contacts,
            linkedTasks: linkedTasks.map((t) => ({
              id: t.id,
              name: t.name,
              status: t.status,
            })),
          },
        }
      },
    }),

    custom({
      name: 'create_deal',
      description: 'Create a new deal',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          companyId: { type: 'string' },
          companyName: { type: 'string', description: 'Company name (will be looked up)' },
          contactIds: { type: 'array', items: { type: 'string' } },
          value: { type: 'number' },
          stage: { type: 'string', enum: ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'] },
          owner: { type: 'string' },
          closeDate: { type: 'string' },
          probability: { type: 'number' },
          notes: { type: 'string' },
        },
        required: ['name', 'value', 'stage'],
      },
      execute: (input) => {
        const store = getStore()
        let companyId = (input.companyId as string) || null
        if (!companyId && input.companyName) {
          const name = (input.companyName as string).toLowerCase()
          const existing = store.companies.find((c) => c.name.toLowerCase() === name)
          if (existing) {
            companyId = existing.id
          }
        }
        const deal = store.addDeal({
          name: input.name as string,
          companyId,
          contactIds: (input.contactIds as string[]) || [],
          value: input.value as number,
          stage: (input.stage as DealStage) || 'Prospecting',
          owner: (input.owner as string) || '',
          closeDate: (input.closeDate as string) || '',
          probability: (input.probability as number) ?? 0,
          notes: (input.notes as string) || '',
        })
        store.addActivity({
          type: 'deal_created',
          description: `Created deal ${deal.name} worth $${deal.value.toLocaleString()}`,
          entityType: 'deal',
          entityId: deal.id,
          userId: 'agent',
        })
        return { success: true, data: { id: deal.id, name: deal.name, value: deal.value } }
      },
    }),

    custom({
      name: 'update_deal',
      description: 'Update an existing deal',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          value: { type: 'number' },
          stage: { type: 'string', enum: ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'] },
          owner: { type: 'string' },
          closeDate: { type: 'string' },
          probability: { type: 'number' },
          notes: { type: 'string' },
        },
        required: ['id'],
      },
      execute: (input) => {
        const store = getStore()
        const id = input.id as string
        const deal = store.deals.find((d) => d.id === id)
        if (!deal) return { success: false, error: 'Deal not found' }
        const { id: _id, ...updates } = input
        store.updateDeal(id, updates as Partial<typeof deal>)
        store.addActivity({
          type: 'deal_updated',
          description: `Updated deal ${deal.name}`,
          entityType: 'deal',
          entityId: id,
          userId: 'agent',
        })
        return { success: true, data: { id } }
      },
    }),

    custom({
      name: 'move_deal_stage',
      description: 'Move a deal to a different pipeline stage',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Deal ID' },
          stage: { type: 'string', enum: ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'] },
        },
        required: ['id', 'stage'],
      },
      execute: (input) => {
        const store = getStore()
        const id = input.id as string
        const newStage = input.stage as DealStage
        const deal = store.deals.find((d) => d.id === id)
        if (!deal) return { success: false, error: 'Deal not found' }
        const oldStage = deal.stage
        store.moveDealStage(id, newStage)
        store.addActivity({
          type: 'deal_stage_changed',
          description: `Moved ${deal.name} from ${oldStage} to ${newStage}`,
          entityType: 'deal',
          entityId: id,
          userId: 'agent',
        })
        return { success: true, data: { id, oldStage, newStage } }
      },
    }),

    // ─── Tasks ───
    custom({
      name: 'list_tasks',
      description: 'List tasks with optional filters',
      parameters: {
        type: 'object',
        properties: {
          assignee: { type: 'string' },
          priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
          status: { type: 'string', enum: ['todo', 'in-progress', 'done'] },
        },
        required: [],
      },
      execute: (input) => {
        const store = getStore()
        let filtered = [...store.tasks]
        if (input.assignee) filtered = filtered.filter((t) => t.assignee === input.assignee)
        if (input.priority) filtered = filtered.filter((t) => t.priority === input.priority)
        if (input.status) filtered = filtered.filter((t) => t.status === input.status)
        const data = filtered.map((t) => ({
          id: t.id,
          name: t.name,
          assignee: t.assignee,
          dueDate: t.dueDate,
          priority: t.priority,
          status: t.status,
        }))
        return { success: true, data }
      },
    }),

    custom({
      name: 'get_task',
      description: 'Get task details by ID',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      execute: (input) => {
        const store = getStore()
        const task = store.tasks.find((t) => t.id === input.id)
        if (!task) return { success: false, error: 'Task not found' }
        const linkedDeal = task.linkedDealId
          ? store.deals.find((d) => d.id === task.linkedDealId)
          : null
        const linkedContact = task.linkedContactId
          ? store.contacts.find((c) => c.id === task.linkedContactId)
          : null
        return {
          success: true,
          data: {
            ...task,
            linkedDealName: linkedDeal?.name ?? null,
            linkedContactName: linkedContact
              ? `${linkedContact.firstName} ${linkedContact.lastName}`
              : null,
          },
        }
      },
    }),

    custom({
      name: 'create_task',
      description: 'Create a new task',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          assignee: { type: 'string' },
          priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
          dueDate: { type: 'string', description: 'ISO date string' },
          linkedDealId: { type: 'string' },
          linkedContactId: { type: 'string' },
          notes: { type: 'string' },
        },
        required: ['name', 'assignee'],
      },
      execute: (input) => {
        const store = getStore()
        const task = store.addTask({
          name: input.name as string,
          assignee: input.assignee as string,
          priority: (input.priority as TaskPriority) || 'medium',
          status: 'todo' as TaskStatus,
          dueDate: (input.dueDate as string) || '',
          linkedDealId: (input.linkedDealId as string) || null,
          linkedContactId: (input.linkedContactId as string) || null,
          notes: (input.notes as string) || '',
        })
        store.addActivity({
          type: 'task_created',
          description: `Created task "${task.name}"`,
          entityType: 'task',
          entityId: task.id,
          userId: 'agent',
        })
        return { success: true, data: { id: task.id, name: task.name } }
      },
    }),

    custom({
      name: 'update_task',
      description: 'Update an existing task',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          assignee: { type: 'string' },
          priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
          status: { type: 'string', enum: ['todo', 'in-progress', 'done'] },
          dueDate: { type: 'string' },
          notes: { type: 'string' },
        },
        required: ['id'],
      },
      execute: (input) => {
        const store = getStore()
        const id = input.id as string
        const task = store.tasks.find((t) => t.id === id)
        if (!task) return { success: false, error: 'Task not found' }
        const { id: _id, ...updates } = input
        store.updateTask(id, updates as Partial<typeof task>)
        store.addActivity({
          type: 'task_updated',
          description: `Updated task "${task.name}"`,
          entityType: 'task',
          entityId: id,
          userId: 'agent',
        })
        return { success: true, data: { id } }
      },
    }),

    custom({
      name: 'complete_task',
      description: 'Mark a task as done',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      execute: (input) => {
        const store = getStore()
        const id = input.id as string
        const task = store.tasks.find((t) => t.id === id)
        if (!task) return { success: false, error: 'Task not found' }
        store.completeTask(id)
        store.addActivity({
          type: 'task_completed',
          description: `Completed task "${task.name}"`,
          entityType: 'task',
          entityId: id,
          userId: 'agent',
        })
        return { success: true, data: { id } }
      },
    }),

    // ─── Emails ───
    custom({
      name: 'list_emails',
      description: 'List email threads',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
      execute: () => {
        const store = getStore()
        const data = store.emailThreads.map((t) => ({
          id: t.id,
          subject: t.subject,
          participants: t.participants,
          messageCount: t.messages.length,
          latestTimestamp:
            t.messages.length > 0
              ? t.messages[t.messages.length - 1].timestamp
              : t.createdAt,
        }))
        return { success: true, data }
      },
    }),

    custom({
      name: 'get_email_thread',
      description: 'Get an email thread by ID',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      execute: (input) => {
        const store = getStore()
        const thread = store.emailThreads.find((t) => t.id === input.id)
        if (!thread) return { success: false, error: 'Email thread not found' }
        return { success: true, data: thread }
      },
    }),

    custom({
      name: 'send_email',
      description: 'Send a new email (creates a new thread)',
      parameters: {
        type: 'object',
        properties: {
          to: { type: 'string' },
          subject: { type: 'string' },
          body: { type: 'string' },
          linkedContactId: { type: 'string' },
          linkedDealId: { type: 'string' },
        },
        required: ['to', 'subject', 'body'],
      },
      execute: (input) => {
        const store = getStore()
        const messageId = `msg-${Date.now()}`
        const thread = store.addEmailThread({
          subject: input.subject as string,
          participants: ['Sarah Chen', input.to as string],
          messages: [
            {
              id: messageId,
              from: 'Sarah Chen',
              to: input.to as string,
              body: input.body as string,
              timestamp: new Date().toISOString(),
            },
          ],
          linkedContactId: (input.linkedContactId as string) || null,
          linkedDealId: (input.linkedDealId as string) || null,
        })
        store.addActivity({
          type: 'email_sent',
          description: `Sent email "${input.subject as string}" to ${input.to as string}`,
          entityType: 'email',
          entityId: thread.id,
          userId: 'agent',
        })
        return { success: true, data: { threadId: thread.id, subject: thread.subject } }
      },
    }),

    custom({
      name: 'draft_email',
      description: 'Open the email compose form pre-filled with the given values. Does NOT send the email — lets the user review and edit first. Use this when the user asks to "send an email" or "write an email" to someone from a deal context.',
      parameters: {
        type: 'object',
        properties: {
          to: { type: 'string', description: 'Recipient email address' },
          subject: { type: 'string', description: 'Email subject line' },
          body: { type: 'string', description: 'Email body text' },
          linkedContactId: { type: 'string', description: 'Contact ID to link' },
          linkedDealId: { type: 'string', description: 'Deal ID to link' },
        },
        required: ['to', 'subject', 'body'],
      },
      execute: (input) => {
        const store = getStore()
        store.setEmailDraft({
          to: input.to as string,
          subject: input.subject as string,
          body: input.body as string,
          linkedContactId: (input.linkedContactId as string) || '',
          linkedDealId: (input.linkedDealId as string) || '',
        })
        return {
          success: true,
          data: {
            navigate: '/emails',
            drafted: true,
            to: input.to,
            subject: input.subject,
          },
        }
      },
    }),

    custom({
      name: 'reply_to_email',
      description: 'Reply to an existing email thread',
      parameters: {
        type: 'object',
        properties: {
          threadId: { type: 'string' },
          body: { type: 'string' },
        },
        required: ['threadId', 'body'],
      },
      execute: (input) => {
        const store = getStore()
        const threadId = input.threadId as string
        const thread = store.emailThreads.find((t) => t.id === threadId)
        if (!thread) return { success: false, error: 'Email thread not found' }
        const lastMessage = thread.messages[thread.messages.length - 1]
        const to = lastMessage.from === 'Sarah Chen' ? lastMessage.to : lastMessage.from
        store.replyToThread(threadId, {
          from: 'Sarah Chen',
          to,
          body: input.body as string,
        })
        store.addActivity({
          type: 'email_sent',
          description: `Replied to email thread "${thread.subject}"`,
          entityType: 'email',
          entityId: threadId,
          userId: 'agent',
        })
        return { success: true, data: { threadId } }
      },
    }),

    // ─── Reports ───
    custom({
      name: 'list_reports',
      description: 'List available reports',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
      execute: () => {
        const store = getStore()
        const data = store.reports.map((r) => ({
          id: r.id,
          name: r.name,
          type: r.type,
          chartType: r.chartType,
          createdAt: r.createdAt,
        }))
        return { success: true, data }
      },
    }),

    custom({
      name: 'generate_report',
      description: 'Generate/create a new report',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          type: { type: 'string', enum: ['revenue-by-month', 'deals-by-stage', 'contacts-by-source', 'tasks-by-owner', 'pipeline-forecast', 'custom'] },
          chartType: { type: 'string', enum: ['bar', 'line', 'pie'] },
          dateRange: {
            type: 'object',
            properties: {
              start: { type: 'string' },
              end: { type: 'string' },
            },
          },
          filters: { type: 'object' },
        },
        required: ['name', 'type'],
      },
      execute: (input) => {
        const store = getStore()
        const now = new Date().toISOString().split('T')[0]
        const report = store.addReport({
          name: input.name as string,
          type: input.type as Report['type'],
          chartType: (input.chartType as ChartType) || 'bar',
          filters: (input.filters as Record<string, string>) || {},
          dateRange: (input.dateRange as { start: string; end: string }) || {
            start: now,
            end: now,
          },
        })
        store.addActivity({
          type: 'report_generated',
          description: `Generated report "${report.name}"`,
          entityType: 'report',
          entityId: report.id,
          userId: 'agent',
        })
        return { success: true, data: { id: report.id, name: report.name } }
      },
    }),

    // ─── Settings ───
    custom({
      name: 'get_settings',
      description: 'Get current CRM settings',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
      execute: () => {
        const store = getStore()
        return { success: true, data: store.settings }
      },
    }),

    custom({
      name: 'update_settings',
      description: 'Update CRM settings',
      parameters: {
        type: 'object',
        properties: {
          notifications: {
            type: 'object',
            properties: {
              email: { type: 'boolean' },
              inApp: { type: 'boolean' },
              dailyDigest: { type: 'boolean' },
            },
          },
          integrations: {
            type: 'object',
            properties: {
              slack: { type: 'boolean' },
              gmail: { type: 'boolean' },
              calendar: { type: 'boolean' },
            },
          },
        },
        required: [],
      },
      execute: (input) => {
        const store = getStore()
        const updates: Partial<Settings> = {}
        if (input.notifications) {
          updates.notifications = input.notifications as Settings['notifications']
        }
        if (input.integrations) {
          updates.integrations = input.integrations as Settings['integrations']
        }
        store.updateSettings(updates)
        return { success: true, data: store.settings }
      },
    }),

    custom({
      name: 'invite_team_member',
      description: 'Invite a new team member',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
          role: { type: 'string', enum: ['admin', 'manager', 'member'] },
        },
        required: ['name', 'email', 'role'],
      },
      execute: (input) => {
        const store = getStore()
        const member = store.addTeamMember({
          name: input.name as string,
          email: input.email as string,
          role: input.role as 'admin' | 'manager' | 'member',
          avatar: '',
        })
        return { success: true, data: { id: member.id, name: member.name, email: member.email } }
      },
    }),

    // ─── Composite: Onboard Client ───
    custom({
      name: 'onboard_client',
      description: 'Full client onboarding: creates company, contact, deal, and standard onboarding tasks',
      parameters: {
        type: 'object',
        properties: {
          companyName: { type: 'string' },
          contactFirstName: { type: 'string' },
          contactLastName: { type: 'string' },
          contactEmail: { type: 'string' },
          contactTitle: { type: 'string' },
          dealValue: { type: 'number' },
          dealStage: { type: 'string', enum: ['Prospecting', 'Qualification', 'Proposal', 'Negotiation'] },
          owner: { type: 'string', description: 'Team member to assign everything to' },
        },
        required: ['companyName', 'contactFirstName', 'contactLastName', 'contactEmail', 'dealValue'],
      },
      execute: (input) => {
        const store = getStore()
        const owner = (input.owner as string) || ''
        const dealStage = (input.dealStage as DealStage) || 'Prospecting'

        // 1. Create or find company
        const companyNameInput = input.companyName as string
        const existingCompany = store.companies.find(
          (c) => c.name.toLowerCase() === companyNameInput.toLowerCase()
        )
        let company: { id: string; name: string }
        if (existingCompany) {
          company = { id: existingCompany.id, name: existingCompany.name }
        } else {
          const newCompany = store.addCompany({
            name: companyNameInput,
            industry: '',
            size: '',
            revenue: 0,
            website: '',
            address: '',
            notes: '',
          })
          company = { id: newCompany.id, name: newCompany.name }
          store.addActivity({
            type: 'company_created',
            description: `Created company ${company.name}`,
            entityType: 'company',
            entityId: company.id,
            userId: 'agent',
          })
        }

        // 2. Create contact
        const contact = store.addContact({
          firstName: input.contactFirstName as string,
          lastName: input.contactLastName as string,
          email: input.contactEmail as string,
          phone: '',
          title: (input.contactTitle as string) || '',
          companyId: company.id,
          status: 'prospect',
          owner,
          lastContacted: new Date().toISOString(),
          notes: '',
        })
        store.addActivity({
          type: 'contact_created',
          description: `Created contact ${contact.firstName} ${contact.lastName}`,
          entityType: 'contact',
          entityId: contact.id,
          userId: 'agent',
        })

        // 3. Create deal
        const deal = store.addDeal({
          name: `${companyNameInput} Deal`,
          companyId: company.id,
          contactIds: [contact.id],
          value: input.dealValue as number,
          stage: dealStage,
          owner,
          closeDate: '',
          probability: 0,
          notes: '',
        })
        store.addActivity({
          type: 'deal_created',
          description: `Created deal ${deal.name} worth $${deal.value.toLocaleString()}`,
          entityType: 'deal',
          entityId: deal.id,
          userId: 'agent',
        })

        // 4. Create onboarding tasks
        const taskDefs = [
          { name: 'Welcome call', daysOut: 1 },
          { name: 'Send proposal', daysOut: 3 },
          { name: 'Schedule kickoff', daysOut: 5 },
          { name: 'Complete setup checklist', daysOut: 7 },
        ]

        const createdTasks: { id: string; name: string }[] = []
        for (const def of taskDefs) {
          const dueDate = new Date()
          dueDate.setDate(dueDate.getDate() + def.daysOut)
          const task = store.addTask({
            name: def.name,
            assignee: owner,
            priority: 'medium',
            status: 'todo',
            dueDate: dueDate.toISOString().split('T')[0],
            linkedDealId: deal.id,
            linkedContactId: contact.id,
            notes: '',
          })
          store.addActivity({
            type: 'task_created',
            description: `Created onboarding task "${task.name}"`,
            entityType: 'task',
            entityId: task.id,
            userId: 'agent',
          })
          createdTasks.push({ id: task.id, name: task.name })
        }

        return {
          success: true,
          data: {
            company: { id: company.id, name: company.name },
            contact: {
              id: contact.id,
              name: `${contact.firstName} ${contact.lastName}`,
            },
            deal: { id: deal.id, name: deal.name, value: deal.value },
            tasks: createdTasks,
          },
        }
      },
    }),
  ]
}
