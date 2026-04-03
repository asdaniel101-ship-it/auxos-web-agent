'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors',
  {
    variants: {
      variant: {
        default:
          'bg-brand text-white',
        secondary:
          'bg-muted text-muted-foreground',
        outline:
          'border border-brand text-brand bg-transparent',
        'best-seller':
          'bg-brand text-white',
        new:
          'bg-foreground text-white',
        'best-value':
          'bg-brand-dark text-white',
        sale:
          'bg-red-500 text-white',
        accent:
          'bg-accent text-accent-foreground',
        'limited-edition':
          'bg-foreground text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

/**
 * Map a product badge string to the correct Badge variant
 */
function getBadgeVariant(badge: string): VariantProps<typeof badgeVariants>['variant'] {
  switch (badge.toLowerCase()) {
    case 'best seller':
      return 'best-seller'
    case 'new':
      return 'new'
    case 'best value':
      return 'best-value'
    case 'sale':
      return 'sale'
    case 'limited edition':
      return 'limited-edition'
    default:
      return 'default'
  }
}

export { Badge, badgeVariants, getBadgeVariant }
