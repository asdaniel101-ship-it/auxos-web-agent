'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Lock, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface ShippingInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  address1: string
  address2: string
  city: string
  state: string
  zip: string
}

interface PaymentInfo {
  cardNumber: string
  expiration: string
  cvv: string
  nameOnCard: string
}

const emptyShipping: ShippingInfo = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  zip: '',
}

const emptyPayment: PaymentInfo = {
  cardNumber: '',
  expiration: '',
  cvv: '',
  nameOnCard: '',
}

function StepIndicator({ current }: { current: number }) {
  const steps = [
    { number: 1, label: 'Shipping' },
    { number: 2, label: 'Payment' },
    { number: 3, label: 'Review' },
  ]

  return (
    <div className="flex items-center justify-center mb-10">
      {steps.map((step, idx) => {
        const isCompleted = current > step.number
        const isActive = current === step.number
        return (
          <div key={step.number} className="flex items-center">
            {/* Circle */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all',
                  isCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : isActive
                    ? 'bg-brand border-brand text-white'
                    : 'bg-white border-border text-muted-foreground'
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : step.number}
              </div>
              <span
                className={cn(
                  'text-xs font-medium',
                  isActive ? 'text-brand' : isCompleted ? 'text-green-600' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </div>
            {/* Connector line */}
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  'h-0.5 w-16 sm:w-24 mx-2 mb-4 rounded-full transition-all',
                  current > step.number ? 'bg-green-400' : 'bg-border'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

function InputField({
  label,
  id,
  optional,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string
  id: string
  optional?: boolean
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {optional && <span className="ml-1 text-muted-foreground font-normal">(optional)</span>}
      </label>
      <input
        id={id}
        {...props}
        className={cn(
          'h-11 w-full rounded-xl border border-border bg-white px-3.5 text-sm text-foreground placeholder:text-muted-foreground',
          'focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-colors',
          props.className
        )}
      />
    </div>
  )
}

function OrderSidebar() {
  const items = useCartStore((s) => s.items)
  const getSubtotal = useCartStore((s) => s.getSubtotal)
  const getShipping = useCartStore((s) => s.getShipping)
  const getTotal = useCartStore((s) => s.getTotal)

  const subtotal = getSubtotal()
  const shipping = getShipping()
  const total = getTotal()

  return (
    <div className="sticky top-24 bg-white rounded-2xl border border-border p-6 shadow-warm-sm space-y-5">
      <h2 className="font-heading text-xl font-semibold text-foreground">Order Summary</h2>

      {/* Items */}
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center gap-3">
            <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-muted border border-border">
              <Image src={item.image} alt={item.name} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground line-clamp-1">{item.name}</p>
              <p className="text-xs text-muted-foreground">Qty {item.quantity} × {formatPrice(item.price)}</p>
            </div>
            <span className="text-sm font-semibold text-foreground flex-shrink-0">
              {formatPrice(item.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-4 space-y-2">
        <div className="flex justify-between text-sm text-foreground">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-foreground">
          <span>Shipping</span>
          <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
            {shipping === 0 ? 'FREE' : formatPrice(shipping)}
          </span>
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <div className="flex justify-between items-center">
          <span className="text-base font-bold text-foreground">Total</span>
          <span className="text-2xl font-bold text-foreground">{formatPrice(total)}</span>
        </div>
      </div>

      {/* Secure badge */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted rounded-xl px-3 py-2">
        <Lock className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
        <span>Secure checkout — SSL encrypted</span>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const items = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clearCart)
  const getSubtotal = useCartStore((s) => s.getSubtotal)
  const getShipping = useCartStore((s) => s.getShipping)
  const getTotal = useCartStore((s) => s.getTotal)

  const [mounted, setMounted] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>(emptyShipping)
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>(emptyPayment)
  const [shippingErrors, setShippingErrors] = useState<Partial<ShippingInfo>>({})
  const [paymentErrors, setPaymentErrors] = useState<Partial<PaymentInfo>>({})

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && items.length === 0) {
      router.push('/cart')
    }
  }, [items, router, mounted])

  // Don't render until mounted (avoids flash redirect on hydration)
  if (!mounted) {
    return null
  }

  if (items.length === 0) {
    return null
  }

  // --- Step 1: Shipping ---
  function validateShipping(): boolean {
    const required: (keyof ShippingInfo)[] = [
      'firstName', 'lastName', 'email', 'address1', 'city', 'state', 'zip',
    ]
    const errors: Partial<ShippingInfo> = {}
    let valid = true
    for (const field of required) {
      if (!shippingInfo[field].trim()) {
        errors[field] = 'Required'
        valid = false
      }
    }
    setShippingErrors(errors)
    return valid
  }

  function handleContinueToPayment() {
    if (validateShipping()) {
      setCurrentStep(2)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // --- Step 2: Payment ---
  function validatePayment(): boolean {
    const required: (keyof PaymentInfo)[] = ['cardNumber', 'expiration', 'cvv', 'nameOnCard']
    const errors: Partial<PaymentInfo> = {}
    let valid = true
    for (const field of required) {
      if (!paymentInfo[field].trim()) {
        errors[field] = 'Required'
        valid = false
      }
    }
    setPaymentErrors(errors)
    return valid
  }

  function handleReviewOrder() {
    if (validatePayment()) {
      setCurrentStep(3)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // --- Step 3: Place Order ---
  function handlePlaceOrder() {
    const orderId = 'SG-' + Math.floor(10000 + Math.random() * 90000)
    clearCart()
    router.push(`/checkout/confirmation?orderId=${orderId}`)
  }

  const subtotal = getSubtotal()
  const shipping = getShipping()
  const total = getTotal()
  const lastFour = paymentInfo.cardNumber.replace(/\s/g, '').slice(-4)

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">
          Checkout
        </h1>

        <StepIndicator current={currentStep} />

        <div className="lg:grid lg:grid-cols-3 lg:gap-10">
          {/* Left column — form steps */}
          <div className="lg:col-span-2">

            {/* =================== STEP 1: SHIPPING =================== */}
            {currentStep === 1 && (
              <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-warm-sm space-y-6">
                <h2 className="font-heading text-2xl font-semibold text-foreground">
                  Shipping Information
                </h2>

                {/* First + Last name */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <InputField
                      label="First Name"
                      id="firstName"
                      placeholder="Jane"
                      value={shippingInfo.firstName}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, firstName: e.target.value })}
                    />
                    {shippingErrors.firstName && (
                      <p className="text-xs text-destructive mt-1">{shippingErrors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <InputField
                      label="Last Name"
                      id="lastName"
                      placeholder="Doe"
                      value={shippingInfo.lastName}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, lastName: e.target.value })}
                    />
                    {shippingErrors.lastName && (
                      <p className="text-xs text-destructive mt-1">{shippingErrors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <InputField
                    label="Email"
                    id="email"
                    type="email"
                    placeholder="jane@example.com"
                    value={shippingInfo.email}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                  />
                  {shippingErrors.email && (
                    <p className="text-xs text-destructive mt-1">{shippingErrors.email}</p>
                  )}
                </div>

                {/* Phone (optional) */}
                <InputField
                  label="Phone"
                  id="phone"
                  type="tel"
                  placeholder="(555) 000-0000"
                  optional
                  value={shippingInfo.phone}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                />

                {/* Address line 1 */}
                <div>
                  <InputField
                    label="Address Line 1"
                    id="address1"
                    placeholder="123 Main Street"
                    value={shippingInfo.address1}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, address1: e.target.value })}
                  />
                  {shippingErrors.address1 && (
                    <p className="text-xs text-destructive mt-1">{shippingErrors.address1}</p>
                  )}
                </div>

                {/* Address line 2 (optional) */}
                <InputField
                  label="Address Line 2"
                  id="address2"
                  placeholder="Apt, suite, unit..."
                  optional
                  value={shippingInfo.address2}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, address2: e.target.value })}
                />

                {/* City / State / ZIP */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <InputField
                      label="City"
                      id="city"
                      placeholder="New York"
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                    />
                    {shippingErrors.city && (
                      <p className="text-xs text-destructive mt-1">{shippingErrors.city}</p>
                    )}
                  </div>
                  <div>
                    <InputField
                      label="State"
                      id="state"
                      placeholder="NY"
                      value={shippingInfo.state}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                    />
                    {shippingErrors.state && (
                      <p className="text-xs text-destructive mt-1">{shippingErrors.state}</p>
                    )}
                  </div>
                  <div>
                    <InputField
                      label="ZIP Code"
                      id="zip"
                      placeholder="10001"
                      value={shippingInfo.zip}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, zip: e.target.value })}
                    />
                    {shippingErrors.zip && (
                      <p className="text-xs text-destructive mt-1">{shippingErrors.zip}</p>
                    )}
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full mt-2"
                  onClick={handleContinueToPayment}
                >
                  Continue to Payment
                </Button>
              </div>
            )}

            {/* =================== STEP 2: PAYMENT =================== */}
            {currentStep === 2 && (
              <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-warm-sm space-y-6">
                <h2 className="font-heading text-2xl font-semibold text-foreground">
                  Payment Information
                </h2>

                {/* Shipping summary */}
                <div className="bg-muted rounded-xl px-4 py-3 flex items-start justify-between gap-4">
                  <div className="text-sm text-foreground">
                    <p className="font-medium">{shippingInfo.firstName} {shippingInfo.lastName}</p>
                    <p className="text-muted-foreground">
                      {shippingInfo.address1}{shippingInfo.address2 ? `, ${shippingInfo.address2}` : ''},{' '}
                      {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zip}
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="text-sm text-brand hover:text-brand-dark font-medium transition-colors flex-shrink-0"
                  >
                    Edit
                  </button>
                </div>

                {/* Card number */}
                <div>
                  <InputField
                    label="Card Number"
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={paymentInfo.cardNumber}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })}
                  />
                  {paymentErrors.cardNumber && (
                    <p className="text-xs text-destructive mt-1">{paymentErrors.cardNumber}</p>
                  )}
                </div>

                {/* Expiration + CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <InputField
                      label="Expiration Date"
                      id="expiration"
                      placeholder="MM/YY"
                      value={paymentInfo.expiration}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, expiration: e.target.value })}
                    />
                    {paymentErrors.expiration && (
                      <p className="text-xs text-destructive mt-1">{paymentErrors.expiration}</p>
                    )}
                  </div>
                  <div>
                    <InputField
                      label="CVV"
                      id="cvv"
                      placeholder="123"
                      value={paymentInfo.cvv}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value })}
                    />
                    {paymentErrors.cvv && (
                      <p className="text-xs text-destructive mt-1">{paymentErrors.cvv}</p>
                    )}
                  </div>
                </div>

                {/* Name on card */}
                <div>
                  <InputField
                    label="Name on Card"
                    id="nameOnCard"
                    placeholder="Jane Doe"
                    value={paymentInfo.nameOnCard}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, nameOnCard: e.target.value })}
                  />
                  {paymentErrors.nameOnCard && (
                    <p className="text-xs text-destructive mt-1">{paymentErrors.nameOnCard}</p>
                  )}
                </div>

                {/* Accepted cards */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock className="w-3.5 h-3.5 text-green-600" />
                  <span>We accept: Visa, Mastercard, Amex, PayPal</span>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full mt-2"
                  onClick={handleReviewOrder}
                >
                  Review Order
                </Button>
              </div>
            )}

            {/* =================== STEP 3: REVIEW =================== */}
            {currentStep === 3 && (
              <div className="space-y-5">
                {/* Shipping card */}
                <div className="bg-white rounded-2xl border border-border p-6 shadow-warm-sm">
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-3">
                    Shipping To
                  </h3>
                  <div className="text-sm text-foreground space-y-0.5">
                    <p className="font-medium">{shippingInfo.firstName} {shippingInfo.lastName}</p>
                    <p className="text-muted-foreground">{shippingInfo.email}</p>
                    <p className="text-muted-foreground">
                      {shippingInfo.address1}
                      {shippingInfo.address2 ? `, ${shippingInfo.address2}` : ''}
                    </p>
                    <p className="text-muted-foreground">
                      {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zip}
                    </p>
                  </div>
                </div>

                {/* Payment card */}
                <div className="bg-white rounded-2xl border border-border p-6 shadow-warm-sm">
                  <div className="flex items-start justify-between">
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-3">
                      Payment
                    </h3>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="text-sm text-brand hover:text-brand-dark font-medium transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="text-sm text-foreground space-y-0.5">
                    <p>{paymentInfo.nameOnCard}</p>
                    <p className="text-muted-foreground">
                      Card ending in {lastFour || '····'}
                    </p>
                  </div>
                </div>

                {/* Order items card */}
                <div className="bg-white rounded-2xl border border-border p-6 shadow-warm-sm">
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
                    Order Items
                  </h3>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.productId} className="flex items-center gap-3">
                        <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted border border-border">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Qty {item.quantity} × {formatPrice(item.price)}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="border-t border-border mt-5 pt-4 space-y-2">
                    <div className="flex justify-between text-sm text-foreground">
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-foreground">
                      <span>Shipping</span>
                      <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                        {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-border">
                      <span className="font-bold text-foreground">Total</span>
                      <span className="text-xl font-bold text-foreground">{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>

                {/* Place order button */}
                <Button
                  variant="primary"
                  size="xl"
                  className="w-full"
                  onClick={handlePlaceOrder}
                >
                  Place Order — {formatPrice(total)}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By placing your order you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            )}
          </div>

          {/* Right column — order sidebar */}
          <div className="mt-10 lg:mt-0 lg:col-span-1">
            <OrderSidebar />
          </div>
        </div>
      </div>
    </div>
  )
}
