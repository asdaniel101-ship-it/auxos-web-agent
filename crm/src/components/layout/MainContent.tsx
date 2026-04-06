'use client'

export function MainContent({ children }: { children: React.ReactNode }) {
  return (
    <main className="ml-60 min-h-screen bg-slate-50 p-6">
      {children}
    </main>
  )
}
