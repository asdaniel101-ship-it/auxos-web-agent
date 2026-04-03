'use client'

import { useRef, useState } from 'react'
import { useStore } from '@/store'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Upload, Download } from 'lucide-react'

export function DataTab() {
  const store = useStore()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setSelectedFile(file)
  }

  function handleImport() {
    if (!selectedFile) {
      toast({ title: 'No file selected', description: 'Please choose a CSV file to import.', variant: 'destructive' })
      return
    }
    // Mock: derive a fake count from file size
    const mockCount = Math.max(1, Math.floor(selectedFile.size / 100))
    toast({ title: 'Import complete', description: `${mockCount} contacts imported successfully.` })
    setSelectedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleExportJSON() {
    const exportData = {
      exportedAt: new Date().toISOString(),
      contacts: store.contacts,
      companies: store.companies,
      deals: store.deals,
      tasks: store.tasks,
      emailThreads: store.emailThreads,
      reports: store.reports,
      teamMembers: store.teamMembers,
      settings: store.settings,
      activities: store.activities,
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `crm-export-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast({ title: 'Export started', description: 'Your data has been downloaded as JSON.' })
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Import Contacts */}
      <Card>
        <CardHeader>
          <CardTitle>Import Contacts</CardTitle>
          <CardDescription>Upload a CSV file to import contacts in bulk.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <label
              htmlFor="csv-upload"
              className="flex items-center gap-2 cursor-pointer rounded-md border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Upload className="h-4 w-4" />
              {selectedFile ? selectedFile.name : 'Choose CSV file'}
            </label>
            <input
              id="csv-upload"
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="sr-only"
              onChange={handleFileChange}
            />
          </div>
          {selectedFile && (
            <p className="text-xs text-slate-500">
              Selected: <span className="font-medium">{selectedFile.name}</span>{' '}
              ({(selectedFile.size / 1024).toFixed(1)} KB)
            </p>
          )}
          <Button onClick={handleImport} disabled={!selectedFile}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
        </CardContent>
      </Card>

      {/* Export All Data */}
      <Card>
        <CardHeader>
          <CardTitle>Export All Data</CardTitle>
          <CardDescription>Download a complete snapshot of your CRM data as JSON.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-slate-600">
            This export includes all contacts, companies, deals, tasks, emails, reports, team members, and settings.
          </p>
          <Button onClick={handleExportJSON} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
