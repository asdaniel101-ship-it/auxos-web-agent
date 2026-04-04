export function MetricsBanner() {
  const metrics = [
    { value: '93%', label: 'Saw improved skin texture' },
    { value: '89%', label: 'Reduction in fine lines' },
    { value: '4.9', label: 'Average customer rating' },
    { value: '2 Weeks', label: 'To see visible results' },
  ]

  return (
    <section data-section="clinical-results" className="bg-gradient-to-r from-[#C4956A] via-[#D4AA87] to-[#C4956A] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {metrics.map((metric) => (
            <div key={metric.label} className="text-center">
              <p className="text-4xl md:text-5xl font-heading font-bold text-white mb-2">
                {metric.value}
              </p>
              <p className="text-sm md:text-base text-white/85 font-medium">
                {metric.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
