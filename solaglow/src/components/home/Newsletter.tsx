'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (email) {
      setSubmitted(true)
      setEmail('')
    }
  }

  return (
    <section data-section="newsletter" className="py-20 lg:py-24 bg-gradient-to-br from-[#C4956A] via-[#D4AA87] to-[#C4956A] relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-80 h-80 rounded-full bg-white/5 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-black/5 translate-x-1/3 translate-y-1/3 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMwLTkuOTQtOC4wNi0xOC0xOC0xOFMwIDguMDYgMCAxOHM4LjA2IDE4IDE4IDE4IDE4LTguMDYgMTgtMTh6IiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNCkiIHN0cm9rZS13aWR0aD0iMSIvPjwvZz48L3N2Zz4=')] opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-6 lg:px-12 text-center">

        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 mb-6">
          <span className="block h-px w-8 bg-white/50" />
          <span className="text-xs font-semibold tracking-[0.18em] uppercase text-white/80">
            Exclusive Access
          </span>
          <span className="block h-px w-8 bg-white/50" />
        </div>

        <h2 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-4">
          Join the Glow
        </h2>
        <p className="text-white/80 text-lg mb-10 max-w-md mx-auto leading-relaxed">
          Subscribe for exclusive offers, skincare tips, and early access to new
          products.
        </p>

        {submitted ? (
          <div className="animate-fade-in-up bg-white/15 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <svg className="w-12 h-12 text-white mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-white text-lg font-semibold mb-1">You&apos;re on the list!</p>
            <p className="text-white/75 text-sm">Welcome to the SolaGlow community. Check your inbox for a special welcome offer.</p>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="flex-1 h-12 px-5 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 text-sm transition-all"
              />
              <Button
                type="submit"
                variant="white"
                size="default"
                className="shrink-0 font-semibold"
              >
                Subscribe
              </Button>
            </form>
            <p className="text-white/55 text-xs mt-4">
              No spam, unsubscribe anytime. We respect your privacy.
            </p>
          </>
        )}

      </div>
    </section>
  )
}
