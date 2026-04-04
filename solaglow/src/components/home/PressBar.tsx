const logos = [
  { name: 'Vogue', src: '/images/press/vogue.svg', width: 120 },
  { name: 'Allure', src: '/images/press/allure.svg', width: 110 },
  { name: "Harper's Bazaar", src: '/images/press/harpers-bazaar.svg', width: 180 },
  { name: 'Elle', src: '/images/press/elle.svg', width: 90 },
  { name: 'Cosmopolitan', src: '/images/press/cosmopolitan.svg', width: 170 },
]

export default function PressBar() {
  return (
    <section data-section="press-bar" className="bg-[#FDFAF6] border-y border-border py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-0">

          {/* Label */}
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-muted-foreground whitespace-nowrap sm:pr-8 sm:border-r sm:border-border">
            As Featured In
          </p>

          {/* Logos */}
          <div className="flex flex-wrap justify-center sm:justify-start items-center sm:pl-8 gap-0">
            {logos.map((logo, index) => (
              <div key={logo.name} className="flex items-center">
                <div className="px-5 py-1">
                  <img
                    src={logo.src}
                    alt={logo.name}
                    width={logo.width}
                    height={40}
                    className="h-8 w-auto opacity-70 hover:opacity-100 transition-opacity"
                  />
                </div>
                {index < logos.length - 1 && (
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
