'use client'

import React from 'react'
import { Product } from '@/data/products'
import { Badge, getBadgeVariant } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { useCartStore } from '@/store/cart'
import { useRouter } from 'next/navigation'

interface ProductInfoProps {
  product: Product
}

function StarRating({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  return (
    <div className="flex items-center gap-2">
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
                    <linearGradient id={`half-detail-${star}`} x1="0" x2="1" y1="0" y2="0">
                      <stop offset="50%" stopColor="#C4956A" />
                      <stop offset="50%" stopColor="#E8E2DA" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M10 1.5l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.77l-4.77 2.44.91-5.32L2.27 7.12l5.34-.78L10 1.5z"
                    fill={`url(#half-detail-${star})`}
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
      <span className="text-sm text-muted-foreground">
        {rating.toFixed(1)} · {reviewCount.toLocaleString()} reviews
      </span>
    </div>
  )
}

const trustBadges = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
    label: 'Free Shipping',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    label: '90-Day Guarantee',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.798-1.415 2.798H4.213c-1.445 0-2.415-1.798-1.415-2.798L4.6 15.3" />
      </svg>
    ),
    label: 'Clinically Proven',
  },
]

export function ProductInfo({ product }: ProductInfoProps) {
  const addItem = useCartStore((s) => s.addItem)
  const router = useRouter()

  const handleBuyNow = () => {
    addItem({ productId: product.id, name: product.name, price: product.price, image: product.images[0], slug: product.slug })
    router.push('/checkout')
  }

  return (
    <div className="flex flex-col gap-6">
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

      {/* Tagline / description */}
      <p className="text-muted-foreground leading-relaxed">{product.tagline}</p>

      {/* CTA buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <AddToCartButton
          productId={product.id}
          name={product.name}
          price={product.price}
          image={product.images[0]}
          slug={product.slug}
          variant="primary"
          size="lg"
          className="flex-1"
        />
        <Button variant="secondary" size="lg" className="flex-1" onClick={handleBuyNow}>
          Buy Now
        </Button>
      </div>

      {/* Trust badges */}
      <div className="flex items-center justify-between gap-4 pt-2 border-t border-border">
        {trustBadges.map(({ icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-1.5 text-center flex-1">
            <span className="text-brand">{icon}</span>
            <span className="text-xs text-muted-foreground font-medium">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
