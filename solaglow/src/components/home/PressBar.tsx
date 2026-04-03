import { pressLogos } from '@/data/products'
import { PressLogo } from '@/components/ui/PressLogo'

export default function PressBar() {
  return (
    <section className="bg-[#FDFAF6] border-y border-border py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-0">

          {/* Label */}
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-muted-foreground whitespace-nowrap sm:pr-8 sm:border-r sm:border-border">
            As Featured In
          </p>

          {/* Logos */}
          <div className="flex flex-wrap justify-center sm:justify-start items-center sm:pl-8 gap-0">
            {pressLogos.map((logo, index) => (
              <div key={logo} className="flex items-center">
                <div className="px-5 py-1">
                  <PressLogo name={logo} />
                </div>
                {index < pressLogos.length - 1 && (
                  <span className="block h-5 w-px bg-border hidden sm:block" />
                )}
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
