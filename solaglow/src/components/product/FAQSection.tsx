'use client'

import * as Accordion from '@radix-ui/react-accordion'

const faqs = [
  {
    question: 'How long until I see results?',
    answer:
      'Most users report visible improvements in skin texture and radiance within 2 weeks of consistent daily use. For more significant results like reduction in fine lines, we recommend 4-6 weeks of consistent use.',
  },
  {
    question: 'Is it safe for all skin types?',
    answer:
      'Yes! The RadiantWave Pro is designed for all skin types and tones. Our LED wavelengths are non-UV and completely safe for daily use. If you have a specific skin condition, we recommend consulting with your dermatologist.',
  },
  {
    question: 'How often should I use it?',
    answer:
      'For best results, use your RadiantWave Pro once or twice daily for 3 minutes per session. You can use it in the morning, evening, or both. Consistency is key to seeing results.',
  },
  {
    question: 'Can I use it with my existing skincare products?',
    answer:
      'Absolutely! The RadiantWave Pro works with any water-based serum or moisturizer. For optimal results, we recommend using it with our GlowBoost Serum, which is specially formulated to work with LED light therapy.',
  },
  {
    question: "What's your return policy?",
    answer:
      "We offer a 90-day money-back guarantee. If you're not completely satisfied with your results, return the device for a full refund. No questions asked.",
  },
  {
    question: 'Is the device FDA-cleared?',
    answer:
      'Our LED technology uses wavelengths that are widely recognized as safe for cosmetic use. The device is manufactured in FDA-registered facilities and meets all applicable safety standards.',
  },
  {
    question: 'How do I clean and maintain the device?',
    answer:
      'Simply wipe the treatment head with a soft, damp cloth after each use. The device is water-resistant but should not be submerged. The LED lights are rated for 50,000+ hours of use.',
  },
  {
    question: 'Does it come with a warranty?',
    answer:
      'Yes, every RadiantWave device comes with a 2-year manufacturer warranty covering defects in materials and workmanship.',
  },
]

export function FAQSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
        </div>

        {/* Accordion */}
        <Accordion.Root type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <Accordion.Item
              key={i}
              value={`faq-${i}`}
              className="bg-background rounded-xl overflow-hidden"
            >
              <Accordion.Trigger className="flex items-center justify-between w-full px-6 py-5 text-left group">
                <span className="font-medium text-foreground pr-4">{faq.question}</span>
                <svg
                  className="w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </Accordion.Trigger>
              <Accordion.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                <div className="px-6 pb-5">
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                </div>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </section>
  )
}
