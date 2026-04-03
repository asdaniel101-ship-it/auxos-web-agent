'use client'

import React, { useState } from 'react'
import { Product } from '@/data/products'

interface ProductTabsProps {
  product: Product
}

const hardcodedReviews = [
  {
    name: 'Jessica M.',
    rating: 5,
    text: "I've tried every LED device on the market and nothing compares. After 6 weeks, my dermatologist actually asked what I'd been doing differently. My skin has never looked this good.",
    location: 'Los Angeles, CA',
    date: 'March 2024',
  },
  {
    name: 'Rachel T.',
    rating: 5,
    text: 'The difference in my skin texture after just one month is undeniable. My foundation goes on so much smoother now. I was skeptical at first but I am a total convert.',
    location: 'New York, NY',
    date: 'February 2024',
  },
  {
    name: 'Priya S.',
    rating: 5,
    text: 'Legitimately the best purchase I have made for my skin. I layer this with my moisturizer and my skin stays plump all day. I repurchase without hesitation every single month.',
    location: 'Chicago, IL',
    date: 'January 2024',
  },
  {
    name: 'Amanda K.',
    rating: 4,
    text: 'The routine guide is incredibly helpful and seeing results week by week keeps me motivated. My dark spots have faded noticeably after 8 weeks.',
    location: 'Austin, TX',
    date: 'December 2023',
  },
]

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} className="w-4 h-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M10 1.5l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.77l-4.77 2.44.91-5.32L2.27 7.12l5.34-.78L10 1.5z"
            fill={rating >= star ? '#C4956A' : '#E8E2DA'}
          />
        </svg>
      ))}
    </div>
  )
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

const tabs = ['Benefits', 'How to Use', 'Ingredients', 'Reviews'] as const
type Tab = (typeof tabs)[number]

export function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('Benefits')
  const [ingredientsOpen, setIngredientsOpen] = useState(false)

  return (
    <div className="mt-16">
      {/* Tab bar */}
      <div className="flex border-b border-border overflow-x-auto">
        {tabs.map((tab) => {
          // Hide Ingredients tab if no ingredients
          if (tab === 'Ingredients' && (!product.ingredients || product.ingredients.length === 0)) {
            return null
          }
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors duration-200 border-b-2 -mb-px ${
                activeTab === tab
                  ? 'border-brand text-brand'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div className="py-10">
        {/* Benefits */}
        {activeTab === 'Benefits' && (
          <ul className="grid sm:grid-cols-2 gap-4 max-w-2xl">
            {product.benefits.map((benefit, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckIcon />
                <span className="text-foreground leading-snug">{benefit}</span>
              </li>
            ))}
          </ul>
        )}

        {/* How to Use */}
        {activeTab === 'How to Use' && product.howToUse && (
          <div className="max-w-xl">
            <p className="text-muted-foreground leading-relaxed">{product.howToUse}</p>
          </div>
        )}

        {/* Ingredients */}
        {activeTab === 'Ingredients' && product.ingredients && (
          <div className="max-w-xl">
            <button
              className="flex items-center justify-between w-full text-left py-2"
              onClick={() => setIngredientsOpen((o) => !o)}
            >
              <span className="font-medium text-foreground">Full Ingredient List</span>
              <ChevronIcon open={ingredientsOpen} />
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                ingredientsOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <ul className="pt-4 flex flex-wrap gap-2">
                {product.ingredients.map((ing, i) => (
                  <li
                    key={i}
                    className="text-sm bg-muted text-muted-foreground rounded-full px-3 py-1"
                  >
                    {ing}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Reviews */}
        {activeTab === 'Reviews' && (
          <div className="space-y-6 max-w-2xl">
            {hardcodedReviews.map((review, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-warm-sm">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="font-medium text-foreground">{review.name}</p>
                    <p className="text-xs text-muted-foreground">{review.location} · {review.date}</p>
                  </div>
                  <StarRow rating={review.rating} />
                </div>
                <p className="text-muted-foreground leading-relaxed">{review.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
