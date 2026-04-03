const results = [
  {
    before: '/images/lifestyle/ba-1-before.jpg',
    after: '/images/lifestyle/ba-1-after.jpg',
    name: 'Sarah, 34',
    concern: 'Fine Lines & Wrinkles',
  },
  {
    before: '/images/lifestyle/ba-2-before.jpg',
    after: '/images/lifestyle/ba-2-after.jpg',
    name: 'Michelle, 28',
    concern: 'Uneven Skin Tone',
  },
  {
    before: '/images/lifestyle/ba-3-before.jpg',
    after: '/images/lifestyle/ba-3-after.jpg',
    name: 'Rachel, 42',
    concern: 'Loss of Firmness',
  },
]

export function BeforeAfterSection() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Real Results from Real People
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Clinical trials and customer results after consistent use
          </p>
        </div>

        {/* Before/After grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {results.map((result) => (
            <div key={result.name} className="bg-white rounded-2xl overflow-hidden shadow-warm-sm">
              <div className="grid grid-cols-2">
                <div className="relative">
                  <img
                    src={result.before}
                    alt={`${result.name} before treatment`}
                    className="w-full h-56 object-cover"
                  />
                  <span className="absolute bottom-2 left-2 bg-foreground/70 text-white text-xs font-medium px-2 py-1 rounded">
                    Before
                  </span>
                </div>
                <div className="relative">
                  <img
                    src={result.after}
                    alt={`${result.name} after 30 days of treatment`}
                    className="w-full h-56 object-cover"
                  />
                  <span className="absolute bottom-2 left-2 bg-brand/90 text-white text-xs font-medium px-2 py-1 rounded">
                    After 30 Days
                  </span>
                </div>
              </div>
              <div className="p-4 text-center">
                <p className="font-medium text-foreground">{result.name}</p>
                <p className="text-sm text-muted-foreground">{result.concern}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-muted-foreground mt-8 max-w-xl mx-auto">
          Individual results may vary. Photos taken after 30 days of consistent daily use.
        </p>
      </div>
    </section>
  )
}
