'use client'

import React, { useState } from 'react'

const reviewsData = [
  {
    rating: 5,
    title: 'Life-changing device!',
    text: "I've been using the RadiantWave Pro for 6 weeks and the difference in my skin is incredible. Fine lines around my eyes have visibly reduced and my skin has this natural glow that I've never had before.",
    name: 'Jessica M.',
    location: 'Los Angeles',
    avatar: '/images/lifestyle/reviewer-1.jpg',
    date: 'Nov 15, 2025',
    helpful: 47,
  },
  {
    rating: 5,
    title: 'Better than my spa treatments',
    text: "I used to spend $200/month on facials. This device gives me better results at home. My aesthetician even noticed the improvement and asked what I'd been doing differently.",
    name: 'Amanda K.',
    location: 'New York',
    avatar: '/images/lifestyle/reviewer-2.jpg',
    date: 'Oct 28, 2025',
    helpful: 35,
  },
  {
    rating: 5,
    title: 'Skeptic turned believer',
    text: 'I was very skeptical about at-home LED devices, but after seeing my friend\'s results I gave it a try. Within 2 weeks my skin texture improved dramatically. The galvanic current feature makes my serums work so much better.',
    name: 'Lauren T.',
    location: 'Chicago',
    avatar: '/images/lifestyle/reviewer-3.jpg',
    date: 'Dec 3, 2025',
    helpful: 29,
  },
  {
    rating: 4,
    title: 'Great product, takes time',
    text: "Really well-made device. I noticed subtle improvements after about 3 weeks of consistent use. My skin feels firmer and looks more radiant. The warming feature is so relaxing \u2014 it's become my favorite part of my nighttime routine.",
    name: 'Sarah W.',
    location: 'Austin',
    avatar: '/images/lifestyle/reviewer-4.jpg',
    date: 'Sep 12, 2025',
    helpful: 22,
  },
  {
    rating: 5,
    title: 'My skin has never looked better',
    text: "At 45, I'd tried everything. Retinol, vitamin C, expensive creams. Nothing gave me results like this device combined with the GlowBoost serum. My husband noticed the difference after just 10 days.",
    name: 'Patricia L.',
    location: 'Miami',
    avatar: '/images/lifestyle/reviewer-5.jpg',
    date: 'Nov 2, 2025',
    helpful: 41,
  },
  {
    rating: 5,
    title: 'Worth every penny',
    text: "I bought this as a splurge and it's the best skincare investment I've ever made. My pores look smaller, my skin is smoother, and I actually look forward to my skincare routine now. The quality of the device itself feels very premium.",
    name: 'Megan R.',
    location: 'Seattle',
    avatar: '/images/lifestyle/reviewer-6.jpg',
    date: 'Oct 15, 2025',
    helpful: 33,
  },
]

const starDistribution = [
  { stars: 5, percent: 82 },
  { stars: 4, percent: 12 },
  { stars: 3, percent: 4 },
  { stars: 2, percent: 1 },
  { stars: 1, percent: 1 },
]

function StarRow({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'w-6 h-6' : size === 'md' ? 'w-5 h-5' : 'w-4 h-4'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} className={sizeClass} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M10 1.5l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.77l-4.77 2.44.91-5.32L2.27 7.12l5.34-.78L10 1.5z"
            fill={rating >= star ? '#C4956A' : '#E8E2DA'}
          />
        </svg>
      ))}
    </div>
  )
}

export function ReviewsSection() {
  const [helpfulClicked, setHelpfulClicked] = useState<Record<number, boolean>>({})

  return (
    <section id="reviews-section" data-section="reviews" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Customer Reviews
          </h2>
        </div>

        {/* Review summary bar */}
        <div className="bg-background rounded-2xl p-8 mb-12">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            {/* Left: overall rating */}
            <div className="text-center md:text-left flex-shrink-0">
              <p className="text-6xl font-heading font-bold text-foreground mb-2">4.9</p>
              <StarRow rating={4.9} size="lg" />
              <p className="text-sm text-muted-foreground mt-2">Based on 2,847 reviews</p>
            </div>

            {/* Middle: distribution bars */}
            <div className="flex-1 w-full max-w-md">
              {starDistribution.map(({ stars, percent }) => (
                <div key={stars} className="flex items-center gap-3 mb-1.5">
                  <span className="text-sm text-muted-foreground w-12 text-right">{stars} star</span>
                  <div className="flex-1 h-2.5 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-10">{percent}%</span>
                </div>
              ))}
            </div>

            {/* Right: write a review */}
            <div className="flex-shrink-0">
              <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all duration-200 border border-brand text-brand bg-transparent hover:bg-brand hover:text-white h-11 px-6 text-sm">
                Write a Review
              </button>
            </div>
          </div>
        </div>

        {/* Review cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {reviewsData.map((review, i) => (
            <div key={i} className="bg-background rounded-2xl p-6">
              {/* Stars + title */}
              <StarRow rating={review.rating} />
              <h4 className="font-semibold text-foreground mt-3 mb-2">{review.title}</h4>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">{review.text}</p>

              {/* Reviewer info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={review.avatar}
                    alt={review.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{review.name}</span>
                      <span className="text-xs bg-green-100 text-green-700 rounded-full px-2 py-0.5 font-medium">
                        Verified Buyer
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{review.date}</p>
                  </div>
                </div>

                {/* Helpful button */}
                <button
                  onClick={() => setHelpfulClicked((prev) => ({ ...prev, [i]: true }))}
                  className={`text-xs flex items-center gap-1 transition-colors ${
                    helpfulClicked[i]
                      ? 'text-brand font-medium'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
                  </svg>
                  Helpful ({helpfulClicked[i] ? review.helpful + 1 : review.helpful})
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Load more */}
        <div className="text-center mt-10">
          <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all duration-200 border border-border text-foreground bg-transparent hover:bg-muted hover:border-brand-light h-11 px-6 text-sm">
            Load More Reviews
          </button>
        </div>
      </div>
    </section>
  )
}
