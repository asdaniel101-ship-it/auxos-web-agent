'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  ChevronRight,
  ChevronDown,
  Search,
  BookOpen,
  Users,
  Building2,
  Handshake,
  CheckSquare,
  Mail,
  BarChart3,
  Settings,
  Clock,
  AlertCircle,
  Info,
  FileText,
  Lightbulb,
  Link2,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Dense sidebar navigation data – intentionally overwhelming
// ---------------------------------------------------------------------------
const docSections = [
  {
    title: 'Getting Started',
    icon: BookOpen,
    articles: [
      'Platform Overview & System Requirements',
      'Quickstart: Your First 30 Minutes',
      'Understanding the CRM Navigation',
      'Account Setup & Initial Configuration',
      'Importing Your Existing Data',
      'User Roles & Permission Levels',
      'Configuring Your Workspace Preferences',
      'Browser Compatibility & Troubleshooting',
    ],
  },
  {
    title: 'Contacts Management',
    icon: Users,
    articles: [
      'Creating a New Contact Record',
      'Editing Contact Information',
      'Merging Duplicate Contacts',
      'Contact List Views & Filters',
      'Custom Fields for Contacts',
      'Importing Contacts via CSV',
      'Exporting Contact Data',
      'Contact Activity Timeline',
      'Linking Contacts to Companies',
      'Contact Tags & Segments',
      'Bulk Actions on Contacts',
      'Archiving & Deleting Contacts',
    ],
  },
  {
    title: 'Companies',
    icon: Building2,
    articles: [
      'Adding a New Company',
      'Company Detail Page Overview',
      'Associating Contacts with Companies',
      'Company Custom Fields',
      'Company Hierarchies (Parent/Child)',
      'Tracking Company Revenue',
      'Company List Filtering & Sorting',
      'Importing Companies from External Sources',
    ],
  },
  {
    title: 'Deals & Pipeline',
    icon: Handshake,
    articles: [
      'Understanding Deal Stages',
      'Creating a New Deal',
      'Moving Deals Through the Pipeline',
      'Kanban View vs. List View',
      'Deal Custom Fields & Properties',
      'Forecasting & Weighted Pipeline',
      'Assigning Deals to Team Members',
      'Deal Win/Loss Analysis',
      'Configuring Pipeline Stages',
      'Deal Activity & Notes',
      'Bulk Updating Deal Stages',
      'Reporting on Deal Velocity',
    ],
  },
  {
    title: 'Tasks & Activities',
    icon: CheckSquare,
    articles: [
      'Creating Tasks Manually',
      'Task Due Dates & Reminders',
      'Recurring Tasks Setup',
      'Task Assignment & Delegation',
      'Filtering Tasks by Status',
      'Linking Tasks to Deals or Contacts',
      'Completing & Archiving Tasks',
      'Task Templates',
      'Calendar Integration for Tasks',
    ],
  },
  {
    title: 'Email Integration',
    icon: Mail,
    articles: [
      'Connecting Your Email Account',
      'Sending Emails from the CRM',
      'Email Templates & Snippets',
      'Email Tracking (Opens & Clicks)',
      'Logging Emails to Contact Records',
      'Bulk Email Campaigns',
      'Email Scheduling',
      'Managing Email Signatures',
      'Troubleshooting Email Sync Issues',
      'Email Deliverability Best Practices',
    ],
  },
  {
    title: 'Reports & Analytics',
    icon: BarChart3,
    articles: [
      'Built-in Report Templates',
      'Creating Custom Reports',
      'Dashboard Widgets & KPIs',
      'Filtering & Date Ranges in Reports',
      'Exporting Reports to PDF/CSV',
      'Scheduled Report Delivery',
      'Sales Activity Reports',
      'Pipeline Conversion Reports',
      'Team Performance Dashboards',
      'Revenue Forecasting Reports',
    ],
  },
  {
    title: 'Settings & Administration',
    icon: Settings,
    articles: [
      'Managing Team Members',
      'Role-Based Access Control (RBAC)',
      'Custom Field Configuration',
      'Pipeline Stage Customization',
      'Notification Preferences',
      'Data Import/Export Settings',
      'API Keys & Integrations',
      'Audit Log & Activity Tracking',
      'Account Billing & Subscription',
      'Two-Factor Authentication Setup',
      'GDPR & Data Compliance Settings',
      'Backup & Data Recovery',
    ],
  },
  {
    title: 'Integrations',
    icon: Link2,
    articles: [
      'Connecting to Slack',
      'Google Workspace Integration',
      'Microsoft 365 Integration',
      'Zapier & Webhook Automation',
      'Calendar Sync (Google/Outlook)',
      'Phone System Integration',
      'Marketing Automation Connectors',
      'Custom API Endpoints',
    ],
  },
  {
    title: 'Troubleshooting & FAQ',
    icon: AlertCircle,
    articles: [
      'Common Login Issues',
      'Data Not Syncing Correctly',
      'Missing Contacts After Import',
      'Email Integration Connection Failures',
      'Report Data Discrepancies',
      'Performance & Loading Issues',
      'Mobile App Known Limitations',
      'Contacting Support',
    ],
  },
]

// ---------------------------------------------------------------------------
// Screenshot component – shows real CRM screenshots with browser chrome
// ---------------------------------------------------------------------------
function Screenshot({ src, caption }: { src: string; caption: string }) {
  return (
    <figure className="my-6">
      <div className="relative w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm">
        {/* Fake browser chrome */}
        <div className="flex h-7 items-center gap-1.5 border-b border-slate-200 bg-white px-3">
          <div className="h-2 w-2 rounded-full bg-red-300" />
          <div className="h-2 w-2 rounded-full bg-yellow-300" />
          <div className="h-2 w-2 rounded-full bg-green-300" />
          <div className="ml-3 h-3.5 flex-1 rounded bg-slate-100" />
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={caption} className="w-full" />
      </div>
      <figcaption className="mt-2 text-center text-xs text-slate-500 italic">{caption}</figcaption>
    </figure>
  )
}

// ---------------------------------------------------------------------------
// Callout box
// ---------------------------------------------------------------------------
function Callout({ type, children }: { type: 'info' | 'warning' | 'tip'; children: React.ReactNode }) {
  const styles = {
    info: 'border-blue-200 bg-blue-50 text-blue-900',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
    tip: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  }
  const icons = {
    info: <Info className="h-4 w-4 shrink-0 text-blue-500" />,
    warning: <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />,
    tip: <Lightbulb className="h-4 w-4 shrink-0 text-emerald-500" />,
  }
  const labels = { info: 'Note', warning: 'Important', tip: 'Tip' }
  return (
    <div className={cn('my-4 rounded-lg border p-4', styles[type])}>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide mb-1">
        {icons[type]}
        {labels[type]}
      </div>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main article content – long, dense, and intentionally tedious
// ---------------------------------------------------------------------------
function ArticleContent({ sectionIndex, articleIndex }: { sectionIndex: number; articleIndex: number }) {
  const section = docSections[sectionIndex]
  const articleTitle = section.articles[articleIndex]

  // Quickstart article (Getting Started > Quickstart)
  if (sectionIndex === 0 && articleIndex === 1) {
    return <QuickstartArticle />
  }

  // Creating a New Contact
  if (sectionIndex === 1 && articleIndex === 0) {
    return <CreateContactArticle />
  }

  // Understanding Deal Stages
  if (sectionIndex === 3 && articleIndex === 0) {
    return <DealStagesArticle />
  }

  // Creating Custom Reports
  if (sectionIndex === 6 && articleIndex === 1) {
    return <CustomReportsArticle />
  }

  // Default article template for everything else
  return <DefaultArticle title={articleTitle} section={section.title} />
}

// ---------------------------------------------------------------------------
// QUICKSTART article
// ---------------------------------------------------------------------------
function QuickstartArticle() {
  return (
    <article className="max-w-none">
      <div className="mb-2 flex items-center gap-2 text-xs text-slate-400">
        <span>Getting Started</span>
        <ChevronRight className="h-3 w-3" />
        <span>Quickstart: Your First 30 Minutes</span>
      </div>
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">Quickstart: Your First 30 Minutes</h1>
      <div className="flex items-center gap-3 text-xs text-slate-400 mb-6">
        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 12 min read</span>
        <span>Last updated: March 28, 2026</span>
      </div>

      <p className="text-sm leading-relaxed text-slate-600 mb-6">
        Welcome to the CRM platform. This guide walks you through the essential first steps to get your workspace configured, your team invited, and your first records created. We recommend completing each section in order, as later steps depend on earlier configuration choices.
      </p>

      <Callout type="info">
        Before you begin, ensure you have admin-level access to your organization&apos;s CRM instance. If you&apos;re unsure about your permission level, ask your account administrator to check under <strong>Settings &rarr; Team Members &rarr; Roles</strong>.
      </Callout>

      <h2 className="text-lg font-semibold text-slate-900 mt-10 mb-3">Step 1: Complete Your Profile</h2>
      <p className="text-sm leading-relaxed text-slate-600 mb-4">
        Your profile information is used across the platform for email signatures, task assignments, and activity attribution. Incomplete profiles can cause confusion when multiple team members are working in the same pipeline.
      </p>
      <ol className="list-decimal list-inside space-y-3 text-sm text-slate-600 mb-4">
        <li>Navigate to <strong>Settings</strong> in the left sidebar (gear icon at the bottom of the navigation)</li>
        <li>Click the <strong>Profile</strong> tab at the top of the Settings page</li>
        <li>Fill in your <strong>Full Name</strong>, <strong>Job Title</strong>, and <strong>Phone Number</strong></li>
        <li>Upload a profile photo by clicking the avatar circle (recommended: 200&times;200px, JPG or PNG)</li>
        <li>Set your <strong>Timezone</strong> using the dropdown menu &mdash; this affects task due dates and email scheduling</li>
        <li>Configure your <strong>Email Signature</strong> in the text editor below the timezone selector</li>
        <li>Click <strong>Save Changes</strong> at the bottom of the form</li>
      </ol>
      <Screenshot src="/help-screenshots/settings-profile.png" caption="Figure 1.1 — The Profile tab under Settings, showing all required fields" />

      <Callout type="warning">
        If you skip the timezone configuration, all scheduled emails and task reminders will default to UTC. This is the #1 source of support tickets from new users.
      </Callout>

      <h2 className="text-lg font-semibold text-slate-900 mt-10 mb-3">Step 2: Invite Your Team</h2>
      <p className="text-sm leading-relaxed text-slate-600 mb-4">
        Adding team members early ensures that deal assignments, task delegation, and activity tracking work correctly from day one. Each team member needs a unique email address and must be assigned a role.
      </p>
      <ol className="list-decimal list-inside space-y-3 text-sm text-slate-600 mb-4">
        <li>Go to <strong>Settings &rarr; Team</strong></li>
        <li>Click the <strong>+ Invite Member</strong> button in the top-right corner</li>
        <li>Enter the team member&apos;s email address in the dialog box</li>
        <li>Select their role from the dropdown:
          <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-slate-500">
            <li><strong>Admin</strong> &mdash; Full access to all settings, data, and billing</li>
            <li><strong>Manager</strong> &mdash; Can view all records and reports, manage team tasks</li>
            <li><strong>Sales Rep</strong> &mdash; Can create/edit contacts, deals, and tasks assigned to them</li>
            <li><strong>Viewer</strong> &mdash; Read-only access to dashboards and reports</li>
          </ul>
        </li>
        <li>Click <strong>Send Invitation</strong></li>
        <li>The invitee will receive an email with a link to set their password and complete their profile</li>
        <li>You can track pending invitations under the <strong>Pending</strong> tab on the Team page</li>
      </ol>
      <Screenshot src="/help-screenshots/settings-team.png" caption="Figure 2.1 — The Team settings page with the invitation dialog open" />
      <Screenshot src="/help-screenshots/settings-team.png" caption="Figure 2.2 — Pending invitations list showing invitation status and resend option" />

      <h2 className="text-lg font-semibold text-slate-900 mt-10 mb-3">Step 3: Configure Your Pipeline</h2>
      <p className="text-sm leading-relaxed text-slate-600 mb-4">
        The pipeline is the core of your sales workflow. Before creating deals, you need to define the stages that reflect your actual sales process. The default pipeline includes five stages, but most teams customize this.
      </p>
      <ol className="list-decimal list-inside space-y-3 text-sm text-slate-600 mb-4">
        <li>Navigate to <strong>Settings &rarr; Pipeline</strong></li>
        <li>You&apos;ll see the default stages: <em>Lead</em>, <em>Qualified</em>, <em>Proposal</em>, <em>Negotiation</em>, <em>Closed Won</em>, <em>Closed Lost</em></li>
        <li>To rename a stage, click the <strong>pencil icon</strong> next to the stage name</li>
        <li>To add a new stage, click <strong>+ Add Stage</strong> at the bottom of the list</li>
        <li>To reorder stages, drag and drop using the <strong>handle icon</strong> (six dots) on the left side of each stage</li>
        <li>To delete a stage, click the <strong>trash icon</strong> — note: this will move all deals in that stage to the previous stage</li>
        <li>Set the <strong>win probability</strong> percentage for each stage (used in forecasting reports)</li>
        <li>Click <strong>Save Pipeline</strong> when done</li>
      </ol>
      <Screenshot src="/help-screenshots/deals-pipeline.png" caption="Figure 3.1 — Pipeline stage configuration with drag-and-drop reordering" />

      <Callout type="tip">
        We recommend starting with 4-6 stages. Too many stages create friction for reps and make pipeline reports harder to interpret. You can always add more later under Settings.
      </Callout>

      <h2 className="text-lg font-semibold text-slate-900 mt-10 mb-3">Step 4: Import Your Data</h2>
      <p className="text-sm leading-relaxed text-slate-600 mb-4">
        If you&apos;re migrating from another CRM or spreadsheet, importing your existing contacts and companies saves significant manual entry. The import tool supports CSV files with automatic field mapping.
      </p>
      <h3 className="text-sm font-semibold text-slate-800 mt-6 mb-2">4.1 Preparing Your CSV File</h3>
      <p className="text-sm leading-relaxed text-slate-600 mb-3">
        Before importing, ensure your CSV file meets these requirements:
      </p>
      <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 mb-4">
        <li>File must be UTF-8 encoded</li>
        <li>First row must contain column headers</li>
        <li>Maximum file size: 10MB (approximately 50,000 records)</li>
        <li>Required columns: at minimum, <strong>First Name</strong> and <strong>Email</strong> (or <strong>Company Name</strong> for company imports)</li>
        <li>Date fields should use ISO 8601 format (YYYY-MM-DD)</li>
        <li>Phone numbers should include country code (e.g., +1-555-123-4567)</li>
        <li>Multi-value fields (like tags) should be separated by semicolons</li>
      </ul>
      <Screenshot src="/help-screenshots/settings-data.png" caption="Figure 4.1 — The Data settings tab showing import/export configuration" />

      <h3 className="text-sm font-semibold text-slate-800 mt-6 mb-2">4.2 Running the Import</h3>
      <ol className="list-decimal list-inside space-y-3 text-sm text-slate-600 mb-4">
        <li>Go to <strong>Settings &rarr; Data &rarr; Import</strong></li>
        <li>Select the record type: <strong>Contacts</strong>, <strong>Companies</strong>, or <strong>Deals</strong></li>
        <li>Click <strong>Upload CSV</strong> and select your file</li>
        <li>The system will auto-detect column mappings — review each mapping in the table:
          <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-slate-500">
            <li>Green checkmark = automatically mapped</li>
            <li>Yellow warning = needs manual mapping</li>
            <li>Red X = unmappable column (will be skipped)</li>
          </ul>
        </li>
        <li>For unmapped columns, use the dropdown to select the corresponding CRM field, or choose <strong>Skip this column</strong></li>
        <li>Select your <strong>duplicate handling</strong> preference:
          <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-slate-500">
            <li><strong>Skip duplicates</strong> — matching records are left unchanged</li>
            <li><strong>Update duplicates</strong> — matching records are overwritten with import data</li>
            <li><strong>Create duplicates</strong> — all rows create new records regardless of matches</li>
          </ul>
        </li>
        <li>Click <strong>Preview Import</strong> to see a summary of records to be created/updated/skipped</li>
        <li>Click <strong>Start Import</strong> to begin processing</li>
        <li>You&apos;ll receive an email notification when the import completes</li>
      </ol>
      <Screenshot src="/help-screenshots/settings-data.png" caption="Figure 4.2 — CSV column mapping interface showing auto-detected and manual field mappings" />
      <Screenshot src="/help-screenshots/contacts-list.png" caption="Figure 4.3 — Import preview showing record counts and duplicate handling summary" />

      <Callout type="warning">
        Large imports (over 10,000 records) can take up to 15 minutes to process. Do not navigate away from the page or start a second import while one is in progress. Check the import status under <strong>Settings &rarr; Data &rarr; Import History</strong>.
      </Callout>

      <h2 className="text-lg font-semibold text-slate-900 mt-10 mb-3">Step 5: Create Your First Deal</h2>
      <p className="text-sm leading-relaxed text-slate-600 mb-4">
        With your pipeline configured and contacts imported, you&apos;re ready to create your first deal. Deals represent active sales opportunities and move through your pipeline stages.
      </p>
      <ol className="list-decimal list-inside space-y-3 text-sm text-slate-600 mb-4">
        <li>Navigate to <strong>Deals</strong> in the left sidebar</li>
        <li>Click the <strong>+ New Deal</strong> button in the top-right corner</li>
        <li>Fill in the deal form:
          <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-slate-500">
            <li><strong>Deal Name</strong> — a descriptive name (e.g., &ldquo;Acme Corp - Enterprise License Q2&rdquo;)</li>
            <li><strong>Value</strong> — the expected revenue amount</li>
            <li><strong>Stage</strong> — select the current pipeline stage</li>
            <li><strong>Expected Close Date</strong> — when you anticipate closing</li>
            <li><strong>Contact</strong> — link to an existing contact record</li>
            <li><strong>Company</strong> — link to the associated company</li>
            <li><strong>Owner</strong> — the team member responsible for this deal</li>
          </ul>
        </li>
        <li>Click <strong>Create Deal</strong></li>
        <li>You&apos;ll be taken to the deal detail page where you can add notes, tasks, and activity logs</li>
      </ol>
      <Screenshot src="/help-screenshots/deal-form.png" caption="Figure 5.1 — The New Deal form with all required and optional fields" />

      <h2 className="text-lg font-semibold text-slate-900 mt-10 mb-3">Next Steps</h2>
      <p className="text-sm leading-relaxed text-slate-600 mb-3">
        Now that your workspace is configured, explore these additional resources to get the most out of the platform:
      </p>
      <ul className="list-disc list-inside space-y-2 text-sm text-slate-600">
        <li><strong>Email Integration</strong> — Connect your email to log conversations automatically</li>
        <li><strong>Task Management</strong> — Set up recurring tasks and reminders for follow-ups</li>
        <li><strong>Custom Reports</strong> — Build dashboards tailored to your team&apos;s KPIs</li>
        <li><strong>Integrations</strong> — Connect Slack, Google Calendar, and other tools</li>
        <li><strong>Role-Based Access</strong> — Fine-tune permissions as your team grows</li>
      </ul>

      <Callout type="info">
        Having trouble? Check the <strong>Troubleshooting &amp; FAQ</strong> section or contact support at <strong>support@crm-platform.com</strong>. Average response time is 4-6 business hours.
      </Callout>
    </article>
  )
}

// ---------------------------------------------------------------------------
// CREATE CONTACT article
// ---------------------------------------------------------------------------
function CreateContactArticle() {
  return (
    <article className="max-w-none">
      <div className="mb-2 flex items-center gap-2 text-xs text-slate-400">
        <span>Contacts Management</span>
        <ChevronRight className="h-3 w-3" />
        <span>Creating a New Contact Record</span>
      </div>
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">Creating a New Contact Record</h1>
      <div className="flex items-center gap-3 text-xs text-slate-400 mb-6">
        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 8 min read</span>
        <span>Last updated: March 15, 2026</span>
      </div>

      <p className="text-sm leading-relaxed text-slate-600 mb-6">
        Contacts are the foundation of your CRM data. Each contact represents an individual person you interact with in a business context — whether a prospect, customer, partner, or vendor. This guide covers the complete process of creating a contact, from the initial form to enrichment and linking.
      </p>

      <h2 className="text-lg font-semibold text-slate-900 mt-10 mb-3">Prerequisites</h2>
      <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 mb-4">
        <li>You must have <strong>Sales Rep</strong> or higher role permissions</li>
        <li>If linking to a company, the company record must already exist</li>
        <li>For bulk creation, see the <em>Importing Contacts via CSV</em> article instead</li>
      </ul>

      <h2 className="text-lg font-semibold text-slate-900 mt-10 mb-3">Method 1: From the Contacts Page</h2>
      <ol className="list-decimal list-inside space-y-3 text-sm text-slate-600 mb-4">
        <li>Click <strong>Contacts</strong> in the left sidebar navigation</li>
        <li>Click the <strong>+ New Contact</strong> button in the top-right corner of the page</li>
        <li>The contact creation form will appear as a slide-over panel from the right side of the screen</li>
        <li>Fill in the required fields (marked with a red asterisk):
          <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-slate-500">
            <li><strong>First Name</strong> <span className="text-red-400">*</span></li>
            <li><strong>Last Name</strong> <span className="text-red-400">*</span></li>
            <li><strong>Email</strong> <span className="text-red-400">*</span> — must be a valid email format</li>
          </ul>
        </li>
        <li>Fill in optional fields as available:
          <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-slate-500">
            <li><strong>Phone</strong> — include country code for international numbers</li>
            <li><strong>Job Title</strong></li>
            <li><strong>Company</strong> — start typing to search existing company records</li>
            <li><strong>Address</strong> — street, city, state/province, postal code, country</li>
            <li><strong>Tags</strong> — type to add tags, press Enter after each</li>
            <li><strong>Owner</strong> — defaults to you, can be reassigned</li>
            <li><strong>Source</strong> — how this contact was acquired (e.g., Website, Referral, Event)</li>
          </ul>
        </li>
        <li>If your organization has custom fields configured, they will appear in an <strong>Additional Fields</strong> section at the bottom of the form — expand it by clicking the section header</li>
        <li>Click <strong>Save Contact</strong></li>
      </ol>
      <Screenshot src="/help-screenshots/contact-form.png" caption="Figure 1.1 — Contact creation form showing required fields (red asterisk) and optional fields" />
      <Screenshot src="/help-screenshots/companies-list.png" caption="Figure 1.2 — Company search autocomplete when linking a contact to a company" />

      <h2 className="text-lg font-semibold text-slate-900 mt-10 mb-3">Method 2: Quick-Create from Any Page</h2>
      <p className="text-sm leading-relaxed text-slate-600 mb-4">
        You can create a contact from anywhere in the CRM using the global quick-create shortcut. This is useful when you&apos;re working in a deal or task and need to add a contact on the fly.
      </p>
      <ol className="list-decimal list-inside space-y-3 text-sm text-slate-600 mb-4">
        <li>Press <kbd className="rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 text-xs font-mono">Ctrl</kbd> + <kbd className="rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 text-xs font-mono">K</kbd> (or <kbd className="rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 text-xs font-mono">Cmd</kbd> + <kbd className="rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 text-xs font-mono">K</kbd> on Mac) to open the command palette</li>
        <li>Type <strong>&ldquo;Create contact&rdquo;</strong> and select the option from the dropdown</li>
        <li>A minimal creation dialog will appear — enter the name and email</li>
        <li>Click <strong>Create</strong> — the full record can be enriched later from the contact detail page</li>
      </ol>
      <Screenshot src="/help-screenshots/contacts-list.png" caption="Figure 2.1 — The Contacts list page with search and filter controls" />

      <Callout type="tip">
        After creating a contact, you can enrich the record by clicking into the contact detail page and adding notes, linking deals, scheduling tasks, and logging activities.
      </Callout>

      <h2 className="text-lg font-semibold text-slate-900 mt-10 mb-3">Method 3: From a Deal or Company Record</h2>
      <ol className="list-decimal list-inside space-y-3 text-sm text-slate-600 mb-4">
        <li>Open the deal or company detail page</li>
        <li>Scroll to the <strong>Associated Contacts</strong> section</li>
        <li>Click <strong>+ Add Contact</strong></li>
        <li>In the dialog, you can either:
          <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-slate-500">
            <li>Search for an existing contact to link</li>
            <li>Click <strong>Create New</strong> to create and link a new contact simultaneously</li>
          </ul>
        </li>
        <li>If creating new, fill in the contact form as described in Method 1</li>
        <li>The contact will be automatically linked to the deal or company</li>
      </ol>
      <Screenshot src="/help-screenshots/contact-detail.png" caption="Figure 3.1 — Contact detail page showing associated records and activity timeline" />

      <h2 className="text-lg font-semibold text-slate-900 mt-10 mb-3">Duplicate Detection</h2>
      <p className="text-sm leading-relaxed text-slate-600 mb-4">
        The system automatically checks for duplicates based on email address when creating a new contact. If a potential duplicate is detected:
      </p>
      <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 mb-4">
        <li>A yellow warning banner will appear at the top of the form</li>
        <li>The matching contact(s) will be listed with links to view their records</li>
        <li>You can choose to <strong>merge with existing</strong> or <strong>create anyway</strong></li>
      </ul>
      <Screenshot src="/help-screenshots/contacts-list.png" caption="Figure 4.1 — Contacts list showing potential duplicate records" />

      <Callout type="warning">
        Duplicate contacts cause data fragmentation — deal history, email logs, and activity notes get split across records. Always check the duplicate warning before proceeding. If you accidentally create a duplicate, see the <em>Merging Duplicate Contacts</em> article for resolution steps.
      </Callout>

      <h2 className="text-lg font-semibold text-slate-900 mt-10 mb-3">Troubleshooting</h2>
      <div className="space-y-4 text-sm text-slate-600">
        <div>
          <p className="font-medium text-slate-700">Q: The &ldquo;Save Contact&rdquo; button is grayed out</p>
          <p className="mt-1">A: Ensure all required fields (First Name, Last Name, Email) are filled in and that the email address is in a valid format. Also check that you have the necessary permissions — Viewer role cannot create contacts.</p>
        </div>
        <div>
          <p className="font-medium text-slate-700">Q: I can&apos;t find my company when linking a contact</p>
          <p className="mt-1">A: The company must exist as a record in the CRM first. Create the company under the Companies section, then return to create the contact. The search requires at least 2 characters to begin matching.</p>
        </div>
        <div>
          <p className="font-medium text-slate-700">Q: Custom fields are not appearing in the form</p>
          <p className="mt-1">A: Custom fields are configured by administrators under Settings &rarr; Custom Fields. If they were recently added, try refreshing the page. Some custom fields may be set to &ldquo;detail page only&rdquo; and won&apos;t appear in the creation form.</p>
        </div>
      </div>
    </article>
  )
}

// ---------------------------------------------------------------------------
// DEAL STAGES article
// ---------------------------------------------------------------------------
function DealStagesArticle() {
  return (
    <article className="max-w-none">
      <div className="mb-2 flex items-center gap-2 text-xs text-slate-400">
        <span>Deals &amp; Pipeline</span>
        <ChevronRight className="h-3 w-3" />
        <span>Understanding Deal Stages</span>
      </div>
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">Understanding Deal Stages</h1>
      <div className="flex items-center gap-3 text-xs text-slate-400 mb-6">
        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 15 min read</span>
        <span>Last updated: February 20, 2026</span>
      </div>

      <p className="text-sm leading-relaxed text-slate-600 mb-6">
        Deal stages represent the discrete phases of your sales process. Properly configured stages enable accurate forecasting, clear team visibility into pipeline health, and consistent handoffs between team members. This guide covers both the conceptual framework and the technical configuration of deal stages in the CRM.
      </p>

      <h2 className="text-lg font-semibold text-slate-900 mt-10 mb-3">Default Pipeline Stages</h2>
      <p className="text-sm leading-relaxed text-slate-600 mb-4">
        Every new CRM instance comes with six pre-configured stages. These follow a standard B2B sales methodology:
      </p>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-left">
              <th className="py-2 pr-4 font-semibold text-slate-700">Stage</th>
              <th className="py-2 pr-4 font-semibold text-slate-700">Win Probability</th>
              <th className="py-2 pr-4 font-semibold text-slate-700">Description</th>
              <th className="py-2 font-semibold text-slate-700">Typical Duration</th>
            </tr>
          </thead>
          <tbody className="text-slate-600">
            <tr className="border-b border-slate-100">
              <td className="py-2 pr-4 font-medium">Lead</td>
              <td className="py-2 pr-4">10%</td>
              <td className="py-2 pr-4">Initial inquiry or outreach — not yet qualified</td>
              <td className="py-2">1-2 weeks</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="py-2 pr-4 font-medium">Qualified</td>
              <td className="py-2 pr-4">25%</td>
              <td className="py-2 pr-4">Budget, authority, need, and timeline confirmed</td>
              <td className="py-2">1-3 weeks</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="py-2 pr-4 font-medium">Proposal</td>
              <td className="py-2 pr-4">50%</td>
              <td className="py-2 pr-4">Formal proposal or quote sent to the prospect</td>
              <td className="py-2">1-2 weeks</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="py-2 pr-4 font-medium">Negotiation</td>
              <td className="py-2 pr-4">75%</td>
              <td className="py-2 pr-4">Terms being discussed, contract in review</td>
              <td className="py-2">1-4 weeks</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="py-2 pr-4 font-medium text-green-700">Closed Won</td>
              <td className="py-2 pr-4">100%</td>
              <td className="py-2 pr-4">Deal signed and revenue booked</td>
              <td className="py-2">—</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-red-600">Closed Lost</td>
              <td className="py-2 pr-4">0%</td>
              <td className="py-2 pr-4">Deal did not close — record the loss reason</td>
              <td className="py-2">—</td>
            </tr>
          </tbody>
        </table>
      </div>
      <Screenshot src="/help-screenshots/deals-kanban.png" caption="Figure 1.1 — Default pipeline stages shown in the Kanban view" />

      <h2 className="text-lg font-semibold text-slate-900 mt-10 mb-3">Customizing Stages for Your Process</h2>
      <p className="text-sm leading-relaxed text-slate-600 mb-4">
        Most organizations need to adjust the default stages to match their actual workflow. Common customizations include:
      </p>
      <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 mb-4">
        <li>Adding a <strong>Discovery Call</strong> stage between Lead and Qualified</li>
        <li>Adding a <strong>Demo/Trial</strong> stage for product-led sales</li>
        <li>Adding a <strong>Legal Review</strong> stage for enterprise deals</li>
        <li>Renaming stages to match internal terminology</li>
        <li>Adjusting win probabilities based on historical conversion data</li>
      </ul>

      <Callout type="info">
        Stage customization is an admin-only operation. Navigate to <strong>Settings &rarr; Pipeline</strong> to make changes. All changes are applied retroactively to existing deals — renamed stages update immediately across all views.
      </Callout>

      <h3 className="text-sm font-semibold text-slate-800 mt-6 mb-2">Step-by-Step: Adding a Custom Stage</h3>
      <ol className="list-decimal list-inside space-y-3 text-sm text-slate-600 mb-4">
        <li>Go to <strong>Settings &rarr; Pipeline</strong></li>
        <li>Click <strong>+ Add Stage</strong> at the bottom of the stage list</li>
        <li>Enter the stage name (e.g., &ldquo;Discovery Call&rdquo;)</li>
        <li>Set the win probability percentage</li>
        <li>Drag the new stage to its correct position in the pipeline sequence</li>
        <li>Optionally, configure <strong>required fields</strong> — these are fields that must be filled before a deal can be moved into this stage:
          <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-slate-500">
            <li>Click the <strong>gear icon</strong> next to the stage name</li>
            <li>Under <strong>Entry Requirements</strong>, select which fields are mandatory</li>
            <li>This prevents deals from being moved to this stage with incomplete data</li>
          </ul>
        </li>
        <li>Click <strong>Save Pipeline</strong></li>
      </ol>
      <Screenshot src="/help-screenshots/deals-pipeline.png" caption="Figure 2.1 — Adding a new 'Discovery Call' stage with entry requirements configured" />

      <h2 className="text-lg font-semibold text-slate-900 mt-10 mb-3">Moving Deals Between Stages</h2>
      <p className="text-sm leading-relaxed text-slate-600 mb-4">There are three ways to move a deal to a different stage:</p>
      <h3 className="text-sm font-semibold text-slate-800 mt-6 mb-2">Option A: Kanban Drag-and-Drop</h3>
      <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600 mb-4">
        <li>Navigate to <strong>Deals</strong> and ensure you&apos;re in <strong>Kanban view</strong> (toggle in the top-right)</li>
        <li>Find the deal card in its current stage column</li>
        <li>Click and drag the card to the target stage column</li>
        <li>If the target stage has entry requirements, a dialog will prompt you to fill required fields</li>
        <li>The deal&apos;s stage history will be automatically updated</li>
      </ol>
      <Screenshot src="/help-screenshots/deals-kanban.png" caption="Figure 3.1 — Dragging a deal card from 'Qualified' to 'Proposal' in Kanban view" />

      <h3 className="text-sm font-semibold text-slate-800 mt-6 mb-2">Option B: Deal Detail Page</h3>
      <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600 mb-4">
        <li>Open the deal by clicking its name</li>
        <li>In the header section, find the <strong>Stage</strong> dropdown</li>
        <li>Select the new stage</li>
        <li>The change saves automatically</li>
      </ol>

      <h3 className="text-sm font-semibold text-slate-800 mt-6 mb-2">Option C: Bulk Update from List View</h3>
      <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600 mb-4">
        <li>Switch to <strong>List view</strong> on the Deals page</li>
        <li>Select multiple deals using the checkboxes</li>
        <li>Click <strong>Bulk Actions &rarr; Change Stage</strong> in the toolbar</li>
        <li>Select the target stage and confirm</li>
      </ol>

      <Callout type="warning">
        Bulk stage changes skip entry requirements and do not trigger per-deal automations. Use this feature carefully and verify the affected deals afterward.
      </Callout>

      <h2 className="text-lg font-semibold text-slate-900 mt-10 mb-3">Stage History & Audit Trail</h2>
      <p className="text-sm leading-relaxed text-slate-600 mb-4">
        Every stage change is recorded in the deal&apos;s activity timeline with the following information:
      </p>
      <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 mb-4">
        <li>Previous stage and new stage</li>
        <li>Date and time of the change</li>
        <li>User who made the change</li>
        <li>Time spent in the previous stage (used for velocity reporting)</li>
      </ul>
      <Screenshot src="/help-screenshots/deal-form.png" caption="Figure 4.1 — Deal detail page showing stage change history and activity timeline" />

      <h2 className="text-lg font-semibold text-slate-900 mt-10 mb-3">Best Practices</h2>
      <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 mb-4">
        <li>Keep pipeline stages between 4-7 for optimal usability</li>
        <li>Define clear criteria for each stage so reps know exactly when to advance a deal</li>
        <li>Review and adjust win probabilities quarterly based on actual conversion rates</li>
        <li>Use entry requirements on critical stages (e.g., require a proposal document before entering &ldquo;Proposal&rdquo;)</li>
        <li>Always record a loss reason when moving to &ldquo;Closed Lost&rdquo; — this data is invaluable for process improvement</li>
        <li>Avoid creating stages for temporary states (e.g., &ldquo;Waiting for Response&rdquo;) — use tasks or notes instead</li>
      </ul>
    </article>
  )
}

// ---------------------------------------------------------------------------
// CUSTOM REPORTS article
// ---------------------------------------------------------------------------
function CustomReportsArticle() {
  return (
    <article className="max-w-none">
      <div className="mb-2 flex items-center gap-2 text-xs text-slate-400">
        <span>Reports &amp; Analytics</span>
        <ChevronRight className="h-3 w-3" />
        <span>Creating Custom Reports</span>
      </div>
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">Creating Custom Reports</h1>
      <div className="flex items-center gap-3 text-xs text-slate-400 mb-6">
        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 18 min read</span>
        <span>Last updated: March 5, 2026</span>
      </div>

      <p className="text-sm leading-relaxed text-slate-600 mb-6">
        The CRM&apos;s report builder allows you to create custom reports from any data in the system. This guide covers the complete workflow from selecting a data source to configuring visualizations and scheduling automated delivery. Custom reports are available to Manager and Admin roles.
      </p>

      <h2 className="text-lg font-semibold text-slate-900 mt-10 mb-3">Overview of the Report Builder</h2>
      <p className="text-sm leading-relaxed text-slate-600 mb-4">
        The report builder follows a four-step wizard process:
      </p>
      <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600 mb-4">
        <li><strong>Select Data Source</strong> — choose which records to report on</li>
        <li><strong>Configure Filters</strong> — narrow down the dataset</li>
        <li><strong>Choose Columns &amp; Grouping</strong> — define what data appears and how it&apos;s organized</li>
        <li><strong>Select Visualization</strong> — pick the chart type or table format</li>
      </ol>
      <Screenshot src="/help-screenshots/reports-page.png" caption="Figure 1.1 — The four-step report builder wizard with progress indicator" />

      <h2 className="text-lg font-semibold text-slate-900 mt-10 mb-3">Step 1: Select Data Source</h2>
      <ol className="list-decimal list-inside space-y-3 text-sm text-slate-600 mb-4">
        <li>Navigate to <strong>Reports</strong> in the left sidebar</li>
        <li>Click <strong>+ New Report</strong> in the top-right corner</li>
        <li>Choose your primary data source:
          <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-slate-500">
            <li><strong>Contacts</strong> — individual person records</li>
            <li><strong>Companies</strong> — organization records</li>
            <li><strong>Deals</strong> — sales opportunity records</li>
            <li><strong>Tasks</strong> — activity and to-do records</li>
            <li><strong>Emails</strong> — logged email records</li>
            <li><strong>Activities</strong> — all activities across record types</li>
          </ul>
        </li>
        <li>Optionally enable <strong>cross-object reporting</strong> by toggling &ldquo;Include related records&rdquo; — this allows you to pull fields from associated records (e.g., company revenue on a contact report)</li>
        <li>Click <strong>Next</strong></li>
      </ol>
      <Screenshot src="/help-screenshots/reports-page.png" caption="Figure 2.1 — Data source selection with cross-object toggle enabled" />

      <Callout type="info">
        Cross-object reports can be significantly slower for large datasets. If your report takes more than 30 seconds to generate, try narrowing your filters or disabling cross-object fields you don&apos;t need.
      </Callout>

      <h2 className="text-lg font-semibold text-slate-900 mt-10 mb-3">Step 2: Configure Filters</h2>
      <p className="text-sm leading-relaxed text-slate-600 mb-4">
        Filters determine which records are included in the report. You can combine multiple filters with AND/OR logic.
      </p>
      <ol className="list-decimal list-inside space-y-3 text-sm text-slate-600 mb-4">
        <li>Click <strong>+ Add Filter</strong></li>
        <li>Select the field to filter on from the dropdown</li>
        <li>Choose the operator:
          <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-slate-500">
            <li><strong>equals / does not equal</strong> — exact match</li>
            <li><strong>contains / does not contain</strong> — partial text match</li>
            <li><strong>greater than / less than</strong> — numeric and date comparisons</li>
            <li><strong>is empty / is not empty</strong> — null checks</li>
            <li><strong>is any of / is none of</strong> — multi-value selection</li>
          </ul>
        </li>
        <li>Enter the filter value</li>
        <li>To add another filter, click <strong>+ Add Filter</strong> again</li>
        <li>Use the <strong>AND/OR</strong> toggle between filters to control the logic:
          <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-slate-500">
            <li><strong>AND</strong> — all conditions must be true</li>
            <li><strong>OR</strong> — any condition can be true</li>
          </ul>
        </li>
        <li>For advanced logic (e.g., &ldquo;A AND (B OR C)&rdquo;), click <strong>Switch to advanced mode</strong> and use the expression builder</li>
        <li>Click <strong>Next</strong></li>
      </ol>
      <Screenshot src="/help-screenshots/reports-page.png" caption="Figure 3.1 — Filter configuration with two AND conditions and one OR group" />
      <Screenshot src="/help-screenshots/dashboard.png" caption="Figure 3.2 — Dashboard showing filtered report widgets and KPI cards" />

      <h2 className="text-lg font-semibold text-slate-900 mt-10 mb-3">Step 3: Choose Columns & Grouping</h2>
      <ol className="list-decimal list-inside space-y-3 text-sm text-slate-600 mb-4">
        <li>In the <strong>Columns</strong> section, click <strong>+ Add Column</strong> to select which fields appear in the report</li>
        <li>Drag columns to reorder them</li>
        <li>For each column, you can optionally set:
          <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-slate-500">
            <li><strong>Sort direction</strong> — ascending or descending (click the column header arrow)</li>
            <li><strong>Aggregation</strong> — Sum, Average, Count, Min, Max (for numeric fields)</li>
            <li><strong>Display format</strong> — currency, percentage, date format</li>
          </ul>
        </li>
        <li>To group data, drag a field to the <strong>Group By</strong> zone — this creates expandable row groups in the report</li>
        <li>You can add up to 3 levels of grouping (e.g., Group by Stage &rarr; then by Owner &rarr; then by Month)</li>
        <li>Click <strong>Next</strong></li>
      </ol>
      <Screenshot src="/help-screenshots/reports-page.png" caption="Figure 4.1 — Column selection panel with drag-and-drop reordering" />
      <Screenshot src="/help-screenshots/dashboard.png" caption="Figure 4.2 — Multi-level grouping configuration: Stage > Owner > Month" />

      <Callout type="warning">
        Reports with more than 20 columns may not display correctly on smaller screens. Consider creating separate focused reports rather than one comprehensive report. Reports are also limited to 10,000 rows — use filters to narrow results if needed.
      </Callout>

      <h2 className="text-lg font-semibold text-slate-900 mt-10 mb-3">Step 4: Select Visualization</h2>
      <p className="text-sm leading-relaxed text-slate-600 mb-4">
        The final step lets you choose how the data is displayed. Each visualization type has its own configuration options.
      </p>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-left">
              <th className="py-2 pr-4 font-semibold text-slate-700">Type</th>
              <th className="py-2 pr-4 font-semibold text-slate-700">Best For</th>
              <th className="py-2 font-semibold text-slate-700">Requires Grouping</th>
            </tr>
          </thead>
          <tbody className="text-slate-600">
            <tr className="border-b border-slate-100">
              <td className="py-2 pr-4 font-medium">Table</td>
              <td className="py-2 pr-4">Detailed record-level data, exports</td>
              <td className="py-2">No</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="py-2 pr-4 font-medium">Bar Chart</td>
              <td className="py-2 pr-4">Comparing values across categories</td>
              <td className="py-2">Yes (1 level)</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="py-2 pr-4 font-medium">Line Chart</td>
              <td className="py-2 pr-4">Trends over time</td>
              <td className="py-2">Yes (date field)</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="py-2 pr-4 font-medium">Pie Chart</td>
              <td className="py-2 pr-4">Proportional breakdown</td>
              <td className="py-2">Yes (1 level)</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="py-2 pr-4 font-medium">Funnel</td>
              <td className="py-2 pr-4">Pipeline stage conversion</td>
              <td className="py-2">Yes (stage field)</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium">KPI Card</td>
              <td className="py-2 pr-4">Single aggregate number</td>
              <td className="py-2">No</td>
            </tr>
          </tbody>
        </table>
      </div>
      <Screenshot src="/help-screenshots/dashboard.png" caption="Figure 5.1 — Visualization type selector with preview thumbnails" />

      <h2 className="text-lg font-semibold text-slate-900 mt-10 mb-3">Saving & Sharing Reports</h2>
      <ol className="list-decimal list-inside space-y-3 text-sm text-slate-600 mb-4">
        <li>Click <strong>Save Report</strong></li>
        <li>Enter a name and optional description</li>
        <li>Choose visibility:
          <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-slate-500">
            <li><strong>Private</strong> — only you can see it</li>
            <li><strong>Team</strong> — visible to all team members</li>
            <li><strong>Public</strong> — visible to all users including Viewers</li>
          </ul>
        </li>
        <li>Optionally add the report to a <strong>Dashboard</strong> by selecting one from the dropdown</li>
        <li>Click <strong>Save</strong></li>
      </ol>

      <h2 className="text-lg font-semibold text-slate-900 mt-10 mb-3">Scheduling Automated Delivery</h2>
      <ol className="list-decimal list-inside space-y-3 text-sm text-slate-600 mb-4">
        <li>Open a saved report</li>
        <li>Click the <strong>&#8943;</strong> (more actions) menu in the top-right</li>
        <li>Select <strong>Schedule Delivery</strong></li>
        <li>Configure the schedule:
          <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-slate-500">
            <li><strong>Frequency</strong> — Daily, Weekly, Monthly</li>
            <li><strong>Day of week/month</strong> — when to send</li>
            <li><strong>Time</strong> — delivery time (in your timezone)</li>
            <li><strong>Format</strong> — PDF or CSV attachment</li>
            <li><strong>Recipients</strong> — enter email addresses (team members or external)</li>
          </ul>
        </li>
        <li>Click <strong>Save Schedule</strong></li>
      </ol>
      <Screenshot src="/help-screenshots/settings-notifications.png" caption="Figure 6.1 — Scheduled delivery configuration dialog" />

      <Callout type="tip">
        Scheduled reports use the filters saved with the report. For date-relative filters (e.g., &ldquo;last 30 days&rdquo;), the date range is recalculated at each delivery — so a weekly report always covers the most recent period.
      </Callout>
    </article>
  )
}

// ---------------------------------------------------------------------------
// Section-specific content — unique text, screenshots, steps, prerequisites,
// FAQs, and related articles per section so nothing reads the same
// ---------------------------------------------------------------------------
interface SectionContent {
  shots: { list: string; detail: string; form: string; extra: string }
  intro: string
  prereqs: string[]
  steps: { heading: string; body: string; shotKey: 'list' | 'detail' | 'form' | 'extra'; caption: string }[]
  callout: { type: 'info' | 'warning' | 'tip'; text: string }
  faqs: { q: string; a: string }[]
  related: string[]
}

const sectionContent: Record<string, SectionContent> = {
  'Getting Started': {
    shots: { list: '/help-screenshots/dashboard.png', detail: '/help-screenshots/sidebar-nav.png', form: '/help-screenshots/settings-profile.png', extra: '/help-screenshots/settings-team.png' },
    intro: 'Before you can use any feature in the CRM, your workspace must be properly configured. This includes verifying your account details, understanding the navigation layout, and ensuring your browser meets minimum requirements. Skipping initial setup is the most common reason new users run into issues later.',
    prereqs: [
      'You must have received an invitation email from your organization\u2019s admin and set a password',
      'Use a supported browser: Chrome 90+, Firefox 88+, Safari 15+, or Edge 90+',
      'Screen resolution of at least 1280\u00d7720 is recommended for full layout support',
      'Pop-up blockers should be disabled for the CRM domain to allow dialogs and exports',
    ],
    steps: [
      { heading: '1. Log in and verify your Dashboard', body: 'After logging in, you\u2019ll land on the Dashboard. This is the central hub showing KPI cards, revenue charts, deals by stage, and recent activity. If any widget shows "No data," that\u2019s normal for a new workspace \u2014 data populates as you create records.', shotKey: 'list', caption: 'Figure 1.1 \u2014 The Dashboard with KPI cards, revenue chart, and activity feed' },
      { heading: '2. Explore the sidebar navigation', body: 'The left sidebar contains links to every major section: Dashboard, Contacts, Companies, Deals, Tasks, Emails, Reports, Settings, and Help Center. Each icon has a label. The active page is highlighted with a gray background. Click any item to navigate \u2014 there are no nested menus to memorize.', shotKey: 'detail', caption: 'Figure 2.1 \u2014 The sidebar navigation showing all available sections' },
      { heading: '3. Complete your profile in Settings', body: 'Navigate to Settings \u2192 Profile. Fill in your name, email, and upload an avatar. This information appears on deals you own, emails you send, and activity logs. An incomplete profile makes it hard for teammates to know who\u2019s working on what.', shotKey: 'form', caption: 'Figure 3.1 \u2014 The Profile settings form with name, email, and avatar fields' },
      { heading: '4. Review your team members', body: 'Go to Settings \u2192 Team to see who else is in your workspace. You\u2019ll see each member\u2019s name, email, and role. If you\u2019re an admin, you can invite new members from here. Understanding who has access helps you coordinate deal ownership and task assignments.', shotKey: 'extra', caption: 'Figure 4.1 \u2014 The Team settings tab showing current members and their roles' },
    ],
    callout: { type: 'tip', text: 'Bookmark your CRM URL and set it as a browser tab that opens on startup. The faster you can access the platform, the more likely you are to keep your data current.' },
    faqs: [
      { q: 'I can\u2019t log in even though I set my password', a: 'Check that you\u2019re using the correct email address (the one the invitation was sent to). Passwords are case-sensitive. If you\u2019ve forgotten it, use the "Forgot Password" link on the login page. Contact your admin if the reset email doesn\u2019t arrive within 5 minutes.' },
      { q: 'The Dashboard shows no data at all', a: 'This is expected for a brand-new workspace. KPI cards, charts, and the activity feed populate as you create contacts, deals, and tasks. Try creating a test deal to see the Dashboard come to life.' },
      { q: 'Some sidebar links are grayed out for me', a: 'Your admin may have restricted your role permissions. Viewer-role users cannot access Settings or create new records. Ask your admin to check your role under Settings \u2192 Team.' },
    ],
    related: ['Quickstart: Your First 30 Minutes', 'Account Setup & Initial Configuration', 'User Roles & Permission Levels', 'Browser Compatibility & Troubleshooting'],
  },
  'Contacts Management': {
    shots: { list: '/help-screenshots/contacts-list.png', detail: '/help-screenshots/contact-detail.png', form: '/help-screenshots/contact-form.png', extra: '/help-screenshots/contacts-list.png' },
    intro: 'Contacts are the people you do business with \u2014 prospects, customers, partners, and vendors. Every interaction in the CRM ultimately ties back to a contact record. Keeping contact data clean and complete is critical for email deliverability, accurate reporting, and deal attribution.',
    prereqs: [
      'Sales Rep role or higher is required to create and edit contacts',
      'If linking contacts to companies, the company record must exist first',
      'For bulk imports (50+ contacts), use the CSV import tool under Settings \u2192 Data instead',
      'Email addresses must be unique across the system \u2014 duplicates will trigger a merge prompt',
    ],
    steps: [
      { heading: '1. Open the Contacts list', body: 'Click Contacts in the sidebar. You\u2019ll see a table of all contacts with columns for name, email, company, phone, owner, and status. Use the search bar to find specific people, or apply filters by status and owner using the dropdowns above the table.', shotKey: 'list', caption: 'Figure 1.1 \u2014 The Contacts list with search, filters, and sortable columns' },
      { heading: '2. View a contact\u2019s full record', body: 'Click any contact name to open their detail page. This shows all their information in one place: personal details at the top, associated deals and companies in the sidebar, and a full activity timeline at the bottom showing every email, note, task, and stage change involving this person.', shotKey: 'detail', caption: 'Figure 2.1 \u2014 A contact detail page showing personal info, linked deals, and activity timeline' },
      { heading: '3. Create or edit a contact', body: 'Click "+ Add Contact" to open the creation form. Required fields are First Name, Last Name, and Email. Optional fields include phone, job title, company (type to search), tags, source, and owner. Custom fields configured by your admin appear in an expandable section at the bottom.', shotKey: 'form', caption: 'Figure 3.1 \u2014 The contact creation form with required and optional fields' },
      { heading: '4. Use bulk actions for efficiency', body: 'Select multiple contacts using the checkboxes in the list view. A toolbar appears with bulk actions: assign owner, add tags, change status, export selected, or delete. This is especially useful after importing a batch of contacts that need the same tag or owner assignment.', shotKey: 'extra', caption: 'Figure 4.1 \u2014 Multiple contacts selected with the bulk actions toolbar visible' },
    ],
    callout: { type: 'warning', text: 'Deleting a contact is permanent and removes all associated activity history, email logs, and task records. Archive contacts instead of deleting them unless you\u2019re certain the data is no longer needed.' },
    faqs: [
      { q: 'I imported contacts but some are missing from the list', a: 'Check your active filters \u2014 the status or owner filter may be hiding imported records. Clear all filters and search by name. Also check Settings \u2192 Data \u2192 Import History for any rows that were skipped due to validation errors.' },
      { q: 'How do I merge two duplicate contact records?', a: 'Open one of the duplicate contacts, click the \u22EF menu in the top-right, and select "Merge with another contact." Search for the other record, review which fields to keep from each, and confirm. The merged record retains all activity from both.' },
      { q: 'Can I undo a contact deletion?', a: 'No. Deletions are permanent. This is why we recommend archiving instead. Archived contacts can be restored at any time from the "Archived" filter view.' },
    ],
    related: ['Importing Contacts via CSV', 'Merging Duplicate Contacts', 'Contact Tags & Segments', 'Linking Contacts to Companies', 'Exporting Contact Data'],
  },
  'Companies': {
    shots: { list: '/help-screenshots/companies-list.png', detail: '/help-screenshots/companies-list.png', form: '/help-screenshots/companies-list.png', extra: '/help-screenshots/contacts-list.png' },
    intro: 'Company records represent the organizations you work with. They serve as a grouping layer above contacts \u2014 multiple people from the same organization share one company record. This lets you track total deal value per organization, see all your touchpoints at a company, and avoid duplicating outreach to the same account.',
    prereqs: [
      'Sales Rep role or higher is required to create and edit companies',
      'Company names must be unique \u2014 the system checks for duplicates on save',
      'For companies with parent/child relationships (e.g., subsidiaries), create the parent company first',
      'Company records are often created automatically during contact imports if the "Company" CSV column is mapped',
    ],
    steps: [
      { heading: '1. Browse existing companies', body: 'Click Companies in the sidebar. The list shows company name, industry, associated contact count, total deal value, and owner. Use the search bar to find companies by name. Unlike contacts, companies don\u2019t have a status filter \u2014 all companies are always visible.', shotKey: 'list', caption: 'Figure 1.1 \u2014 The Companies list showing name, industry, contacts, and total deal value' },
      { heading: '2. Create a new company record', body: 'Click "+ Add Company" in the top-right. Enter the company name (required), then optionally add industry, website, phone, address, and annual revenue. The description field supports rich text for notes about the account.', shotKey: 'detail', caption: 'Figure 2.1 \u2014 The company creation form with all available fields' },
      { heading: '3. Link contacts to the company', body: 'On the company detail page, scroll to the "Associated Contacts" section. Click "+ Add Contact" to search and link existing contacts, or click "Create New" to create a contact that\u2019s automatically linked. You can also set the contact\u2019s role at the company (e.g., Decision Maker, Champion, End User).', shotKey: 'form', caption: 'Figure 3.1 \u2014 The Associated Contacts section with role assignment dropdown' },
      { heading: '4. Track deals and revenue per company', body: 'The company detail page shows all deals associated with any of the company\u2019s contacts. The header displays aggregate metrics: total pipeline value, number of open deals, and total won revenue. Use this view to quickly assess account health before a meeting.', shotKey: 'extra', caption: 'Figure 4.1 \u2014 Company detail header showing aggregate deal metrics' },
    ],
    callout: { type: 'info', text: 'Company records are shared across your entire team. Changes you make \u2014 like updating the industry or annual revenue \u2014 are visible to everyone immediately. Use the activity timeline to see who changed what and when.' },
    faqs: [
      { q: 'Two companies have the same name but are different organizations', a: 'Add a differentiator to the name, such as the city or parent company: "Apex Technologies (Austin)" vs "Apex Technologies (London)." The system enforces unique names but doesn\u2019t prevent similar ones.' },
      { q: 'I deleted a company but its contacts still exist', a: 'Deleting a company only removes the company record and unlinks associated contacts. The contacts themselves are preserved. You\u2019ll need to delete or reassign them separately if needed.' },
      { q: 'How do I set up parent/child company relationships?', a: 'Edit the child company, scroll to the "Parent Company" field, and search for the parent. This creates a hierarchy visible on both company detail pages. You can nest up to 3 levels deep.' },
    ],
    related: ['Associating Contacts with Companies', 'Company Custom Fields', 'Company Hierarchies (Parent/Child)', 'Tracking Company Revenue'],
  },
  'Deals & Pipeline': {
    shots: { list: '/help-screenshots/deals-pipeline.png', detail: '/help-screenshots/deals-kanban.png', form: '/help-screenshots/deal-form.png', extra: '/help-screenshots/deals-kanban.png' },
    intro: 'Deals represent active sales opportunities moving through your pipeline. Each deal has a value, a stage, an expected close date, and an owner. The pipeline is the core visualization of your sales process \u2014 it shows where every opportunity stands and helps forecast revenue. Keeping deals up to date is the single most important habit for accurate reporting.',
    prereqs: [
      'Sales Rep role or higher is required to create and manage deals',
      'Your pipeline stages must be configured before creating deals (Settings \u2192 Pipeline)',
      'Contacts and companies should exist before linking them to deals (though you can create them inline)',
      'Deal values are in your workspace\u2019s default currency \u2014 configure this under Settings \u2192 General',
    ],
    steps: [
      { heading: '1. View your pipeline', body: 'Click Deals in the sidebar. The default view is a sortable list showing deal name, value, stage, owner, and expected close date. Use the stage and owner filters to narrow the view. Toggle between List and Kanban views using the buttons in the top-right.', shotKey: 'list', caption: 'Figure 1.1 \u2014 The Deals list view with stage and owner filters applied' },
      { heading: '2. Use Kanban for visual pipeline management', body: 'Switch to Kanban view to see deals as cards arranged in stage columns. Each card shows the deal name, value, and owner. Drag cards between columns to move deals through stages. The column headers show the total value of deals in each stage.', shotKey: 'detail', caption: 'Figure 2.1 \u2014 The Kanban board with deal cards organized by pipeline stage' },
      { heading: '3. Create a new deal', body: 'Click "+ Add Deal" to open the creation form. Required fields: Deal Name, Value, and Stage. Recommended fields: Expected Close Date (used in forecasting), Contact (the primary person), Company, and Owner. A descriptive name like "Acme Corp \u2014 Enterprise License Q2" makes the pipeline scannable.', shotKey: 'form', caption: 'Figure 3.1 \u2014 The deal creation form with required and recommended fields' },
      { heading: '4. Update deal stages regularly', body: 'As conversations progress, drag deals to the next stage in Kanban view, or open the deal and change the stage dropdown. Every stage change is logged with a timestamp, the user who moved it, and time spent in the previous stage. This data powers your velocity reports.', shotKey: 'extra', caption: 'Figure 4.1 \u2014 A deal card being moved from Qualified to Proposal in Kanban view' },
    ],
    callout: { type: 'warning', text: 'Stale deals destroy forecast accuracy. Set a weekly reminder to review your pipeline and update or close deals that haven\u2019t moved in 30+ days. The "Deal Velocity" report under Reports can help identify stuck deals.' },
    faqs: [
      { q: 'I can\u2019t drag a deal to a certain stage in Kanban', a: 'That stage likely has entry requirements configured. Open the deal, fill in the required fields (shown in the error tooltip), then try moving it again. Admins configure entry requirements under Settings \u2192 Pipeline.' },
      { q: 'How do I mark a deal as lost?', a: 'Drag it to "Closed Lost" in Kanban, or change the stage dropdown on the deal detail page. You\u2019ll be prompted to select a loss reason \u2014 this is required and feeds into your win/loss analysis reports.' },
      { q: 'Can I have multiple pipelines for different products?', a: 'The current version supports a single pipeline with customizable stages. You can use tags or custom fields to segment deals by product line, then filter reports accordingly.' },
    ],
    related: ['Configuring Pipeline Stages', 'Forecasting & Weighted Pipeline', 'Deal Win/Loss Analysis', 'Reporting on Deal Velocity'],
  },
  'Tasks & Activities': {
    shots: { list: '/help-screenshots/tasks-list.png', detail: '/help-screenshots/tasks-list.png', form: '/help-screenshots/tasks-list.png', extra: '/help-screenshots/dashboard.png' },
    intro: 'Tasks are the action items that keep deals moving. Every follow-up call, proposal draft, and contract review should be tracked as a task with a due date and owner. Without tasks, opportunities stall because no one has a clear next step. The task system integrates with contacts, deals, and the dashboard to surface what needs attention today.',
    prereqs: [
      'Sales Rep role or higher is required to create tasks',
      'Tasks can exist standalone or linked to a contact, company, or deal',
      'Due date reminders require notification preferences to be configured under Settings \u2192 Notifications',
      'Recurring tasks require the "Recurring" toggle to be enabled when creating the task',
    ],
    steps: [
      { heading: '1. View all tasks', body: 'Click Tasks in the sidebar. The default view shows all tasks across the team sorted by due date. Each row shows the task title, linked record (contact or deal), due date, priority, status, and assignee. Filter by status (Open, In Progress, Completed) or assignee using the dropdowns.', shotKey: 'list', caption: 'Figure 1.1 \u2014 The Tasks list with status filters and due date sorting' },
      { heading: '2. Create a task from the Tasks page', body: 'Click "+ Add Task" in the top-right. Enter a title (e.g., "Follow up with Jamie Torres re: proposal"), set the due date, priority (Low, Medium, High, Urgent), and assignee. Optionally link the task to a contact or deal so it appears on that record\u2019s timeline.', shotKey: 'detail', caption: 'Figure 2.1 \u2014 The task creation form with title, due date, priority, and linked record fields' },
      { heading: '3. Create tasks from a deal or contact page', body: 'On any deal or contact detail page, scroll to the "Tasks" section and click "+ Add Task." The task is automatically linked to that record. This is the fastest way to create follow-ups during a pipeline review.', shotKey: 'form', caption: 'Figure 3.1 \u2014 Creating a task directly from a deal detail page' },
      { heading: '4. Track overdue tasks on the Dashboard', body: 'The Dashboard\u2019s "Tasks Due Today" KPI card shows how many tasks need attention. Overdue tasks appear in red. Click the card to jump directly to a filtered view of today\u2019s tasks. This is the first thing most reps check each morning.', shotKey: 'extra', caption: 'Figure 4.1 \u2014 The Dashboard KPI card showing tasks due today and overdue count' },
    ],
    callout: { type: 'tip', text: 'Create a task every time you finish a call or meeting. The habit of always having a "next step" task on every active deal is the single biggest predictor of pipeline health.' },
    faqs: [
      { q: 'I completed a task but it still shows in my list', a: 'Make sure you changed the status to "Completed" (not just "In Progress"). Click the checkbox or open the task and update the status dropdown. Completed tasks are hidden from the default view but visible under the "Completed" filter.' },
      { q: 'How do recurring tasks work?', a: 'When creating a task, toggle "Recurring" and set the frequency (daily, weekly, monthly). After completing a recurring task, a new instance is automatically created with the next due date. The recurrence continues until you delete the task or disable the toggle.' },
      { q: 'Can I assign tasks to someone outside my team?', a: 'No, tasks can only be assigned to users who have an active account in your CRM workspace. The assignee dropdown shows all team members. If someone isn\u2019t listed, ask your admin to invite them under Settings \u2192 Team.' },
    ],
    related: ['Task Due Dates & Reminders', 'Recurring Tasks Setup', 'Task Templates', 'Calendar Integration for Tasks'],
  },
  'Email Integration': {
    shots: { list: '/help-screenshots/emails-list.png', detail: '/help-screenshots/emails-list.png', form: '/help-screenshots/emails-list.png', extra: '/help-screenshots/settings-integrations.png' },
    intro: 'The email integration connects your inbox to the CRM so conversations are automatically logged to contact records. You can send emails directly from the CRM, use templates, track opens and clicks, and schedule delivery. This eliminates manual copy-pasting between your email client and the CRM, and ensures the full communication history is visible to your team.',
    prereqs: [
      'Your email provider must be Google Workspace or Microsoft 365 (IMAP/SMTP coming soon)',
      'Admin must enable email integration under Settings \u2192 Integrations before individual users can connect',
      'OAuth authentication is required \u2014 you\u2019ll authorize CRM access through your email provider\u2019s consent screen',
      'Email tracking (opens/clicks) requires the recipient\u2019s email client to load images \u2014 results are approximate',
    ],
    steps: [
      { heading: '1. Browse logged emails', body: 'Click Emails in the sidebar to see all emails logged in the CRM. Each row shows the subject, sender, recipient, associated contact, and timestamp. Emails are automatically matched to contact records by email address. Unmatched emails appear with a yellow "Unlinked" badge.', shotKey: 'list', caption: 'Figure 1.1 \u2014 The Emails list showing logged conversations with contact associations' },
      { heading: '2. Send an email from the CRM', body: 'Click "Compose" in the top-right of the Emails page, or click the email icon on any contact detail page. The compose window supports rich text, attachments (up to 25MB), and templates. The "From" address is your connected email account. Sent emails are automatically logged.', shotKey: 'detail', caption: 'Figure 2.1 \u2014 The email compose window with rich text editor and template selector' },
      { heading: '3. Use email templates', body: 'Click the template icon in the compose window to insert a pre-written template. Templates support merge fields like {{first_name}}, {{company_name}}, and {{deal_value}} that auto-populate from the contact and deal records. Admins create shared templates; reps can create personal ones.', shotKey: 'form', caption: 'Figure 3.1 \u2014 Template selector showing shared and personal templates with merge field preview' },
      { heading: '4. Connect your email account', body: 'Go to Settings \u2192 Integrations and find the "Email" card. Click "Connect" and sign in through your email provider\u2019s OAuth screen. Once connected, incoming and outgoing emails with known contacts are automatically logged. The sync runs every 5 minutes.', shotKey: 'extra', caption: 'Figure 4.1 \u2014 The Integrations settings page showing the email connection card' },
    ],
    callout: { type: 'warning', text: 'Email sync only captures emails to/from addresses that match existing contact records. If you email someone who isn\u2019t in the CRM, that email won\u2019t be logged. Create the contact first, or use the "Log Email" manual option.' },
    faqs: [
      { q: 'My emails aren\u2019t syncing even though I connected my account', a: 'Check Settings \u2192 Integrations \u2192 Email and verify the connection status is "Active." If it shows "Reconnect Required," your OAuth token has expired \u2014 click to re-authenticate. Also verify the recipient\u2019s email matches a contact record in the CRM.' },
      { q: 'Can I send bulk emails to multiple contacts?', a: 'Yes, but use the "Bulk Email" feature under Emails \u2192 Campaigns, not the regular compose window. Bulk emails use templates with merge fields and respect unsubscribe preferences. There\u2019s a daily limit of 200 emails to prevent spam flags.' },
      { q: 'Email open tracking shows 0% opens \u2014 is it broken?', a: 'Open tracking relies on a tracking pixel (a tiny invisible image). If recipients use email clients that block remote images by default (like Outlook), opens won\u2019t register. The data is directional, not precise. Click tracking is more reliable.' },
    ],
    related: ['Email Templates & Snippets', 'Email Tracking (Opens & Clicks)', 'Bulk Email Campaigns', 'Troubleshooting Email Sync Issues'],
  },
  'Reports & Analytics': {
    shots: { list: '/help-screenshots/reports-page.png', detail: '/help-screenshots/dashboard.png', form: '/help-screenshots/reports-page.png', extra: '/help-screenshots/dashboard.png' },
    intro: 'Reports turn your CRM data into actionable insights. The platform includes built-in report templates for common metrics (pipeline value, conversion rates, team activity) and a custom report builder for anything else. Reports can be pinned to dashboards, scheduled for email delivery, and exported to PDF or CSV for presentations.',
    prereqs: [
      'Manager or Admin role is required to create and edit reports',
      'Sales Reps can view reports shared with them but cannot create new ones',
      'Reports query live data \u2014 results reflect the current state of all records',
      'Date-range filters use the timezone configured in your profile settings',
    ],
    steps: [
      { heading: '1. Browse available reports', body: 'Click Reports in the sidebar. You\u2019ll see a list of all reports organized by category: Pipeline, Activity, Revenue, and Custom. Built-in reports have a lock icon and cannot be edited (but can be cloned). Custom reports show the creator\u2019s name and last-run date.', shotKey: 'list', caption: 'Figure 1.1 \u2014 The Reports page showing built-in and custom reports by category' },
      { heading: '2. Run a report and interpret results', body: 'Click any report name to run it. The results page shows the visualization (chart or table) at the top and a data table below. Hover over chart elements for tooltips with exact values. Use the date range picker in the top-right to adjust the time period \u2014 this recalculates all metrics.', shotKey: 'detail', caption: 'Figure 2.1 \u2014 A revenue report showing a line chart with monthly trend and data table below' },
      { heading: '3. Build a custom report', body: 'Click "+ New Report" and follow the four-step wizard: choose a data source (Contacts, Deals, Tasks, etc.), set filters to narrow the dataset, select columns and grouping, then choose a visualization type (table, bar, line, pie, funnel, or KPI card). Preview at each step before saving.', shotKey: 'form', caption: 'Figure 3.1 \u2014 The custom report builder wizard at the column selection step' },
      { heading: '4. Pin reports to the Dashboard', body: 'After saving a report, click the pin icon to add it to your Dashboard as a widget. You can arrange widgets by dragging them on the Dashboard page. Pinned reports update automatically and show the most recent data each time you load the Dashboard.', shotKey: 'extra', caption: 'Figure 4.1 \u2014 The Dashboard with multiple pinned report widgets showing KPIs and charts' },
    ],
    callout: { type: 'tip', text: 'Start with built-in reports before building custom ones. Clone a built-in report and modify it \u2014 this gives you a working starting point with the right data source and filters already configured.' },
    faqs: [
      { q: 'My report shows different numbers than what I see in the Deals list', a: 'Check the report\u2019s filters and date range. Reports often have filters that narrow the dataset (e.g., only "Closed Won" deals from the last quarter). The Deals list shows all deals unless you manually apply filters. Also check if the report uses a specific owner filter.' },
      { q: 'Can I share a report with someone outside the CRM?', a: 'You can export any report to PDF or CSV using the export button. For recurring sharing, set up Scheduled Delivery to email the report as an attachment on a daily, weekly, or monthly cadence. Recipients don\u2019t need CRM accounts.' },
      { q: 'The report takes too long to load', a: 'Large datasets with cross-object joins are the usual cause. Try narrowing your date range, removing unnecessary columns, or disabling "Include related records." Reports are limited to 10,000 rows \u2014 if your dataset exceeds this, add filters to reduce the scope.' },
    ],
    related: ['Built-in Report Templates', 'Dashboard Widgets & KPIs', 'Scheduled Report Delivery', 'Pipeline Conversion Reports'],
  },
  'Settings & Administration': {
    shots: { list: '/help-screenshots/settings-profile.png', detail: '/help-screenshots/settings-team.png', form: '/help-screenshots/settings-data.png', extra: '/help-screenshots/settings-notifications.png' },
    intro: 'Settings control everything about how your CRM workspace behaves: user profiles, team membership, pipeline stages, custom fields, notifications, data import/export, integrations, and security. Most settings require Admin role access. Changes take effect immediately and apply to all users in the workspace.',
    prereqs: [
      'Admin role is required for most settings \u2014 Managers can only edit their own profile and notifications',
      'Some settings (like pipeline stages) affect all existing records retroactively',
      'Settings changes are logged in the audit trail under Settings \u2192 Audit Log',
      'Before making bulk changes, export your current data as a backup via Settings \u2192 Data \u2192 Export',
    ],
    steps: [
      { heading: '1. Edit your profile and preferences', body: 'Go to Settings \u2192 Profile. Update your name, email, avatar, timezone, and email signature. Your timezone affects how due dates and scheduled emails are displayed. Changes save immediately when you click "Save Profile."', shotKey: 'list', caption: 'Figure 1.1 \u2014 The Profile tab with personal information and timezone settings' },
      { heading: '2. Manage team members and roles', body: 'Go to Settings \u2192 Team. Here you see all workspace members with their roles. Click "+ Invite Member" to add someone new. Click a member\u2019s name to change their role or deactivate their account. Deactivated users can\u2019t log in but their data (deals, tasks, activities) is preserved.', shotKey: 'detail', caption: 'Figure 2.1 \u2014 The Team tab showing all members with role badges and status indicators' },
      { heading: '3. Configure data import and export', body: 'Go to Settings \u2192 Data. The Import section lets you upload CSV files for contacts, companies, or deals with field mapping and duplicate handling. The Export section lets you download your entire dataset as CSV files. Import history shows all past imports with row counts and error logs.', shotKey: 'form', caption: 'Figure 3.1 \u2014 The Data tab showing import/export options and import history' },
      { heading: '4. Set notification preferences', body: 'Go to Settings \u2192 Notifications. Toggle email and in-app notifications for events like: deal stage changes, task assignments, task due date reminders, new contact activity, and team mentions. Each notification type can be independently enabled or disabled.', shotKey: 'extra', caption: 'Figure 4.1 \u2014 The Notifications tab with toggles for each notification category' },
    ],
    callout: { type: 'warning', text: 'Changing pipeline stages affects all existing deals. If you rename "Qualified" to "Discovery," every deal in "Qualified" instantly moves to "Discovery." If you delete a stage, its deals move to the previous stage. Always communicate stage changes to your team before making them.' },
    faqs: [
      { q: 'I accidentally deleted a team member \u2014 can I undo it?', a: 'Deactivating a user is different from deleting. If you deactivated them, simply reactivate their account. If you truly deleted them, their user record is gone but all their associated data (deals, tasks, contacts they owned) is reassigned to "Unassigned." Contact support for account recovery.' },
      { q: 'How do I change the default currency?', a: 'Go to Settings \u2192 General (Admin only) and select your currency from the dropdown. This affects how deal values and revenue figures are displayed. Existing values are reformatted but not converted \u2014 if you switch from USD to EUR, "$1,000" becomes "\u20AC1,000" without exchange rate adjustment.' },
      { q: 'Where can I see who changed a setting?', a: 'Settings \u2192 Audit Log shows a chronological list of all setting changes with the user who made them, the timestamp, and the old/new values. This is useful for tracking down unexpected configuration changes.' },
    ],
    related: ['Role-Based Access Control (RBAC)', 'Custom Field Configuration', 'Pipeline Stage Customization', 'Two-Factor Authentication Setup'],
  },
  'Integrations': {
    shots: { list: '/help-screenshots/settings-integrations.png', detail: '/help-screenshots/settings-integrations.png', form: '/help-screenshots/settings-data.png', extra: '/help-screenshots/settings-notifications.png' },
    intro: 'Integrations connect the CRM to your other business tools so data flows automatically between systems. Instead of switching between Slack, Google Calendar, your email, and the CRM, integrations keep everything in sync. Each integration has its own authentication flow and configuration options.',
    prereqs: [
      'Admin role is required to enable or disable integrations for the workspace',
      'Individual users must authenticate their own accounts for per-user integrations (email, calendar)',
      'Some integrations require an active subscription to the third-party tool',
      'Webhook-based integrations require a publicly accessible URL if you\u2019re using custom endpoints',
    ],
    steps: [
      { heading: '1. Browse available integrations', body: 'Go to Settings \u2192 Integrations. You\u2019ll see cards for each available integration: Email (Google/Microsoft), Calendar, Slack, Zapier, and Webhooks. Each card shows the connection status (Connected, Not Connected, or Error) and a brief description of what the integration does.', shotKey: 'list', caption: 'Figure 1.1 \u2014 The Integrations page showing all available connectors with status badges' },
      { heading: '2. Connect an integration', body: 'Click "Connect" on any integration card. For OAuth-based integrations (Google, Microsoft, Slack), you\u2019ll be redirected to the provider\u2019s authorization screen. Grant the requested permissions and you\u2019ll be sent back to the CRM with the connection active. The status badge updates to green "Connected."', shotKey: 'detail', caption: 'Figure 2.1 \u2014 The OAuth authorization flow for connecting Google Workspace' },
      { heading: '3. Configure integration settings', body: 'After connecting, click the gear icon on the integration card to configure sync options. For example, the Calendar integration lets you choose which calendar to sync, whether to create CRM events for meetings with contacts, and how far in advance to sync.', shotKey: 'form', caption: 'Figure 3.1 \u2014 Calendar integration settings showing sync direction and calendar selection' },
      { heading: '4. Monitor integration health', body: 'Connected integrations show a "Last synced" timestamp. If an integration encounters errors (e.g., expired OAuth token, API rate limit), the status badge turns red and an error description appears. Click "View Logs" to see detailed sync history and error messages.', shotKey: 'extra', caption: 'Figure 4.1 \u2014 Integration error state showing the "Reconnect Required" status with error details' },
    ],
    callout: { type: 'info', text: 'Zapier integration is the most flexible option for connecting tools we don\u2019t directly support. You can trigger Zaps from CRM events (deal created, stage changed, task completed) and push data from external tools into the CRM via Zapier\u2019s webhook actions.' },
    faqs: [
      { q: 'My Slack notifications stopped working', a: 'The Slack OAuth token may have expired. Go to Settings \u2192 Integrations \u2192 Slack and click "Reconnect." If the issue persists, check that the CRM app hasn\u2019t been removed from your Slack workspace by an admin.' },
      { q: 'Calendar events aren\u2019t showing in the CRM', a: 'Verify the correct calendar is selected in the integration settings (some users have multiple Google calendars). Also check that the sync direction is set to "Both ways" or "Calendar \u2192 CRM." The sync runs every 10 minutes, so new events may take a few minutes to appear.' },
      { q: 'Can I build a custom integration using the API?', a: 'Yes. Go to Settings \u2192 Integrations \u2192 API Keys to generate an API key. The REST API documentation is available at docs.crm-platform.com/api. Rate limits are 100 requests/minute for standard plans and 1,000/minute for enterprise plans.' },
    ],
    related: ['Google Workspace Integration', 'Microsoft 365 Integration', 'Zapier & Webhook Automation', 'Custom API Endpoints'],
  },
  'Troubleshooting & FAQ': {
    shots: { list: '/help-screenshots/dashboard.png', detail: '/help-screenshots/settings-profile.png', form: '/help-screenshots/settings-data.png', extra: '/help-screenshots/emails-list.png' },
    intro: 'This section covers the most common issues users encounter and how to resolve them. Before contacting support, work through the relevant troubleshooting steps below. Most issues fall into a few categories: login/authentication, data sync, performance, and permissions. If you\u2019re still stuck after trying these steps, contact support@crm-platform.com with the error message and a screenshot.',
    prereqs: [
      'Have your browser\u2019s developer console open (F12 or Cmd+Option+I) \u2014 error messages there help diagnose issues',
      'Check the CRM status page at status.crm-platform.com for any ongoing outages before troubleshooting',
      'Note the exact error message, the page you were on, and the action you were performing',
      'Try reproducing the issue in an incognito/private browser window to rule out extension conflicts',
    ],
    steps: [
      { heading: '1. Check the Dashboard for system health', body: 'If the Dashboard loads normally with data, the core platform is working. Missing data usually indicates a sync issue or filter problem, not a system outage. If the Dashboard won\u2019t load at all, check your internet connection and try a different browser.', shotKey: 'list', caption: 'Figure 1.1 \u2014 A healthy Dashboard indicating the platform is operational' },
      { heading: '2. Verify your account and permissions', body: 'Go to Settings \u2192 Profile and confirm your account is active. If certain pages or buttons are inaccessible, your role may not have the required permissions. Ask your admin to check your role under Settings \u2192 Team. Viewer-role users have the most restrictions.', shotKey: 'detail', caption: 'Figure 2.1 \u2014 Profile settings showing account status and current role' },
      { heading: '3. Check data import/export logs', body: 'If data is missing after an import, go to Settings \u2192 Data \u2192 Import History. Each import shows a row count breakdown: created, updated, skipped, and errored. Click "View Errors" to see which rows failed and why (usually invalid email format, missing required fields, or duplicate conflicts).', shotKey: 'form', caption: 'Figure 3.1 \u2014 Import history showing a completed import with 3 skipped rows and error details' },
      { heading: '4. Review email sync status', body: 'If emails aren\u2019t appearing on contact records, go to Settings \u2192 Integrations \u2192 Email. Check the connection status and "Last synced" timestamp. If it\u2019s more than 15 minutes old, the sync may be stuck. Click "Reconnect" to re-authenticate and force a sync.', shotKey: 'extra', caption: 'Figure 4.1 \u2014 The Emails page showing recent sync activity and any unlinked emails' },
    ],
    callout: { type: 'info', text: 'When contacting support, include: your browser and version, the URL you were on, the exact error message (or a screenshot), and the steps to reproduce the issue. This helps us resolve tickets 3x faster than messages that only say "it\u2019s broken."' },
    faqs: [
      { q: 'The entire page is blank or shows a white screen', a: 'This is usually caused by a JavaScript error. Open DevTools (F12), go to the Console tab, and look for red error messages. Clear your browser cache (Ctrl+Shift+Delete) and reload. If the issue persists in incognito mode, it\u2019s likely a platform issue \u2014 contact support.' },
      { q: 'Searches return no results even though I know the record exists', a: 'Search is case-insensitive but requires at least 2 characters. Check that you\u2019re searching in the correct section (Contacts vs Companies vs Deals). Also check your active filters \u2014 a status or owner filter can hide records from search results.' },
      { q: 'The CRM is very slow or pages take a long time to load', a: 'Try: 1) Close other browser tabs to free memory. 2) Clear the browser cache. 3) Check your internet speed at speedtest.net (minimum 5 Mbps recommended). 4) If using a VPN, try disconnecting it. 5) Check status.crm-platform.com for performance advisories.' },
    ],
    related: ['Common Login Issues', 'Data Not Syncing Correctly', 'Performance & Loading Issues', 'Contacting Support'],
  },
}

// ---------------------------------------------------------------------------
// DEFAULT article — fully unique content per section
// ---------------------------------------------------------------------------
function DefaultArticle({ title, section }: { title: string; section: string }) {
  const content = sectionContent[section] || sectionContent['Getting Started']

  return (
    <article className="max-w-none">
      <div className="mb-2 flex items-center gap-2 text-xs text-slate-400">
        <span>{section}</span>
        <ChevronRight className="h-3 w-3" />
        <span>{title}</span>
      </div>
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">{title}</h1>
      <div className="flex items-center gap-3 text-xs text-slate-400 mb-6">
        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 6 min read</span>
        <span>Last updated: March 1, 2026</span>
      </div>

      <p className="text-sm leading-relaxed text-slate-600 mb-6">{content.intro}</p>

      <h2 className="text-lg font-semibold text-slate-900 mt-10 mb-3">Prerequisites</h2>
      <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 mb-4">
        {content.prereqs.map((p, i) => <li key={i}>{p}</li>)}
      </ul>

      <h2 className="text-lg font-semibold text-slate-900 mt-10 mb-3">Step-by-Step Instructions</h2>
      {content.steps.map((step, i) => (
        <div key={i}>
          <h3 className="text-sm font-semibold text-slate-800 mt-6 mb-2">{step.heading}</h3>
          <p className="text-sm leading-relaxed text-slate-600 mb-3">{step.body}</p>
          <Screenshot src={content.shots[step.shotKey]} caption={step.caption} />
        </div>
      ))}

      <Callout type={content.callout.type}>{content.callout.text}</Callout>

      <h2 className="text-lg font-semibold text-slate-900 mt-10 mb-3">Common Issues</h2>
      <div className="space-y-4 text-sm text-slate-600 mb-4">
        {content.faqs.map((faq, i) => (
          <div key={i}>
            <p className="font-medium text-slate-700">Q: {faq.q}</p>
            <p className="mt-1">A: {faq.a}</p>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-slate-900 mt-10 mb-3">Related Articles</h2>
      <ul className="list-disc list-inside space-y-2 text-sm text-slate-600">
        {content.related.map((r, i) => <li key={i}>{r}</li>)}
      </ul>
    </article>
  )
}

// ===========================================================================
// MAIN HELP CENTER PAGE
// ===========================================================================
export default function HelpCenterPage() {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]))
  const [selectedArticle, setSelectedArticle] = useState<{ section: number; article: number }>({ section: 0, article: 1 })
  const [searchQuery, setSearchQuery] = useState('')

  const toggleSection = (index: number) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  // Count total articles
  const totalArticles = docSections.reduce((sum, s) => sum + s.articles.length, 0)

  // Filter articles by search
  const filteredSections = searchQuery
    ? docSections.map((section, si) => ({
        ...section,
        articles: section.articles.filter((a) => a.toLowerCase().includes(searchQuery.toLowerCase())),
        originalIndex: si,
      })).filter((s) => s.articles.length > 0)
    : docSections.map((s, si) => ({ ...s, originalIndex: si }))

  return (
    <div className="flex gap-0 -m-6 min-h-screen">
      {/* ---- LEFT SIDEBAR: Doc navigation ---- */}
      <aside className="w-72 shrink-0 border-r border-slate-200 bg-white overflow-y-auto h-screen sticky top-0">
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-slate-400" />
            Help Center
          </h2>
          <p className="text-xs text-slate-400">{totalArticles} articles across {docSections.length} categories</p>
          {/* Search */}
          <div className="relative mt-3">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-700 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-300"
            />
          </div>
        </div>

        <nav className="p-2">
          {filteredSections.map((section, i) => {
            const sectionIndex = section.originalIndex
            const isExpanded = expandedSections.has(sectionIndex) || searchQuery.length > 0
            return (
              <div key={sectionIndex} className="mb-0.5">
                <button
                  onClick={() => toggleSection(sectionIndex)}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3 shrink-0 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-3 w-3 shrink-0 text-slate-400" />
                  )}
                  <section.icon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span className="truncate">{section.title}</span>
                  <span className="ml-auto text-[10px] font-normal text-slate-400">{section.articles.length}</span>
                </button>
                {isExpanded && (
                  <div className="ml-5 border-l border-slate-100 pl-2">
                    {section.articles.map((article, ai) => {
                      // Find original article index
                      const originalArticleIndex = docSections[sectionIndex].articles.indexOf(article)
                      const isSelected =
                        selectedArticle.section === sectionIndex && selectedArticle.article === originalArticleIndex
                      return (
                        <button
                          key={ai}
                          onClick={() =>
                            setSelectedArticle({ section: sectionIndex, article: originalArticleIndex })
                          }
                          className={cn(
                            'flex w-full items-center gap-1.5 rounded px-2 py-1.5 text-left text-[11px] transition-colors',
                            isSelected
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                          )}
                        >
                          <FileText className="h-3 w-3 shrink-0 opacity-40" />
                          <span className="truncate">{article}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </aside>

      {/* ---- MAIN CONTENT AREA ---- */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-8 py-8">
          <ArticleContent sectionIndex={selectedArticle.section} articleIndex={selectedArticle.article} />
        </div>
      </div>

      {/* ---- RIGHT SIDEBAR: On-this-page / meta ---- */}
      <aside className="w-56 shrink-0 border-l border-slate-200 bg-white overflow-y-auto h-screen sticky top-0 hidden xl:block">
        <div className="p-4">
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">On this page</h3>
          <div className="space-y-1.5 text-[11px] text-slate-500">
            <p className="hover:text-slate-700 cursor-pointer">Overview</p>
            <p className="hover:text-slate-700 cursor-pointer">Prerequisites</p>
            <p className="hover:text-slate-700 cursor-pointer">Step-by-step instructions</p>
            <p className="hover:text-slate-700 cursor-pointer">Common issues</p>
            <p className="hover:text-slate-700 cursor-pointer">Related articles</p>
          </div>
        </div>

        <div className="border-t border-slate-100 p-4">
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">Need help?</h3>
          <div className="space-y-2 text-[11px] text-slate-500">
            <p>Email: support@crm-platform.com</p>
            <p>Response time: 4-6 business hours</p>
            <p className="text-slate-400 italic">Mon-Fri, 9am-5pm EST</p>
          </div>
        </div>

        <div className="border-t border-slate-100 p-4">
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">Was this helpful?</h3>
          <div className="flex gap-2">
            <button className="rounded border border-slate-200 px-3 py-1 text-xs text-slate-500 hover:bg-slate-50">Yes</button>
            <button className="rounded border border-slate-200 px-3 py-1 text-xs text-slate-500 hover:bg-slate-50">No</button>
          </div>
        </div>

        <div className="border-t border-slate-100 p-4">
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">Popular articles</h3>
          <div className="space-y-2 text-[11px]">
            <p className="text-blue-600 hover:underline cursor-pointer">Quickstart guide</p>
            <p className="text-blue-600 hover:underline cursor-pointer">Importing contacts</p>
            <p className="text-blue-600 hover:underline cursor-pointer">Email sync issues</p>
            <p className="text-blue-600 hover:underline cursor-pointer">Creating reports</p>
            <p className="text-blue-600 hover:underline cursor-pointer">Pipeline setup</p>
          </div>
        </div>
      </aside>
    </div>
  )
}
