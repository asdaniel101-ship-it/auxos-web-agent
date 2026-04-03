'use client'

import React, { useState } from 'react'
import Image from 'next/image'

interface ProductGalleryProps {
  images: string[]
  name: string
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-muted shadow-warm-md">
        <Image
          src={images[activeIndex]}
          alt={`${name} — image ${activeIndex + 1}`}
          fill
          className="object-cover transition-opacity duration-300"
          sizes="(max-width: 768px) 100vw, 55vw"
          priority
        />
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-3">
          {images.map((src, i) => (
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
              <Image
                src={src}
                alt={`${name} thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
