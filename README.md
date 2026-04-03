# Auxos CRM Demo

A complex CRM web application with an embedded AI agent (Auxos) that lets users perform any action through natural language.

## Setup

```bash
npm install
cp .env.example .env.local
# Add your ANTHROPIC_API_KEY to .env.local
npm run dev
```

Open http://localhost:3000

## Demo Script

1. **Browse the CRM** — click through Dashboard, Contacts, Companies, Deals, Tasks, Emails, Reports, Settings to see the full application
2. **Click the Auxos chat button** (bottom-right corner, blue/purple gradient)
3. **Try these prompts:**
   - "Show me all deals worth over $100k"
   - "Create a new contact named Alex Chen at Quantum Labs, he's a VP of Engineering"
   - "Move the Meridian Corp deal to Negotiation and create a follow-up task for Friday"
   - "Onboard a new client: Brightpath Labs, main contact Elena Voss, elena@brightpath.io, $120k deal"
   - "What does my pipeline look like this quarter?"
   - "Reassign all of Priya's tasks to Marcus"
   - "Generate a revenue report for Q1"

## Features

### CRM Application
- **Dashboard** — KPI cards, revenue chart, deals by stage chart, activity feed
- **Contacts** — Searchable/filterable table, detail pages, multi-step creation form, bulk actions
- **Companies** — Company directory with associated contacts and deals
- **Deals** — Kanban board with drag-and-drop + list view, multi-step creation
- **Tasks** — Filterable task table with inline completion, overdue highlighting
- **Emails** — Inbox-style layout with thread view, compose, and reply
- **Reports** — Pre-built reports with charts, custom report builder, CSV export
- **Settings** — Profile, team management, notifications, integrations, data import/export

### Auxos AI Agent
- Natural language interface for all CRM actions
- 30+ tool definitions covering CRUD operations across all entities
- Multi-step workflow execution (e.g., full client onboarding in one command)
- Conversation memory within session
- Visual navigation when agent changes pages

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** Zustand (client-side, mock data seeded on load)
- **Charts:** Recharts
- **Drag & Drop:** @dnd-kit
- **AI Agent:** Claude API (tool use / function calling)

## Architecture

All data lives in a client-side Zustand store seeded with deterministic mock data on load. No backend or database required. The Auxos agent communicates with the Claude API through a Next.js API route, and tool calls are executed client-side against the Zustand store, so changes reflect immediately in the UI.
