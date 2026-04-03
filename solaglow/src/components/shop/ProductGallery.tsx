'use client'

import React, { useState } from 'react'
import { ProductImage } from '@/components/ui/ProductImage'

interface ProductGalleryProps {
  images: string[]
  name: string
  category?: string
}

export function ProductGallery({ images, name, category = 'default' }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div className="relative w-full rounded-3xl overflow-hidden bg-muted shadow-warm-md">
        <ProductImage
          name={name}
          category={category}
          size="lg"
          className="rounded-3xl"
        />
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-3">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 transition-all duration-200 ${
                i === activeIndex
                  ? 'ring-2 ring-brand ring-offset-2 opacity-100'
                  : 'opacity-60 hover:opacity-90'
              }`}
              aria-label={`View image ${i + 1}`}
            >
              <ProductImage
                name={name}
                category={category}
                size="sm"
                className="rounded-xl h-20"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
