import Image from 'next/image'
import { Button } from '@/components/ui/button'

const stats = [
  { value: '93%', label: 'saw improved skin texture' },
  { value: '89%', label: 'reduction in fine lines' },
  { value: '96%', label: 'would recommend' },
]

const resultCards = [
  {
    alt: 'Customer result 1 – before and after',
    label: '6 Weeks of Use',
  },
  {
    alt: 'Customer result 2 – before and after',
    label: '4 Weeks of Use',
  },
  {
    alt: 'Customer result 3 – before and after',
    label: '8 Weeks of Use',
  },
]

export default function ResultsPreview() {
  return (
    <section className="py-20 lg:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Section header */}
        <div className="text-center mb-14">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-brand mb-3">
            Proven Results
          </p>
          <h2 className="font-heading text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Real Results, Real People
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            See the visible difference SolaGlow makes — no filters, no edits.
          </p>
        </div>

        {/* Result cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-14">
          {resultCards.map((card, index) => (
            <div
              key={index}
              className="group rounded-2xl overflow-hidden border border-border/50 card-shadow hover:shadow-warm-lg transition-all duration-300"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-accent/20">
                <Image
                  src="https://placehold.co/400x300/E8D5C8/6B5B4E?text=Before+%26+After"
                  alt={card.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                {/* Overlay label */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/40 to-transparent p-4">
                  <span className="text-white text-sm font-semibold tracking-wide">
                    {card.label}
                  </span>
                </div>
              </div>
              <div className="p-4 bg-card">
                <div className="flex gap-2 text-xs text-muted-foreground font-medium">
                  <span className="px-2.5 py-1 bg-muted rounded-full">Before</span>
                  <svg className="w-4 h-4 self-center text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <span className="px-2.5 py-1 bg-brand text-white rounded-full">After</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats bar */}
        <div className="bg-gradient-to-r from-[#F5E6D3] via-[#FAF2EA] to-[#F5E6D3] rounded-2xl p-8 sm:p-12 mb-10 border border-brand/10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.value} className="flex flex-col gap-1.5">
                <span className="font-heading text-5xl font-bold text-brand">
                  {stat.value}
                </span>
                <span className="text-sm text-muted-foreground font-medium">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button variant="secondary" size="lg" asChild>
            <a href="/results">See All Results</a>
          </Button>
        </div>

      </div>
    </section>
  )
}
