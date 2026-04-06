import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'
import { MainContent } from '@/components/layout/MainContent'
import { StoreInitializer } from '@/components/StoreInitializer'
import { Toaster } from '@/components/ui/toaster'
import { AgentWrapper } from '@/components/agent/AgentWrapper'
import { AgentCursor } from '@/components/agent/AgentCursor'

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
          <MainContent>
            {children}
          </MainContent>
          <Toaster />
          <AgentWrapper />
          <AgentCursor />
        </StoreInitializer>
      </body>
    </html>
  )
}
