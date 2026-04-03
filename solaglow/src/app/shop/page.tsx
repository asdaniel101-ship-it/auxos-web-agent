'use client'

import React, { useState, useMemo } from 'react'
import { products, Product } from '@/data/products'
import { ProductCard } from '@/components/shop/ProductCard'
import { cn } from '@/lib/utils'

type Category = 'all' | Product['category']
type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'best-selling'

const categories: { label: string; value: Category }[] = [
  { label: 'All', value: 'all' },
  { label: 'Devices', value: 'devices' },
  { label: 'Skincare', value: 'skincare' },
  { label: 'Bundles', value: 'bundles' },
  { label: 'Accessories', value: 'accessories' },
]

const sortOptions: { label: string; value: SortOption }[] = [
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Best Selling', value: 'best-selling' },
]

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('all')
  const [sort, setSort] = useState<SortOption>('featured')

  const filtered = useMemo(() => {
    let list = activeCategory === 'all'
      ? [...products]
      : products.filter((p) => p.category === activeCategory)

    switch (sort) {
      case 'price-asc':
        list = list.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        list = list.sort((a, b) => b.price - a.price)
        break
      case 'best-selling':
        list = list.sort((a, b) => b.reviewCount - a.reviewCount)
        break
      default:
        // featured — keep original order
        break
    }
    return list
  }, [activeCategory, sort])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="pt-16 pb-10 px-4 text-center">
        <h1 className="font-heading text-5xl md:text-6xl font-bold text-foreground mb-4">
          Shop All
        </h1>
        <p className="text-muted-foreground text-lg max-w-lg mx-auto">
          Discover our clinically proven skincare devices and products
        </p>
      </section>

      {/* Filter + Sort bar */}
      <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setActiveCategory(value)}
                className={cn(
                  'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border',
                  activeCategory === value
                    ? 'bg-brand text-white border-brand shadow-warm-sm'
                    : 'bg-white text-muted-foreground border-border hover:border-brand-light hover:text-foreground'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <label htmlFor="sort" className="text-sm text-muted-foreground whitespace-nowrap">
              Sort by
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="text-sm border border-border rounded-full px-3 py-1.5 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1 cursor-pointer"
            >
              {sortOptions.map(({ label, value }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Product grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            No products found in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
