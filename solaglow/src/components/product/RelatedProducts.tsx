'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Product } from '@/data/products'
import { Badge, getBadgeVariant } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'

interface RelatedProductsProps {
  products: Product[]
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = rating >= star
        const partial = !filled && rating >= star - 0.5
        return (
          <svg key={star} className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            {partial ? (
              <>
                <defs>
                  <linearGradient id={`half-rel-${star}`} x1="0" x2="1" y1="0" y2="0">
                    <stop offset="50%" stopColor="#C4956A" />
                    <stop offset="50%" stopColor="#E8E2DA" />
                  </linearGradient>
                </defs>
                <path
                  d="M10 1.5l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.77l-4.77 2.44.91-5.32L2.27 7.12l5.34-.78L10 1.5z"
                  fill={`url(#half-rel-${star})`}
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
  )
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Complete Your Routine
          </h2>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-2xl shadow-warm-sm hover:shadow-warm-md transition-shadow duration-300 overflow-hidden flex flex-col"
            >
              <Link href={`/shop/${product.slug}`} className="block relative overflow-hidden">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {product.badge && (
                  <div className="absolute top-3 left-3 z-10">
                    <Badge variant={getBadgeVariant(product.badge)}>{product.badge}</Badge>
                  </div>
                )}
              </Link>
              <div className="flex flex-col flex-1 p-4 gap-2">
                <Link href={`/shop/${product.slug}`} className="block">
                  <h3 className="font-medium text-foreground leading-snug hover:text-brand transition-colors text-sm">
                    {product.name}
                  </h3>
                </Link>
                <div className="flex items-center gap-2">
                  <StarRating rating={product.rating} />
                  <span className="text-xs text-muted-foreground">({product.reviewCount.toLocaleString()})</span>
                </div>
                <div className="flex items-center gap-2 mt-auto pt-1">
                  <span className="font-semibold text-foreground text-sm">{formatPrice(product.price)}</span>
                  {product.comparePrice && (
                    <span className="text-xs text-muted-foreground line-through">{formatPrice(product.comparePrice)}</span>
                  )}
                </div>
                <Button variant="primary" size="sm" className="w-full mt-2">
                  Add to Cart
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
