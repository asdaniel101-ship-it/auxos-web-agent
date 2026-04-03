'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'

export default function CartPage() {
  const items = useCartStore((s) => s.items)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const getSubtotal = useCartStore((s) => s.getSubtotal)
  const getShipping = useCartStore((s) => s.getShipping)
  const getTotal = useCartStore((s) => s.getTotal)

  const subtotal = getSubtotal()
  const shipping = getShipping()
  const total = getTotal()
  const freeShippingThreshold = 7500
  const amountUntilFreeShipping = freeShippingThreshold - subtotal

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center gap-6">
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground">Your Cart</h1>
        <p className="text-muted-foreground text-lg">Your cart is empty.</p>
        <Button variant="primary" size="lg" asChild>
          <Link href="/shop">Continue Shopping</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-8">
          Your Cart
        </h1>

        <div className="lg:grid lg:grid-cols-3 lg:gap-12">
          {/* Cart Items — 2/3 width */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex gap-4 bg-white rounded-2xl border border-border p-4 shadow-warm-sm"
              >
                {/* Product Image */}
                <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-muted">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Item Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/products/${item.slug}`}
                      className="font-medium text-foreground hover:text-brand transition-colors line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    <button
                      onClick={() => removeItem(item.productId)}
                      aria-label={`Remove ${item.name}`}
                      className="flex-shrink-0 p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-muted"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-sm text-muted-foreground mt-1">
                    {formatPrice(item.price)} each
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 border border-border rounded-full px-1 py-1">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        aria-label="Decrease quantity"
                        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-foreground disabled:opacity-40"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-medium text-foreground">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        aria-label="Increase quantity"
                        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-foreground"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Line Total */}
                    <span className="font-semibold text-foreground">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue Shopping */}
            <div className="pt-2">
              <Link
                href="/shop"
                className="text-sm text-brand hover:text-brand-dark font-medium transition-colors"
              >
                &larr; Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary — 1/3 width */}
          <div className="mt-10 lg:mt-0 lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl border border-border p-6 shadow-warm-sm space-y-4">
              <h2 className="font-heading text-xl font-semibold text-foreground">
                Order Summary
              </h2>

              {/* Subtotal */}
              <div className="flex justify-between text-sm text-foreground">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              {/* Shipping */}
              <div className="flex justify-between text-sm text-foreground">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                  {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                </span>
              </div>

              {/* Free shipping nudge */}
              {amountUntilFreeShipping > 0 && (
                <p className="text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2">
                  Add{' '}
                  <span className="font-semibold text-foreground">
                    {formatPrice(amountUntilFreeShipping)}
                  </span>{' '}
                  more for free shipping
                </p>
              )}

              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-foreground">Total</span>
                  <span className="text-2xl font-bold text-foreground">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <Button variant="primary" size="lg" className="w-full" asChild>
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>

              {/* Trust Badges */}
              <div className="pt-2 space-y-1.5">
                {['Secure Checkout', '90-Day Guarantee', 'Free Returns'].map((badge) => (
                  <div key={badge} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="text-green-600 font-bold">&#10003;</span>
                    <span>{badge}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
