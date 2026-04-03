import { Button } from '@/components/ui/button'
import { ProductImage } from '@/components/ui/ProductImage'

export default function Hero() {
  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden bg-gradient-to-br from-[#F5E6D3] via-[#FAF2EA] to-[#FAF7F2]">
      {/* Decorative background circles */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-[#EDD9C2]/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-[#E8D5C8]/25 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left: Text content */}
          <div className="flex flex-col gap-7 animate-fade-in-up">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 w-fit">
              <span className="block h-px w-8 bg-brand" />
              <span className="text-xs font-semibold tracking-[0.18em] uppercase text-brand">
                Premium LED Skincare
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-foreground text-balance">
              Unlock Your Skin&apos;s{' '}
              <span className="italic text-brand">Natural Radiance</span>
            </h1>

            {/* Subtext */}
            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
              Clinically proven LED light therapy combined with advanced skincare
              for visible results in just 2 weeks.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mt-1">
              <Button variant="primary" size="xl" asChild>
                <a href="/shop">Shop Best Sellers</a>
              </Button>
              <Button variant="secondary" size="xl" asChild>
                <a href="/quiz">Take the Skin Quiz</a>
              </Button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-5 mt-2">
              {['Clinically Proven', '90-Day Guarantee', 'Free Shipping $75+'].map((badge) => (
                <div key={badge} className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                  <svg
                    className="w-4 h-4 text-brand flex-shrink-0"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <circle cx="8" cy="8" r="7.5" stroke="currentColor" strokeOpacity="0.3" />
                    <path
                      d="M5 8l2 2 4-4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {badge}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Product image */}
          <div className="flex justify-center lg:justify-end animate-slide-in-right">
            <div className="relative">
              {/* Soft glow ring behind image */}
              <div className="absolute inset-6 rounded-full bg-brand/10 blur-2xl" />
              <ProductImage
                name="RadiantWave Pro"
                category="devices"
                size="lg"
                className="relative z-10 rounded-3xl shadow-warm-xl w-full max-w-[480px] lg:max-w-[560px]"
              />
              {/* Floating stat card */}
              <div className="absolute bottom-8 -left-6 z-20 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-warm-md border border-white/60">
                <p className="text-xs text-muted-foreground font-medium">Customer Rating</p>
                <div className="flex items-center gap-1 mt-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-3.5 h-3.5 text-brand fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-sm font-bold text-foreground ml-1">4.9</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">2,847 reviews</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
