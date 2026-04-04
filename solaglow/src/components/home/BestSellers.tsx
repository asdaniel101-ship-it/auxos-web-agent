'use client'

import Link from 'next/link'
import { products } from '@/data/products'
import { formatPrice } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { AddToCartButton } from '@/components/cart/AddToCartButton'

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-3.5 h-3.5 fill-current ${star <= Math.round(rating) ? 'text-brand' : 'text-border'}`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-xs text-muted-foreground">({count.toLocaleString()})</span>
    </div>
  )
}

function badgeVariantFor(badge: string) {
  switch (badge.toLowerCase()) {
    case 'best seller': return 'best-seller' as const
    case 'new': return 'new' as const
    case 'best value': return 'best-value' as const
    case 'sale': return 'sale' as const
    case 'limited edition': return 'limited-edition' as const
    default: return 'default' as const
  }
}

const bestSellers = products.filter((p) => p.badge === 'Best Seller')
const displayProducts = bestSellers.length >= 4 ? bestSellers.slice(0, 4) : products.slice(0, 4)

export default function BestSellers() {
  return (
    <section data-section="best-sellers" className="py-20 lg:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Section header */}
        <div className="text-center mb-14">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-brand mb-3">Top Picks</p>
          <h2 className="font-heading text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Best Sellers
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Our most-loved products, backed by thousands of 5-star reviews
          </p>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayProducts.map((product) => (
            <div
              key={product.id}
              className="group bg-card rounded-2xl overflow-hidden border border-border/50 card-shadow hover:shadow-warm-lg transition-all duration-300 hover:-translate-y-1 flex flex-col"
            >
              {/* Product image */}
              <div className="relative overflow-hidden bg-accent/20">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {product.badge && (
                  <div className="absolute top-3 left-3 z-10">
                    <Badge variant={badgeVariantFor(product.badge)}>
                      {product.badge}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Product info */}
              <div className="p-5 flex flex-col gap-3 flex-1">
                <div>
                  <h3 className="font-heading font-semibold text-lg text-foreground leading-tight">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {product.tagline}
                  </p>
                </div>

                <StarRating rating={product.rating} count={product.reviewCount} />

                <div className="flex items-center gap-2 mt-auto">
                  <span className="text-lg font-bold text-foreground">
                    {formatPrice(product.price)}
                  </span>
                  {product.comparePrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(product.comparePrice)}
                    </span>
                  )}
                </div>

                <AddToCartButton
                  productId={product.id}
                  name={product.name}
                  price={product.price}
                  image={product.images[0]}
                  slug={product.slug}
                  variant="primary"
                  size="default"
                  className="w-full mt-1"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Shop all link */}
        <div className="text-center mt-12">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-brand font-semibold text-sm hover:text-brand-dark transition-colors group"
          >
            Shop All Products
            <svg
              className="w-4 h-4 group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

      </div>
    </section>
  )
}
