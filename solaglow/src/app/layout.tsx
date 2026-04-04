import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { AgentContainer } from '@/components/agent/AgentContainer'
import { AgentCursor } from '@/components/agent/AgentCursor'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  title: 'SolaGlow | Premium Skincare & Light Therapy',
  description: 'Clinically proven skincare devices and products for radiant, youthful skin.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans bg-[#FAF7F2] text-[#1A1A1A] antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
        <AgentContainer />
        <AgentCursor />
      </body>
    </html>
  )
}
