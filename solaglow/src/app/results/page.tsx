import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { testimonials } from '@/data/products'

// ─── Data ────────────────────────────────────────────────────────────────────

const beforeAfters = [
  {
    name: 'Sarah',
    age: 34,
    concern: 'Fine Lines',
    duration: '6 weeks',
    beforeImg: '/images/lifestyle/skin-1.jpg',
    afterImg: '/images/lifestyle/skin-2.jpg',
  },
  {
    name: 'Michelle',
    age: 28,
    concern: 'Acne Scarring',
    duration: '8 weeks',
    beforeImg: '/images/lifestyle/skin-3.jpg',
    afterImg: '/images/lifestyle/skin-4.jpg',
  },
  {
    name: 'Lisa',
    age: 42,
    concern: 'Uneven Skin Tone',
    duration: '4 weeks',
    beforeImg: '/images/lifestyle/skin-5.jpg',
    afterImg: '/images/lifestyle/skin-6.jpg',
  },
  {
    name: 'Amanda',
    age: 31,
    concern: 'Dark Circles',
    duration: '3 weeks',
    beforeImg: '/images/lifestyle/skin-2.jpg',
    afterImg: '/images/lifestyle/skin-1.jpg',
  },
  {
    name: 'Rachel',
    age: 39,
    concern: 'Dullness',
    duration: '4 weeks',
    beforeImg: '/images/lifestyle/skin-4.jpg',
    afterImg: '/images/lifestyle/skin-3.jpg',
  },
  {
    name: 'Diana',
    age: 45,
    concern: 'Wrinkles',
    duration: '8 weeks',
    beforeImg: '/images/lifestyle/skin-6.jpg',
    afterImg: '/images/lifestyle/skin-5.jpg',
  },
]

const stats = [
  { value: '93%', label: 'improved skin texture after 4 weeks' },
  { value: '89%', label: 'reduction in appearance of fine lines' },
  { value: '96%', label: 'would recommend to a friend' },
  { value: '2 weeks', label: 'average time to see results' },
]

// ─── Star Rating ─────────────────────────────────────────────────────────────

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < count ? 'text-brand fill-current' : 'text-border fill-current'}`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  return (
    <div className="bg-[#FAF7F2]">

      {/* ── Hero ── */}
      <section data-section="hero" className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FDF6EE] via-[#F7EDE0] to-[#EDD9C8]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(196,149,106,0.18),transparent)]" />

        <div className="relative max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-brand mb-5">
            Proven Results
          </p>
          <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6">
            Real Results from<br className="hidden sm:block" /> Real People
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            See the transformative power of SolaGlow&apos;s LED light therapy and skincare system—
            documented results from members of our community.
          </p>
        </div>
      </section>

      {/* ── Before & After Gallery ── */}
      <section className="py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">

          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-brand mb-3">
              Transformations
            </p>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Before &amp; After
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Unretouched, unfiltered results from real SolaGlow users photographed under identical
              lighting conditions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {beforeAfters.map((person) => (
              <div
                key={`${person.name}-${person.age}`}
                className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-warm-md transition-all duration-300"
              >
                {/* Images */}
                <div className="grid grid-cols-2">
                  <div className="relative">
                    <img src={person.beforeImg} alt="Before" className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 left-2 bg-foreground/70 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full tracking-wide">
                      BEFORE
                    </span>
                  </div>
                  <div className="relative">
                    <img src={person.afterImg} alt="After" className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 left-2 bg-brand/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full tracking-wide">
                      AFTER
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">
                      {person.name}, {person.age}
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">{person.concern}</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px] tracking-wide flex-shrink-0 mt-0.5">
                    {person.duration}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-10">
            Individual results may vary. All photos taken under identical lighting conditions with no filters or retouching.
          </p>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="py-16 bg-gradient-to-br from-[#F7EDE0] to-[#EDD9C8]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.value} className="flex flex-col items-center gap-2">
                <p className="font-heading text-5xl lg:text-6xl font-bold text-brand">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground leading-snug max-w-[140px]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-8">
            Based on independent clinical studies with 200+ participants over 8 weeks.
          </p>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">

          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-brand mb-3">
              Community Love
            </p>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-foreground mb-4">
              What Our Community Says
            </h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Thousands of verified reviews from real customers with real results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.name}
                className="bg-white rounded-2xl p-7 border border-border/50 hover:shadow-warm-md transition-all duration-300 flex flex-col gap-5"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Stars */}
                <StarRating count={testimonial.rating} />

                {/* Quote */}
                <blockquote className="flex-1">
                  <svg className="w-8 h-6 text-brand/20 mb-2" fill="currentColor" viewBox="0 0 32 24">
                    <path d="M0 24V14.4C0 6.432 4.416 1.776 13.248 0l1.344 2.304C10.176 3.36 7.968 5.808 7.2 9.6H12V24H0zm18 0V14.4C18 6.432 22.416 1.776 31.248 0l1.344 2.304C28.176 3.36 25.968 5.808 25.2 9.6H30V24H18z" />
                  </svg>
                  <p className="text-foreground/80 leading-relaxed text-[15px]">
                    {testimonial.text}
                  </p>
                </blockquote>

                {/* Attribution */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <p className="font-semibold text-foreground text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{testimonial.location}</p>
                  </div>
                  {testimonial.verified && (
                    <Badge variant="secondary" className="text-[10px] tracking-wide">
                      Verified Buyer
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 lg:py-24 bg-gradient-to-br from-[#1A1A1A] to-[#2D2520]">
        <div className="max-w-3xl mx-auto px-6 lg:px-12 text-center">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-brand-light mb-5">
            Your Journey Starts Here
          </p>
          <h2 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-6">
            Start Your Transformation
          </h2>
          <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
            Join thousands of people who have transformed their skin with SolaGlow&apos;s
            clinically proven LED light therapy and skincare system.
          </p>
          <Button asChild variant="white" size="xl">
            <Link href="/shop">Shop Now</Link>
          </Button>
        </div>
      </section>

    </div>
  )
}
