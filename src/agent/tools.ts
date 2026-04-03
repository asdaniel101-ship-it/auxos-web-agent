import { Tool } from '@anthropic-ai/sdk/resources/messages'

export const tools: Tool[] = [
  {
    name: 'navigate_to',
    description: 'Navigate to a page in the CRM. Valid pages: dashboard, contacts, companies, deals, tasks, emails, reports, settings',
    input_schema: {
      type: 'object' as const,
      properties: {
        page: { type: 'string', description: 'Page to navigate to', enum: ['dashboard', 'contacts', 'companies', 'deals', 'tasks', 'emails', 'reports', 'settings'] }
      },
      required: ['page']
    }
  },
  {
    name: 'search_crm',
    description: 'Search across all CRM entities (contacts, companies, deals) by name or email. Returns matching results.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Search query' }
      },
      required: ['query']
    }
  },
  // Contacts
  {
    name: 'list_contacts',
    description: 'List contacts with optional filters',
    input_schema: {
      type: 'object' as const,
      properties: {
        status: { type: 'string', enum: ['lead', 'prospect', 'customer', 'churned'], description: 'Filter by status' },
        owner: { type: 'string', description: 'Filter by owner name' },
        company: { type: 'string', description: 'Filter by company name' }
      },
      required: []
    }
  },
  {
    name: 'get_contact',
    description: 'Get details of a specific contact by ID',
    input_schema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: 'Contact ID' }
      },
      required: ['id']
    }
  },
  {
    name: 'create_contact',
    description: 'Create a new contact',
    input_schema: {
      type: 'object' as const,
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
        notes: { type: 'string' }
      },
      required: ['firstName', 'lastName', 'email']
    }
  },
  {
    name: 'update_contact',
    description: 'Update an existing contact',
    input_schema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: 'Contact ID' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        title: { type: 'string' },
        status: { type: 'string', enum: ['lead', 'prospect', 'customer', 'churned'] },
        owner: { type: 'string' },
        notes: { type: 'string' }
      },
      required: ['id']
    }
  },
  {
    name: 'delete_contact',
    description: 'Delete a contact',
    input_schema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: 'Contact ID' }
      },
      required: ['id']
    }
  },
  {
    name: 'bulk_update_contacts',
    description: 'Update multiple contacts at once',
    input_schema: {
      type: 'object' as const,
      properties: {
        ids: { type: 'array', items: { type: 'string' }, description: 'Contact IDs to update' },
        owner: { type: 'string', description: 'New owner' },
        status: { type: 'string', enum: ['lead', 'prospect', 'customer', 'churned'] }
      },
      required: ['ids']
    }
  },
  // Companies
  {
    name: 'list_companies',
    description: 'List all companies with optional filters',
    input_schema: {
      type: 'object' as const,
      properties: {
        industry: { type: 'string', description: 'Filter by industry' }
      },
      required: []
    }
  },
  {
    name: 'get_company',
    description: 'Get company details by ID',
    input_schema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string' }
      },
      required: ['id']
    }
  },
  {
    name: 'create_company',
    description: 'Create a new company',
    input_schema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string' },
        industry: { type: 'string' },
        size: { type: 'string' },
        website: { type: 'string' },
        address: { type: 'string' },
        notes: { type: 'string' }
      },
      required: ['name']
    }
  },
  {
    name: 'update_company',
    description: 'Update an existing company',
    input_schema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        industry: { type: 'string' },
        size: { type: 'string' },
        website: { type: 'string' },
        address: { type: 'string' },
        notes: { type: 'string' }
      },
      required: ['id']
    }
  },
  // Deals
  {
    name: 'list_deals',
    description: 'List deals with optional filters',
    input_schema: {
      type: 'object' as const,
      properties: {
        stage: { type: 'string', enum: ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'] },
        owner: { type: 'string' },
        minValue: { type: 'number', description: 'Minimum deal value' },
        maxValue: { type: 'number', description: 'Maximum deal value' }
      },
      required: []
    }
  },
  {
    name: 'get_deal',
    description: 'Get deal details by ID',
    input_schema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string' }
      },
      required: ['id']
    }
  },
  {
    name: 'create_deal',
    description: 'Create a new deal',
    input_schema: {
      type: 'object' as const,
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
        notes: { type: 'string' }
      },
      required: ['name', 'value', 'stage']
    }
  },
  {
    name: 'update_deal',
    description: 'Update an existing deal',
    input_schema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        value: { type: 'number' },
        stage: { type: 'string', enum: ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'] },
        owner: { type: 'string' },
        closeDate: { type: 'string' },
        probability: { type: 'number' },
        notes: { type: 'string' }
      },
      required: ['id']
    }
  },
  {
    name: 'move_deal_stage',
    description: 'Move a deal to a different pipeline stage',
    input_schema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: 'Deal ID' },
        stage: { type: 'string', enum: ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'] }
      },
      required: ['id', 'stage']
    }
  },
  // Tasks
  {
    name: 'list_tasks',
    description: 'List tasks with optional filters',
    input_schema: {
      type: 'object' as const,
      properties: {
        assignee: { type: 'string' },
        priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
        status: { type: 'string', enum: ['todo', 'in-progress', 'done'] }
      },
      required: []
    }
  },
  {
    name: 'get_task',
    description: 'Get task details by ID',
    input_schema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string' }
      },
      required: ['id']
    }
  },
  {
    name: 'create_task',
    description: 'Create a new task',
    input_schema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string' },
        assignee: { type: 'string' },
        priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
        dueDate: { type: 'string', description: 'ISO date string' },
        linkedDealId: { type: 'string' },
        linkedContactId: { type: 'string' },
        notes: { type: 'string' }
      },
      required: ['name', 'assignee']
    }
  },
  {
    name: 'update_task',
    description: 'Update an existing task',
    input_schema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        assignee: { type: 'string' },
        priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
        status: { type: 'string', enum: ['todo', 'in-progress', 'done'] },
        dueDate: { type: 'string' },
        notes: { type: 'string' }
      },
      required: ['id']
    }
  },
  {
    name: 'complete_task',
    description: 'Mark a task as done',
    input_schema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string' }
      },
      required: ['id']
    }
  },
  // Emails
  {
    name: 'list_emails',
    description: 'List email threads',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: []
    }
  },
  {
    name: 'get_email_thread',
    description: 'Get an email thread by ID',
    input_schema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string' }
      },
      required: ['id']
    }
  },
  {
    name: 'send_email',
    description: 'Send a new email (creates a new thread)',
    input_schema: {
      type: 'object' as const,
      properties: {
        to: { type: 'string' },
        subject: { type: 'string' },
        body: { type: 'string' },
        linkedContactId: { type: 'string' },
        linkedDealId: { type: 'string' }
      },
      required: ['to', 'subject', 'body']
    }
  },
  {
    name: 'reply_to_email',
    description: 'Reply to an existing email thread',
    input_schema: {
      type: 'object' as const,
      properties: {
        threadId: { type: 'string' },
        body: { type: 'string' }
      },
      required: ['threadId', 'body']
    }
  },
  // Reports
  {
    name: 'list_reports',
    description: 'List available reports',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: []
    }
  },
  {
    name: 'generate_report',
    description: 'Generate/create a new report',
    input_schema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string' },
        type: { type: 'string', enum: ['revenue-by-month', 'deals-by-stage', 'contacts-by-source', 'tasks-by-owner', 'pipeline-forecast', 'custom'] },
        chartType: { type: 'string', enum: ['bar', 'line', 'pie'] },
        dateRange: {
          type: 'object',
          properties: {
            start: { type: 'string' },
            end: { type: 'string' }
          }
        },
        filters: { type: 'object' }
      },
      required: ['name', 'type']
    }
  },
  // Settings
  {
    name: 'get_settings',
    description: 'Get current CRM settings',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: []
    }
  },
  {
    name: 'update_settings',
    description: 'Update CRM settings',
    input_schema: {
      type: 'object' as const,
      properties: {
        notifications: {
          type: 'object',
          properties: {
            email: { type: 'boolean' },
            inApp: { type: 'boolean' },
            dailyDigest: { type: 'boolean' }
          }
        },
        integrations: {
          type: 'object',
          properties: {
            slack: { type: 'boolean' },
            gmail: { type: 'boolean' },
            calendar: { type: 'boolean' }
          }
        }
      },
      required: []
    }
  },
  {
    name: 'invite_team_member',
    description: 'Invite a new team member',
    input_schema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
        role: { type: 'string', enum: ['admin', 'manager', 'member'] }
      },
      required: ['name', 'email', 'role']
    }
  },
  // Composite
  {
    name: 'onboard_client',
    description: 'Full client onboarding: creates company, contact, deal, and standard onboarding tasks',
    input_schema: {
      type: 'object' as const,
      properties: {
        companyName: { type: 'string' },
        contactFirstName: { type: 'string' },
        contactLastName: { type: 'string' },
        contactEmail: { type: 'string' },
        contactTitle: { type: 'string' },
        dealValue: { type: 'number' },
        dealStage: { type: 'string', enum: ['Prospecting', 'Qualification', 'Proposal', 'Negotiation'] },
        owner: { type: 'string', description: 'Team member to assign everything to' }
      },
      required: ['companyName', 'contactFirstName', 'contactLastName', 'contactEmail', 'dealValue']
    }
  }
]
