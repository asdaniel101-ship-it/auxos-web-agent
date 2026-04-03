'use client'

import React, { useState } from 'react'

interface ProductGalleryProps {
  images: string[]
  name: string
  category?: string
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div className="relative w-full rounded-3xl overflow-hidden bg-muted shadow-warm-md">
        <img
          src={images[activeIndex]}
          alt={name}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-3">
          {images.map((img, i) => (
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
              <img
                src={img}
                alt={`${name} ${i + 1}`}
                className="w-full h-full object-cover rounded-md"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
