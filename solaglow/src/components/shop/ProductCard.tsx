'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/data/products'
import { Badge, getBadgeVariant } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'

interface ProductCardProps {
  product: Product
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = rating >= star
        const partial = !filled && rating >= star - 0.5
        return (
          <svg
            key={star}
            className="w-3.5 h-3.5"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {partial ? (
              <>
                <defs>
                  <linearGradient id={`half-${star}`} x1="0" x2="1" y1="0" y2="0">
                    <stop offset="50%" stopColor="#C4956A" />
                    <stop offset="50%" stopColor="#E8E2DA" />
                  </linearGradient>
                </defs>
                <path
                  d="M10 1.5l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.77l-4.77 2.44.91-5.32L2.27 7.12l5.34-.78L10 1.5z"
                  fill={`url(#half-${star})`}
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

export function ProductCard({ product }: ProductCardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="group bg-white rounded-2xl shadow-warm-sm hover:shadow-warm-md transition-shadow duration-300 overflow-hidden flex flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={`/shop/${product.slug}`} className="block relative overflow-hidden aspect-square">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {product.badge && (
          <div className="absolute top-3 left-3 z-10">
            <Badge variant={getBadgeVariant(product.badge)}>{product.badge}</Badge>
          </div>
        )}
      </Link>

      <div className="flex flex-col flex-1 p-4 gap-2">
        <Link href={`/shop/${product.slug}`} className="block">
          <h3 className="font-medium text-foreground leading-snug hover:text-brand transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{product.tagline}</p>
        </Link>

        <div className="flex items-center gap-2 mt-1">
          <StarRating rating={product.rating} />
          <span className="text-xs text-muted-foreground">
            ({product.reviewCount.toLocaleString()})
          </span>
        </div>

        <div className="flex items-center gap-2 mt-auto pt-1">
          <span className="font-semibold text-foreground">{formatPrice(product.price)}</span>
          {product.comparePrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>

        {/* Add to Cart: always visible on mobile, shows on hover on desktop */}
        <div
          className={`transition-all duration-200 md:overflow-hidden ${
            hovered ? 'md:max-h-16 md:opacity-100 md:mt-2' : 'md:max-h-0 md:opacity-0'
          } mt-2`}
        >
          <Button variant="primary" size="sm" className="w-full">
            Add to Cart
          </Button>
        </div>
        {/* Always visible on mobile */}
        <div className="md:hidden mt-1">
          <Button variant="primary" size="sm" className="w-full">
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  )
}
