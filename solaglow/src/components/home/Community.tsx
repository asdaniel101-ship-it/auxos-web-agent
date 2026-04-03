const communityImages = [
  { handle: '@solaglow', bg: 'from-amber-100 to-orange-200', span: 'col-span-1 row-span-1' },
  { handle: '@glowwithme', bg: 'from-rose-100 to-pink-200', span: 'col-span-1 row-span-2' },
  { handle: '@skincarejoy', bg: 'from-amber-50 to-yellow-100', span: 'col-span-1 row-span-1' },
  { handle: '@radiantlife', bg: 'from-orange-100 to-amber-200', span: 'col-span-2 row-span-1' },
  { handle: '@glowup', bg: 'from-rose-50 to-rose-200', span: 'col-span-1 row-span-1' },
  { handle: '@solabeauty', bg: 'from-amber-100 to-stone-200', span: 'col-span-1 row-span-1' },
]

export default function Community() {
  return (
    <section className="py-20 lg:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-brand mb-3">
            #SolaGlow
          </p>
          <h2 className="font-heading text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Join the #SolaGlow Community
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Tag us in your glow-up and be featured on our page.
          </p>
        </div>

        {/* Instagram grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 auto-rows-[200px]">
          {communityImages.map((img, index) => (
            <div
              key={index}
              className={`group relative overflow-hidden rounded-2xl ${img.span}`}
            >
              <div className={`bg-gradient-to-br ${img.bg} w-full h-full flex items-center justify-center`}>
                <span className="text-stone-500 font-medium text-sm">{img.handle}</span>
              </div>
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Follow link */}
        <div className="text-center mt-10">
          <a
            href="https://instagram.com/solaglow"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 text-foreground font-semibold text-sm hover:text-brand transition-colors group border border-border hover:border-brand rounded-full px-6 py-3"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            Follow Us @SolaGlow
          </a>
        </div>

      </div>
    </section>
  )
}
