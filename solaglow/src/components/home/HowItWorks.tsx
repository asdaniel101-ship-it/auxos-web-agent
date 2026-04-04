import { Droplets, Zap, Shield } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: Droplets,
    title: 'Cleanse & Prep',
    description:
      'Start with our gentle cleanser to prepare your skin for treatment. Clean skin absorbs active ingredients up to 40% more effectively.',
  },
  {
    number: '02',
    icon: Zap,
    title: 'Treat with Light',
    description:
      'Use your RadiantWave device for just 3 minutes. Red and blue LED wavelengths penetrate deep to boost collagen and fight blemishes.',
  },
  {
    number: '03',
    icon: Shield,
    title: 'Seal & Protect',
    description:
      'Lock in results with our targeted serums and moisturizers for all-day radiance. Your skin works with the treatment—not against it.',
  },
]

export default function HowItWorks() {
  return (
    <section data-section="how-it-works" className="py-20 lg:py-24 bg-warm-muted">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-brand mb-3">
            The Method
          </p>
          <h2 className="font-heading text-4xl sm:text-5xl font-bold text-foreground mb-4">
            The Science of Glow
          </h2>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            A simple, three-step ritual clinically designed to deliver visible results.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line — desktop only */}
          <div className="hidden lg:block absolute top-[3.25rem] left-[calc(16.6667%+2rem)] right-[calc(16.6667%+2rem)] h-px bg-gradient-to-r from-brand/20 via-brand/50 to-brand/20" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div
                  key={step.number}
                  className="flex flex-col items-center text-center group"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {/* Icon circle */}
                  <div className="relative mb-7">
                    {/* Outer ring */}
                    <div className="w-24 h-24 rounded-full border-2 border-brand/20 flex items-center justify-center bg-background shadow-warm-md group-hover:shadow-warm-lg group-hover:border-brand/40 transition-all duration-300">
                      {/* Inner icon bg */}
                      <div className="w-16 h-16 rounded-full bg-brand/10 group-hover:bg-brand/15 transition-colors flex items-center justify-center">
                        <Icon className="w-7 h-7 text-brand" strokeWidth={1.5} />
                      </div>
                    </div>
                    {/* Step number badge */}
                    <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-brand flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold">{step.number}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="font-heading text-2xl font-semibold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed max-w-xs">
                    {step.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <a
            href="/science"
            className="inline-flex items-center gap-2 text-sm text-brand font-semibold hover:text-brand-dark transition-colors group"
          >
            Learn the science behind our technology
            <svg
              className="w-4 h-4 group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>

      </div>
    </section>
  )
}
