'use client'

import React, { useState } from 'react'
import { Product } from '@/data/products'
import { ProductGallery } from '@/components/shop/ProductGallery'
import { Badge, getBadgeVariant } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { AddToCartButton } from '@/components/cart/AddToCartButton'

interface ProductHeroProps {
  product: Product
}

function StarRating({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  return (
    <button
      onClick={() => {
        const el = document.getElementById('reviews-section')
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }}
      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
    >
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = rating >= star
          const partial = !filled && rating >= star - 0.5
          return (
            <svg
              key={star}
              className="w-4 h-4"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {partial ? (
                <>
                  <defs>
                    <linearGradient id={`half-hero-${star}`} x1="0" x2="1" y1="0" y2="0">
                      <stop offset="50%" stopColor="#C4956A" />
                      <stop offset="50%" stopColor="#E8E2DA" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M10 1.5l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.77l-4.77 2.44.91-5.32L2.27 7.12l5.34-.78L10 1.5z"
                    fill={`url(#half-hero-${star})`}
                  />
                </>
              ) : (
                <path
                  d="M10 1.5l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.77l-4.77 2.44.91-5.32L2.27 7.12l5.34-.78L10 1.5z"
                  fill={filled ? '#C4956A' : '#E8E2DA'}
                />
              )}
            </svg>
          )
        })}
      </div>
      <span className="text-sm text-muted-foreground underline">
        {rating.toFixed(1)} ({reviewCount.toLocaleString()} reviews)
      </span>
    </button>
  )
}

const colorSwatches = [
  { name: 'Rose Gold', color: '#B76E79' },
  { name: 'Gold', color: '#C4956A' },
  { name: 'Charcoal', color: '#4A4A4A' },
]

const trustItems = [
  { check: true, label: 'Free Shipping' },
  { check: true, label: '90-Day Guarantee' },
  { check: true, label: 'Clinically Proven' },
]

const paymentMethods = ['Visa', 'Mastercard', 'Amex', 'PayPal']

export function ProductHero({ product }: ProductHeroProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState(0)

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-12 xl:gap-16">
        {/* Left: Gallery (55%) */}
        <div className="lg:w-[55%]">
          <ProductGallery images={product.images} name={product.name} category={product.category} />
        </div>

        {/* Right: Info (45%) */}
        <div className="lg:w-[45%] lg:sticky lg:top-24 self-start">
          <div className="flex flex-col gap-5">
            {/* Badge */}
            {product.badge && (
              <div>
                <Badge variant={getBadgeVariant(product.badge)}>{product.badge}</Badge>
              </div>
            )}

            {/* Name */}
            <h1 className="font-heading text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              {product.name}
            </h1>

            {/* Star rating */}
            <StarRating rating={product.rating} reviewCount={product.reviewCount} />

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-semibold text-foreground">{formatPrice(product.price)}</span>
              {product.comparePrice && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.comparePrice)}
                </span>
              )}
              {product.comparePrice && (
                <span className="text-sm font-medium text-brand bg-brand/10 rounded-full px-2.5 py-0.5">
                  Save {formatPrice(product.comparePrice - product.price)}
                </span>
              )}
            </div>

            {/* Short description */}
            <p className="text-muted-foreground leading-relaxed">{product.tagline}</p>

            {/* Color selector */}
            {product.category === 'devices' && (
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-foreground">
                  Color: <span className="text-muted-foreground">{colorSwatches[selectedColor].name}</span>
                </span>
                <div className="flex items-center gap-3">
                  {colorSwatches.map((swatch, i) => (
                    <button
                      key={swatch.name}
                      onClick={() => setSelectedColor(i)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        i === selectedColor
                          ? 'border-brand scale-110 shadow-warm-sm'
                          : 'border-border hover:border-brand-light'
                      }`}
                      style={{ backgroundColor: swatch.color }}
                      aria-label={`Select ${swatch.name}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quantity selector */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-foreground">Quantity</span>
              <div className="flex items-center gap-0">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center border border-border rounded-l-lg text-foreground hover:bg-muted transition-colors"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="w-12 h-10 flex items-center justify-center border-y border-border text-foreground text-sm font-medium">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center border border-border rounded-r-lg text-foreground hover:bg-muted transition-colors"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col gap-3">
              <AddToCartButton
                productId={product.id}
                name={product.name}
                price={product.price}
                image={product.images[0]}
                slug={product.slug}
                quantity={quantity}
                variant="primary"
                size="xl"
                className="w-full text-base"
              >
                Add to Cart — {formatPrice(product.price * quantity)}
              </AddToCartButton>
              <Button variant="secondary" size="lg" className="w-full">
                Buy Now
              </Button>
            </div>

            {/* Trust row */}
            <div className="flex items-center gap-4 pt-4 border-t border-border">
              {trustItems.map(({ label }) => (
                <div key={label} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <svg className="w-4 h-4 text-brand flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{label}</span>
                </div>
              ))}
            </div>

            {/* Payment methods */}
            <div className="flex items-center gap-3 pt-2">
              <span className="text-xs text-muted-foreground">Accepted:</span>
              {paymentMethods.map((method) => (
                <span
                  key={method}
                  className="text-xs font-medium text-muted-foreground bg-muted rounded px-2 py-1"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
