import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// ─── Data ────────────────────────────────────────────────────────────────────

const values = [
  {
    icon: (
      <svg className="w-6 h-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
      </svg>
    ),
    title: 'Science-First',
    description:
      'Every product is backed by clinical research and dermatologist-tested formulations. We never bring a product to market without evidence.',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l.75 1.5m9-1.5l-.75 1.5M12 3.75v.75" />
        {/* Leaf-like path */}
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
      </svg>
    ),
    title: 'Clean Beauty',
    description:
      'We use only clean, non-toxic ingredients. Always cruelty-free, vegan, and sustainably sourced. Good for your skin, and good for the planet.',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
    title: 'Inclusive Skincare',
    description:
      'Designed for all skin types, tones, and concerns. Beauty is for everyone. Our formulations are tested across a diverse range of skin profiles.',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Transparency',
    description:
      'Full ingredient disclosure, honest marketing, and real results. No gimmicks, no greenwashing. We tell you exactly what&apos;s in our products and why.',
  },
]

const team = [
  {
    name: 'Dr. Alicia Chen',
    title: 'Founder & Chief Scientist',
    avatar: 'https://placehold.co/200x200/E8D5C8/6B5B4E?text=AC',
    bio: 'Board-certified dermatologist with 15+ years of clinical research in photobiomodulation and skin biology.',
  },
  {
    name: 'Marcus Rivera',
    title: 'Head of Product Design',
    avatar: 'https://placehold.co/200x200/D4C4B0/5E4F44?text=MR',
    bio: 'Former Apple designer with a passion for merging clinical precision with beautiful, intuitive consumer hardware.',
  },
  {
    name: 'Sarah Kim',
    title: 'VP of Community & Education',
    avatar: 'https://placehold.co/200x200/EDD9C2/7A6348?text=SK',
    bio: 'Licensed esthetician and educator dedicated to making professional skincare knowledge accessible to everyone.',
  },
]

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div className="bg-[#FAF7F2]">

      {/* ── Hero ── */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FDF6EE] via-[#F7EDE0] to-[#EDD9C8]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(196,149,106,0.18),transparent)]" />

        <div className="relative max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-brand mb-5">
            Our Story
          </p>
          <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6">
            Our Story
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            We believe that clinical-grade skincare shouldn&apos;t require a spa appointment or a
            specialist&apos;s budget. SolaGlow was built to close that gap—bringing the science of
            light therapy directly into your hands.
          </p>
        </div>
      </section>

      {/* ── Brand Story ── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

            {/* Text */}
            <div className="flex flex-col gap-6">
              <p className="text-xs font-semibold tracking-[0.18em] uppercase text-brand">
                How We Started
              </p>
              <h2 className="font-heading text-4xl sm:text-5xl font-bold text-foreground leading-tight">
                Born from Frustration,<br /> Built with Purpose
              </h2>

              <div className="flex flex-col gap-5 text-muted-foreground leading-relaxed">
                <p>
                  SolaGlow was founded by Dr. Alicia Chen, a board-certified dermatologist who spent
                  over a decade watching her patients achieve remarkable results from LED light therapy
                  in clinical settings—only to lose those gains when they couldn&apos;t afford to
                  maintain regular appointments. The technology existed. The results were
                  reproducible. But access was limited to expensive spa treatments and specialty
                  clinics that most people couldn&apos;t reach.
                </p>
                <p>
                  In 2021, Dr. Chen partnered with product designer Marcus Rivera to solve that
                  problem. Their mission was simple: engineer a device that could deliver the same
                  clinical wavelengths used in dermatology offices, wrapped in a form factor elegant
                  and simple enough for anyone to use at home. After two years of prototyping,
                  independent clinical validation, and feedback from thousands of beta users, SolaGlow
                  launched to the public.
                </p>
                <p>
                  Today, SolaGlow is trusted by hundreds of thousands of customers across the globe.
                  We combine decades of dermatological research with sleek, intuitive design and a
                  clean skincare line formulated to work synergistically with our devices. Every
                  decision we make—from ingredient sourcing to packaging—reflects our belief that
                  premium skincare should be accessible, honest, and effective.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button asChild variant="primary" size="lg">
                  <Link href="/shop">Shop Our Collection</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/science">Read the Science</Link>
                </Button>
              </div>
            </div>

            {/* Image */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden aspect-[4/5] shadow-warm-xl">
                <Image
                  src="https://placehold.co/600x750/E8D5C8/6B5B4E?text=SolaGlow+Story"
                  alt="SolaGlow founder in the lab"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              {/* Floating accent card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-warm-lg p-5 border border-border max-w-[220px]">
                <p className="font-heading text-3xl font-bold text-brand">2021</p>
                <p className="text-sm text-muted-foreground mt-1">Year SolaGlow was founded</p>
                <div className="h-px bg-border my-3" />
                <p className="font-heading text-3xl font-bold text-brand">200k+</p>
                <p className="text-sm text-muted-foreground mt-1">Customers worldwide</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-20 lg:py-24 bg-gradient-to-br from-[#F7EDE0] to-[#EDD9C8]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">

          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-brand mb-3">
              Our Principles
            </p>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-foreground mb-4">
              What We Stand For
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              These aren&apos;t just brand values—they are the commitments that guide every product
              decision we make.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div
                key={value.title}
                className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/90 p-7 flex flex-col gap-4 hover:shadow-warm-md transition-all duration-300"
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0">
                  {value.icon}
                </div>

                <h3 className="font-heading text-xl font-semibold text-foreground">
                  {value.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">

          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-brand mb-3">
              The People Behind SolaGlow
            </p>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Meet the Team
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Scientists, designers, and educators united by a shared belief that everyone deserves
              access to transformative skincare.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {team.map((member) => (
              <div
                key={member.name}
                className="bg-white rounded-2xl border border-border p-8 flex flex-col items-center text-center gap-5 hover:shadow-warm-md transition-all duration-300"
              >
                {/* Avatar */}
                <div className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-brand/10">
                  <Image
                    src={member.avatar}
                    alt={member.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>

                {/* Info */}
                <div className="flex flex-col gap-1">
                  <h3 className="font-heading text-xl font-semibold text-foreground">
                    {member.name}
                  </h3>
                  <p className="text-xs font-semibold tracking-wide uppercase text-brand">
                    {member.title}
                  </p>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Press Mention Strip ── */}
      <section className="py-12 bg-muted border-y border-border">
        <div className="max-w-5xl mx-auto px-6 lg:px-12 text-center">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-muted-foreground mb-6">
            As Seen In
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-12">
            {['Vogue', 'Allure', "Harper's Bazaar", 'Elle', 'Cosmopolitan', 'InStyle'].map(
              (pub) => (
                <span
                  key={pub}
                  className="font-heading text-lg font-semibold text-muted-foreground/60 hover:text-muted-foreground transition-colors cursor-default"
                >
                  {pub}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 lg:py-24 bg-gradient-to-br from-[#1A1A1A] to-[#2D2520]">
        <div className="max-w-3xl mx-auto px-6 lg:px-12 text-center">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-brand-light mb-5">
            Be Part of Something
          </p>
          <h2 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-6">
            Join the SolaGlow Family
          </h2>
          <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
            Hundreds of thousands of people have made SolaGlow part of their daily ritual.
            Your transformation is waiting.
          </p>
          <Button asChild variant="white" size="xl">
            <Link href="/shop">Shop the Collection</Link>
          </Button>
        </div>
      </section>

    </div>
  )
}
