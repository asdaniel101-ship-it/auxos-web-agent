const doctors = [
  {
    name: 'Dr. Sarah Mitchell, MD',
    credentials: 'Board-Certified Dermatologist',
    initials: 'SM',
    quote:
      "SolaGlow's LED technology delivers clinical-grade wavelengths that I'd typically only recommend through in-office treatments. The results my patients have seen at home are remarkable.",
  },
  {
    name: 'Dr. James Park, DO',
    credentials: 'Cosmetic Dermatology',
    initials: 'JP',
    quote:
      "What sets SolaGlow apart is their commitment to the right wavelengths at the right intensity. This isn't a gimmick \u2014 it's real photobiomodulation therapy.",
  },
  {
    name: 'Dr. Elena Rodriguez, MD',
    credentials: 'Anti-Aging Specialist',
    initials: 'ER',
    quote:
      'I recommend SolaGlow to every patient looking for a non-invasive approach to skin rejuvenation. The combination of their device with their skincare line is synergistic.',
  },
]

export default function DoctorEndorsement() {
  return (
    <section className="py-20 lg:py-24 bg-gradient-to-br from-[#FDFAF6] to-[#F5EDE2]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section header */}
        <div className="text-center mb-14">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-brand mb-3">
            Expert Approved
          </p>
          <h2 className="font-heading text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Recommended by Dermatologists
          </h2>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            Leading skin specialists trust and recommend SolaGlow to their patients.
          </p>
        </div>

        {/* Doctor cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {doctors.map((doctor) => (
            <div
              key={doctor.name}
              className="bg-white rounded-2xl border border-border/50 p-8 flex flex-col items-center text-center gap-5 hover:shadow-warm-md transition-all duration-300"
            >
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand/20 to-brand/5 flex items-center justify-center ring-4 ring-brand/10">
                <span className="font-heading text-2xl font-bold text-brand">
                  {doctor.initials}
                </span>
              </div>

              {/* Name & credentials */}
              <div className="flex flex-col gap-1">
                <h3 className="font-heading text-lg font-semibold text-foreground">
                  {doctor.name}
                </h3>
                <p className="text-xs font-semibold tracking-wide uppercase text-brand">
                  {doctor.credentials}
                </p>
              </div>

              {/* Quote */}
              <blockquote className="flex-1">
                <svg
                  className="w-7 h-5 text-brand/20 mb-2 mx-auto"
                  fill="currentColor"
                  viewBox="0 0 32 24"
                >
                  <path d="M0 24V14.4C0 6.432 4.416 1.776 13.248 0l1.344 2.304C10.176 3.36 7.968 5.808 7.2 9.6H12V24H0zm18 0V14.4C18 6.432 22.416 1.776 31.248 0l1.344 2.304C28.176 3.36 25.968 5.808 25.2 9.6H30V24H18z" />
                </svg>
                <p className="text-sm text-foreground/75 leading-relaxed italic">
                  &ldquo;{doctor.quote}&rdquo;
                </p>
              </blockquote>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
