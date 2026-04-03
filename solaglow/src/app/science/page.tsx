import Link from 'next/link'
import { Button } from '@/components/ui/button'

// ─── Data ────────────────────────────────────────────────────────────────────

const wavelengths = [
  {
    name: 'Red Light',
    nm: '630nm',
    color: '#E05555',
    bg: 'bg-red-50',
    border: 'border-red-100',
    description:
      'Stimulates collagen production, reduces fine lines, and promotes cellular repair for visibly firmer, smoother skin.',
  },
  {
    name: 'Blue Light',
    nm: '415nm',
    color: '#4A90D9',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    description:
      'Targets acne-causing bacteria, reduces inflammation, and helps prevent breakouts for clearer, calmer skin.',
  },
  {
    name: 'Near-Infrared',
    nm: '850nm',
    color: '#7C5CBF',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
    description:
      'Penetrates deepest to accelerate healing, reduce redness, and improve overall skin tone and resilience.',
  },
]

const stats = [
  { value: '93%', label: 'of users saw improved skin texture after 4 weeks' },
  { value: '89%', label: 'reduction in appearance of fine lines' },
  { value: '96%', label: 'would recommend to a friend' },
  { value: '2 weeks', label: 'average time to see visible results' },
]

const studies = [
  {
    title: 'LED Phototherapy for Skin Rejuvenation',
    journal: 'Journal of Cosmetic Dermatology',
    year: '2023',
    finding:
      'Demonstrated significant improvements in skin texture and fine-line reduction after 8 weeks of consistent LED treatment.',
  },
  {
    title: 'Effects of Red Light on Collagen Synthesis',
    journal: 'Dermatologic Surgery',
    year: '2022',
    finding:
      'Red light at 630nm wavelength increased dermal collagen density by up to 31% in a controlled double-blind study.',
  },
  {
    title: 'Blue Light Therapy in Acne Treatment',
    journal: 'International Journal of Dermatology',
    year: '2023',
    finding:
      'Blue light at 415nm reduced P. acnes bacterial counts by 87% and inflammatory lesion count by 64% after 4 weeks.',
  },
  {
    title: 'Near-Infrared Light and Wound Healing',
    journal: 'Photomedicine and Laser Surgery',
    year: '2024',
    finding:
      'NIR at 850nm accelerated cellular regeneration and significantly reduced post-procedure redness and recovery time.',
  },
]

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SciencePage() {
  return (
    <div className="bg-[#FAF7F2]">

      {/* ── Hero ── */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        {/* Warm gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FDF6EE] via-[#F7EDE0] to-[#EDD9C8]" />
        {/* Subtle radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(196,149,106,0.18),transparent)]" />

        <div className="relative max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-brand mb-5">
            The Science
          </p>
          <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6">
            The Science Behind<br className="hidden sm:block" /> the Glow
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Our devices use clinically studied LED wavelengths to stimulate your skin&apos;s natural
            renewal processes—delivering spa-quality results in the comfort of your home.
          </p>
        </div>
      </section>

      {/* ── How LED Works ── */}
      <section className="py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">

          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-brand mb-3">
              The Technology
            </p>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-foreground mb-4">
              How LED Light Therapy Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Different wavelengths of light penetrate the skin at varying depths, each triggering
              specific biological responses that promote healing and renewal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {wavelengths.map((w) => (
              <div
                key={w.nm}
                className={`rounded-2xl border ${w.border} ${w.bg} p-8 flex flex-col gap-5 hover:shadow-warm-md transition-all duration-300`}
              >
                {/* Colored circle icon */}
                <div className="flex items-center gap-4">
                  <span
                    className="w-12 h-12 rounded-full flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: w.color }}
                  />
                  <div>
                    <p className="font-semibold text-foreground text-lg leading-tight">{w.name}</p>
                    <p className="text-sm font-mono text-muted-foreground">{w.nm}</p>
                  </div>
                </div>
                <p className="text-foreground/75 leading-relaxed">{w.description}</p>
              </div>
            ))}
          </div>

          {/* How it penetrates — visual diagram hint */}
          <div className="mt-16 bg-white rounded-3xl border border-border p-10 lg:p-14 text-center shadow-warm-sm">
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-brand mb-4">
              Penetration Depth
            </p>
            <h3 className="font-heading text-3xl font-bold text-foreground mb-8">
              Light Reaches Where Topicals Can&apos;t
            </h3>
            <div className="max-w-2xl mx-auto grid grid-cols-3 gap-6 text-sm">
              {[
                { label: 'Epidermis', depth: '0.5–2mm', color: '#E05555', pct: '30%' },
                { label: 'Dermis', depth: '2–4mm', color: '#7C5CBF', pct: '65%' },
                { label: 'Subcutaneous', depth: '4–6mm', color: '#4A5568', pct: '100%' },
              ].map((layer) => (
                <div key={layer.label} className="flex flex-col items-center gap-3">
                  <div className="w-full rounded-full overflow-hidden bg-muted h-40 flex items-end">
                    <div
                      className="w-full rounded-full transition-all"
                      style={{ height: layer.pct, backgroundColor: layer.color + '33', borderTop: `3px solid ${layer.color}` }}
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{layer.label}</p>
                    <p className="text-muted-foreground text-xs">{layer.depth}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground text-sm mt-6 max-w-lg mx-auto">
              SolaGlow devices combine multiple wavelengths to address the full spectrum of skin concerns at every layer.
            </p>
          </div>
        </div>
      </section>

      {/* ── Clinical Results Stats ── */}
      <section className="py-20 lg:py-24 bg-gradient-to-br from-[#F7EDE0] to-[#EDD9C8]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">

          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-brand mb-3">
              Clinical Evidence
            </p>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Clinically Proven Results
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div
                key={stat.value}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/80 shadow-warm-sm hover:shadow-warm-md transition-all duration-300"
              >
                <p className="font-heading text-5xl lg:text-6xl font-bold text-brand mb-3">
                  {stat.value}
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">{stat.label}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-8">
            Based on independent clinical studies with 200+ participants over 8 weeks.
          </p>
        </div>
      </section>

      {/* ── Research & Studies ── */}
      <section className="py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">

          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-brand mb-3">
              Peer-Reviewed Research
            </p>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Backed by Research
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              SolaGlow technology is grounded in published scientific literature from leading
              dermatology and photomedicine journals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {studies.map((study) => (
              <div
                key={study.title}
                className="bg-white rounded-2xl border border-border p-8 hover:shadow-warm-md transition-all duration-300 flex flex-col gap-4"
              >
                {/* Journal + year */}
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-semibold tracking-wide uppercase text-brand">
                    {study.journal}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono border border-border rounded-full px-3 py-1 flex-shrink-0">
                    {study.year}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-heading text-xl font-semibold text-foreground leading-snug">
                  {study.title}
                </h3>

                {/* Finding */}
                <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                  {study.finding}
                </p>

                {/* Decorative divider */}
                <div className="h-px bg-gradient-to-r from-brand/20 to-transparent" />

                <p className="text-xs text-muted-foreground italic">
                  Peer-reviewed publication · Independent research
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 lg:py-24 bg-gradient-to-br from-[#1A1A1A] to-[#2D2520]">
        <div className="max-w-3xl mx-auto px-6 lg:px-12 text-center">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-brand-light mb-5">
            Ready to Begin
          </p>
          <h2 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-6">
            Experience the Science
          </h2>
          <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
            Every SolaGlow device is engineered to deliver clinically proven wavelengths in a sleek,
            easy-to-use form factor built for daily life.
          </p>
          <Button asChild variant="white" size="xl">
            <Link href="/shop">Shop Our Devices</Link>
          </Button>
        </div>
      </section>

    </div>
  )
}
