const technologies = [
  {
    icon: (
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full bg-red-500" />
      </div>
    ),
    title: 'Red Light Therapy (630nm)',
    description:
      'Stimulates collagen production and accelerates cellular repair for firmer, more youthful skin.',
  },
  {
    icon: (
      <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
        <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
    ),
    title: 'Galvanic Current',
    description:
      'Enhances serum absorption by up to 300%, ensuring active ingredients penetrate deeper.',
  },
  {
    icon: (
      <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
        <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
      </div>
    ),
    title: 'Therapeutic Warmth',
    description:
      'Increases blood circulation and opens pores for a deeper, more effective treatment.',
  },
  {
    icon: (
      <div className="w-12 h-12 rounded-full bg-brand-lighter flex items-center justify-center">
        <svg className="w-6 h-6 text-brand-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.05 4.575a1.575 1.575 0 10-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 013.15 0v1.5m-3.15 0l.075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 013.15 0V15M6.9 7.575a1.575 1.575 0 10-3.15 0v8.175a6.15 6.15 0 006.15 6.15h0" />
        </svg>
      </div>
    ),
    title: 'Facial Massage',
    description:
      'Reduces puffiness and promotes lymphatic drainage for a sculpted, toned appearance.',
  },
]

export function TechnologySection() {
  return (
    <section data-section="technology" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Advanced Technology, Proven Results
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            4 powerful technologies working together for transformative results
          </p>
        </div>

        {/* Technology cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {technologies.map((tech) => (
            <div
              key={tech.title}
              className="bg-background rounded-2xl p-6 text-center hover:shadow-warm-md transition-shadow duration-300"
            >
              <div className="flex justify-center mb-4">{tech.icon}</div>
              <h3 className="font-heading text-lg font-semibold text-foreground mb-3">
                {tech.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {tech.description}
              </p>
            </div>
          ))}
        </div>

        {/* Technology imagery */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="rounded-2xl overflow-hidden shadow-warm-md">
            <img
              src="/images/lifestyle/tech-led.jpg"
              alt="LED light therapy technology close-up"
              className="w-full h-72 object-cover"
            />
          </div>
          <div className="rounded-2xl overflow-hidden shadow-warm-md">
            <img
              src="/images/lifestyle/tech-micro.jpg"
              alt="Microcurrent technology demonstration"
              className="w-full h-72 object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
