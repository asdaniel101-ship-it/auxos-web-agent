const featuredDoctor = {
  image: '/images/doctors/doctor-1.jpg',
  name: 'Dr. Sarah Mitchell, MD',
  title: 'Board-Certified Dermatologist — 15+ Years Experience',
  quote:
    "I've tested countless at-home devices, and SolaGlow's RadiantWave consistently delivers results comparable to in-office treatments. The combination of red light therapy at 630nm with galvanic current creates a synergistic effect that enhances both collagen production and product absorption. I recommend it to all my patients looking for a non-invasive anti-aging solution.",
  credentials: ['Board Certified', 'Published Researcher', 'Clinical Advisor'],
}

const otherDoctors = [
  {
    image: '/images/doctors/doctor-2.jpg',
    name: 'Dr. James Park, DO',
    title: 'Cosmetic Dermatology',
    quote:
      'The galvanic current technology in the RadiantWave Pro is what sets it apart. It dramatically improves the delivery of active ingredients into the skin, making every serum and treatment more effective.',
  },
  {
    image: '/images/doctors/doctor-3.jpg',
    name: 'Dr. Elena Rodriguez, MD',
    title: 'Anti-Aging Specialist',
    quote:
      'My patients who use the RadiantWave Pro consistently show measurable improvements in skin elasticity and collagen density within 4-6 weeks. The results are truly impressive for an at-home device.',
  },
]

export function DoctorPanel() {
  return (
    <section className="py-20 bg-[#FAF7F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Dermatologist Recommended
          </h2>
        </div>

        {/* Featured doctor */}
        <div className="bg-white rounded-3xl shadow-warm-md p-8 md:p-12 mb-12">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-shrink-0">
              <img
                src={featuredDoctor.image}
                alt={featuredDoctor.name}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover shadow-warm-sm"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-heading text-2xl font-bold text-foreground mb-1">
                {featuredDoctor.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">{featuredDoctor.title}</p>
              <blockquote className="text-foreground leading-relaxed italic mb-6">
                &ldquo;{featuredDoctor.quote}&rdquo;
              </blockquote>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {featuredDoctor.credentials.map((cred) => (
                  <span
                    key={cred}
                    className="text-xs font-medium bg-brand/10 text-brand rounded-full px-3 py-1"
                  >
                    {cred}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Other doctors */}
        <div className="grid md:grid-cols-2 gap-8">
          {otherDoctors.map((doctor) => (
            <div
              key={doctor.name}
              className="bg-white rounded-2xl shadow-warm-sm p-6 flex flex-col sm:flex-row gap-6 items-center"
            >
              <img
                src={doctor.image}
                alt={doctor.name}
                className="w-20 h-20 rounded-full object-cover flex-shrink-0"
              />
              <div className="text-center sm:text-left">
                <h4 className="font-heading text-lg font-semibold text-foreground">
                  {doctor.name}
                </h4>
                <p className="text-xs text-muted-foreground mb-2">{doctor.title}</p>
                <blockquote className="text-sm text-muted-foreground italic leading-relaxed">
                  &ldquo;{doctor.quote}&rdquo;
                </blockquote>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
