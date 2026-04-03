'use client'

import { Badge } from '@/components/ui/badge'
import { Product, products } from '@/data/products'
import { AddToCartButton } from '@/components/cart/AddToCartButton'

interface PricingTiersProps {
  product: Product
}

const tierMeta = [
  {
    name: 'Device Only',
    price: '$169.00',
    items: ['RadiantWave Pro device'],
    extras: ['Free shipping'],
    highlight: false,
    badge: null,
    savings: null,
    buttonVariant: 'secondary' as const,
  },
  {
    name: 'Starter Kit',
    price: '$199.00',
    comparePrice: '$218.00',
    items: ['RadiantWave Pro + GlowBoost Serum'],
    extras: ['Free shipping'],
    highlight: true,
    badge: 'Most Popular',
    savings: 'Save $19',
    buttonVariant: 'primary' as const,
  },
  {
    name: 'Complete System',
    price: '$289.00',
    comparePrice: '$361.00',
    items: ['RadiantWave Pro + Full Skincare Set'],
    extras: ['Free shipping + Free gift'],
    highlight: false,
    badge: 'Best Value',
    savings: 'Save $72',
    buttonVariant: 'secondary' as const,
  },
]

export function PricingTiers({ product }: PricingTiersProps) {
  const starterKit = products.find((p) => p.name === 'SolaGlow Starter Kit')!
  const completeSystem = products.find((p) => p.name === 'Complete Glow System')!

  const tierProducts = [product, starterKit, completeSystem]

  return (
    <section className="py-20 bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Choose Your Glow
          </h2>
          <p className="text-lg text-muted-foreground">Save more when you bundle</p>
        </div>

        {/* Tier cards */}
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {tierMeta.map((tier, i) => {
            const tierProduct = tierProducts[i]
            return (
              <div
                key={tier.name}
                className={`relative bg-white rounded-2xl p-8 flex flex-col ${
                  tier.highlight
                    ? 'shadow-warm-lg border-2 border-brand md:scale-105 z-10'
                    : 'shadow-warm-sm border border-border'
                }`}
              >
                {/* Badge */}
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant={tier.highlight ? 'best-seller' : 'best-value'}>
                      {tier.badge}
                    </Badge>
                  </div>
                )}

                <div className="text-center flex-1 flex flex-col">
                  <h3 className="font-heading text-xl font-semibold text-foreground mb-4">
                    {tier.name}
                  </h3>

                  {/* Price */}
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-foreground">{tier.price}</span>
                    {tier.comparePrice && (
                      <span className="text-sm text-muted-foreground line-through ml-2">
                        {tier.comparePrice}
                      </span>
                    )}
                  </div>

                  {/* Savings */}
                  {tier.savings && (
                    <p className="text-sm font-medium text-brand mb-4">{tier.savings}</p>
                  )}

                  {/* Items */}
                  <ul className="text-sm text-muted-foreground space-y-2 mb-4">
                    {tier.items.map((item) => (
                      <li key={item} className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 text-brand flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {item}
                      </li>
                    ))}
                    {tier.extras.map((extra) => (
                      <li key={extra} className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 text-brand flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {extra}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-4">
                    <AddToCartButton
                      productId={tierProduct.id}
                      name={tierProduct.name}
                      price={tierProduct.price}
                      image={tierProduct.images[0]}
                      slug={tierProduct.slug}
                      variant={tier.buttonVariant}
                      size="lg"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
