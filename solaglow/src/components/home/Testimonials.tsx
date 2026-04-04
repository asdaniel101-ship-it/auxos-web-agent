import { testimonials } from '@/data/products'
import { Badge } from '@/components/ui/badge'

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(count)].map((_, i) => (
        <svg key={i} className="w-4 h-4 text-brand fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

const displayTestimonials = testimonials.slice(0, 3)

export default function Testimonials() {
  return (
    <section data-section="testimonials" className="py-20 lg:py-24 bg-gradient-to-b from-[#FBF5EF] to-[#FAF7F2]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Section header */}
        <div className="text-center mb-14">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-brand mb-3">
            Community Love
          </p>
          <h2 className="font-heading text-4xl sm:text-5xl font-bold text-foreground mb-4">
            What Our Community Says
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Thousands of glowing reviews from real customers with real results.
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayTestimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="bg-card rounded-2xl p-7 border border-border/50 card-shadow hover:shadow-warm-md transition-all duration-300 flex flex-col gap-5"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Stars */}
              <StarRating count={testimonial.rating} />

              {/* Quote */}
              <blockquote className="flex-1">
                {/* Opening quote mark */}
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

        {/* View all link */}
        <div className="text-center mt-12">
          <a
            href="/reviews"
            className="inline-flex items-center gap-2 text-brand font-semibold text-sm hover:text-brand-dark transition-colors group"
          >
            Read all reviews
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
