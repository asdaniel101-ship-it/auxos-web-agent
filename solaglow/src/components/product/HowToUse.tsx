const steps = [
  {
    number: '01',
    title: 'Cleanse & Apply Serum',
    description:
      'Start with clean skin. Apply your favorite serum or our GlowBoost Serum for enhanced results.',
    image: '/images/lifestyle/usage-1.jpg',
  },
  {
    number: '02',
    title: 'Glide & Treat',
    description:
      'Turn on your device and gently glide upward across face and neck for 3 minutes. The LED and galvanic current do the work.',
    image: '/images/lifestyle/usage-2.jpg',
  },
  {
    number: '03',
    title: 'Moisturize & Protect',
    description:
      'Lock in your results with moisturizer. Use morning and night for best results.',
    image: '/images/products/cream-1.jpg',
  },
]

export function HowToUse() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Your 3-Minute Glow Routine
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Simple enough for every day, powerful enough to see real results
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-10">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center text-center">
              {/* Image */}
              <div className="relative w-full rounded-2xl overflow-hidden mb-6 shadow-warm-sm">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center text-sm font-bold">
                  {step.number}
                </div>
              </div>

              {/* Text */}
              <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed max-w-xs">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
