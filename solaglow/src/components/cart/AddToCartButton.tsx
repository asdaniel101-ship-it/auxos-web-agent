'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cart'
import { CartToast } from '@/components/ui/cart-toast'
import { ShoppingBag } from 'lucide-react'

interface AddToCartButtonProps {
  productId: string
  name: string
  price: number
  image: string
  slug: string
  quantity?: number
  variant?: 'primary' | 'secondary' | 'outline' | 'dark'
  size?: 'sm' | 'default' | 'lg' | 'xl'
  className?: string
  children?: React.ReactNode
  showIcon?: boolean
}

export function AddToCartButton({
  productId,
  name,
  price,
  image,
  slug,
  quantity = 1,
  variant = 'primary',
  size = 'default',
  className,
  children,
  showIcon = false,
}: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem)
  const [showToast, setShowToast] = useState(false)

  const handleAdd = useCallback(() => {
    addItem({ productId, name, price, image, slug }, quantity)
    setShowToast(true)
  }, [addItem, productId, name, price, image, slug, quantity])

  return (
    <>
      <Button variant={variant} size={size} className={className} onClick={handleAdd}>
        {showIcon && <ShoppingBag className="w-4 h-4 mr-2" />}
        {children || 'Add to Cart'}
      </Button>
      <CartToast
        message={`${name} added to cart`}
        visible={showToast}
        onClose={() => setShowToast(false)}
      />
    </>
  )
}
