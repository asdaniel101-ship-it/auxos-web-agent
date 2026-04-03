import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'
import { StoreInitializer } from '@/components/StoreInitializer'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CRM - Auxos Demo',
  description: 'CRM application with embedded Auxos AI agent',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StoreInitializer>
          <Sidebar />
          <main className="ml-60 min-h-screen bg-slate-50 p-6">
            {children}
          </main>
          <Toaster />
        </StoreInitializer>
      </body>
    </html>
  )
}
