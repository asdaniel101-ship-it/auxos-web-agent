import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function CartPage() {
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
