import { CrmStore } from '@/store'
import { ToolResult } from './types'
import { DealStage, ContactStatus, TaskPriority, TaskStatus, ChartType, Report, Settings } from '@/types'

export function executeTool(
  toolName: string,
  input: Record<string, unknown>,
  store: CrmStore
): ToolResult {
  try {
    switch (toolName) {
      // ─── Navigation ───
      case 'navigate_to': {
        const page = input.page as string
        return { success: true, data: { navigate: '/' + page } }
      }

      // ─── Search ───
      case 'search_crm': {
        const query = (input.query as string).toLowerCase()
        const contacts = store.contacts
          .filter(
            (c) =>
              `${c.firstName} ${c.lastName}`.toLowerCase().includes(query) ||
              c.email.toLowerCase().includes(query)
          )
          .map((c) => ({
            id: c.id,
            name: `${c.firstName} ${c.lastName}`,
            email: c.email,
            type: 'contact' as const,
          }))
        const companies = store.companies
          .filter((c) => c.name.toLowerCase().includes(query))
          .map((c) => ({ id: c.id, name: c.name, type: 'company' as const }))
        const deals = store.deals
          .filter((d) => d.name.toLowerCase().includes(query))
          .map((d) => ({ id: d.id, name: d.name, value: d.value, type: 'deal' as const }))
        return { success: true, data: { contacts, companies, deals } }
      }

      // ─── Contacts ───
      case 'list_contacts': {
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
      }

      case 'get_contact': {
        const contact = store.contacts.find((c) => c.id === input.id)
        if (!contact) return { success: false, error: 'Contact not found' }
        const company = contact.companyId
          ? store.companies.find((co) => co.id === contact.companyId)
          : null
        return {
          success: true,
          data: { ...contact, companyName: company?.name ?? null },
        }
      }

      case 'create_contact': {
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
      }

      case 'update_contact': {
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
      }

      case 'delete_contact': {
        const id = input.id as string
        const contact = store.contacts.find((c) => c.id === id)
        if (!contact) return { success: false, error: 'Contact not found' }
        store.deleteContact(id)
        store.addActivity({
          type: 'contact_updated',
          description: `Deleted contact ${contact.firstName} ${contact.lastName}`,
          entityType: 'contact',
          entityId: id,
          userId: 'agent',
        })
        return { success: true, data: { id } }
      }

      case 'bulk_update_contacts': {
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
      }

      // ─── Companies ───
      case 'list_companies': {
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
      }

      case 'get_company': {
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
      }

      case 'create_company': {
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
      }

      case 'update_company': {
        const id = input.id as string
        const company = store.companies.find((c) => c.id === id)
        if (!company) return { success: false, error: 'Company not found' }
        const { id: _id, ...updates } = input
        store.updateCompany(id, updates as Partial<typeof company>)
        store.addActivity({
          type: 'company_created',
          description: `Updated company ${company.name}`,
          entityType: 'company',
          entityId: id,
          userId: 'agent',
        })
        return { success: true, data: { id } }
      }

      // ─── Deals ───
      case 'list_deals': {
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
      }

      case 'get_deal': {
        const deal = store.deals.find((d) => d.id === input.id)
        if (!deal) return { success: false, error: 'Deal not found' }
        const company = deal.companyId
          ? store.companies.find((c) => c.id === deal.companyId)
          : null
        const contactNames = deal.contactIds
          .map((cid) => {
            const c = store.contacts.find((ct) => ct.id === cid)
            return c ? `${c.firstName} ${c.lastName}` : null
          })
          .filter(Boolean)
        const linkedTasks = store.tasks.filter((t) => t.linkedDealId === deal.id)
        return {
          success: true,
          data: {
            ...deal,
            companyName: company?.name ?? null,
            contactNames,
            linkedTasks: linkedTasks.map((t) => ({
              id: t.id,
              name: t.name,
              status: t.status,
            })),
          },
        }
      }

      case 'create_deal': {
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
      }

      case 'update_deal': {
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
      }

      case 'move_deal_stage': {
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
      }

      // ─── Tasks ───
      case 'list_tasks': {
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
      }

      case 'get_task': {
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
      }

      case 'create_task': {
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
      }

      case 'update_task': {
        const id = input.id as string
        const task = store.tasks.find((t) => t.id === id)
        if (!task) return { success: false, error: 'Task not found' }
        const { id: _id, ...updates } = input
        store.updateTask(id, updates as Partial<typeof task>)
        store.addActivity({
          type: 'task_created',
          description: `Updated task "${task.name}"`,
          entityType: 'task',
          entityId: id,
          userId: 'agent',
        })
        return { success: true, data: { id } }
      }

      case 'complete_task': {
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
      }

      // ─── Emails ───
      case 'list_emails': {
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
      }

      case 'get_email_thread': {
        const thread = store.emailThreads.find((t) => t.id === input.id)
        if (!thread) return { success: false, error: 'Email thread not found' }
        return { success: true, data: thread }
      }

      case 'send_email': {
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
      }

      case 'reply_to_email': {
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
      }

      // ─── Reports ───
      case 'list_reports': {
        const data = store.reports.map((r) => ({
          id: r.id,
          name: r.name,
          type: r.type,
          chartType: r.chartType,
          createdAt: r.createdAt,
        }))
        return { success: true, data }
      }

      case 'generate_report': {
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
          type: 'note_added',
          description: `Generated report "${report.name}"`,
          entityType: 'deal',
          entityId: report.id,
          userId: 'agent',
        })
        return { success: true, data: { id: report.id, name: report.name } }
      }

      // ─── Settings ───
      case 'get_settings': {
        return { success: true, data: store.settings }
      }

      case 'update_settings': {
        const updates: Partial<Settings> = {}
        if (input.notifications) {
          updates.notifications = input.notifications as Settings['notifications']
        }
        if (input.integrations) {
          updates.integrations = input.integrations as Settings['integrations']
        }
        store.updateSettings(updates)
        return { success: true, data: store.settings }
      }

      case 'invite_team_member': {
        const member = store.addTeamMember({
          name: input.name as string,
          email: input.email as string,
          role: input.role as 'admin' | 'manager' | 'member',
          avatar: '',
        })
        return { success: true, data: { id: member.id, name: member.name, email: member.email } }
      }

      // ─── Composite: Onboard Client ───
      case 'onboard_client': {
        const owner = (input.owner as string) || ''
        const dealStage = (input.dealStage as DealStage) || 'Prospecting'

        // 1. Create or find company
        const companyNameInput = input.companyName as string
        let existingCompany = store.companies.find(
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
      }

      default:
        return { success: false, error: `Unknown tool: ${toolName}` }
    }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}
