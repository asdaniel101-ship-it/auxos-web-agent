'use client'

import { useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId') ?? 'SG-00000'
  const [toastVisible, setToastVisible] = useState(false)

  function handleTrackOrder() {
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 3000)
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center px-4 py-16">
      {/* Toast */}
      {toastVisible && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-foreground text-white text-sm font-medium px-5 py-3 rounded-full shadow-warm-lg animate-fade-in-up">
          Order tracking coming soon!
        </div>
      )}

      <div className="w-full max-w-lg">
        {/* Check icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-green-50 border-4 border-green-200 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground text-center mb-3">
          Thank You for Your Order!
        </h1>

        {/* Order number */}
        <p className="text-center text-brand font-semibold text-lg mb-2">
          Order #{orderId}
        </p>

        {/* Confirmation note */}
        <p className="text-center text-muted-foreground text-sm mb-8">
          We&apos;ll send a confirmation email to your email address shortly.
        </p>

        {/* Order summary card */}
        <div className="bg-white rounded-2xl border border-border p-6 shadow-warm-sm mb-8 space-y-4">
          <h2 className="font-heading text-xl font-semibold text-foreground">
            What Happens Next?
          </h2>
          <ul className="space-y-3">
            {[
              { step: '1', text: 'Order confirmed — you will receive an email confirmation.' },
              { step: '2', text: 'Processing — your order will be prepared within 1 business day.' },
              { step: '3', text: 'Shipped — tracking information will be emailed to you.' },
              { step: '4', text: 'Delivered — typically 3–5 business days.' },
            ].map(({ step, text }) => (
              <li key={step} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand text-white text-xs font-bold flex items-center justify-center mt-0.5">
                  {step}
                </span>
                <p className="text-sm text-foreground">{text}</p>
              </li>
            ))}
          </ul>

          {/* Trust badges */}
          <div className="border-t border-border pt-4 space-y-1.5">
            {['90-Day Money-Back Guarantee', 'Free Returns', 'Secure & Encrypted Checkout'].map((badge) => (
              <div key={badge} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="text-green-600 font-bold">&#10003;</span>
                <span>{badge}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="primary" size="lg" className="flex-1" asChild>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
          <Button variant="outline" size="lg" className="flex-1" onClick={handleTrackOrder}>
            Track Order
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading...</div>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  )
}
