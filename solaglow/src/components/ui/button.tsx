'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold tracking-wide uppercase transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'bg-[#1A1A1A] text-white hover:bg-[#333] active:bg-[#111] shadow-lg hover:shadow-xl hover:-translate-y-[1px] active:translate-y-0',
        secondary:
          'border-2 border-[#1A1A1A] text-[#1A1A1A] bg-transparent hover:bg-[#1A1A1A] hover:text-white transition-colors',
        outline:
          'border border-border text-foreground bg-transparent hover:bg-muted hover:border-foreground/30 transition-colors',
        ghost:
          'text-foreground hover:bg-muted hover:text-brand transition-colors',
        link:
          'text-brand underline-offset-4 hover:underline p-0 h-auto font-medium normal-case tracking-normal',
        dark:
          'bg-foreground text-white hover:bg-foreground/90 active:bg-foreground/80 shadow-lg',
        white:
          'bg-white text-foreground hover:bg-gray-50 shadow-md hover:shadow-lg border border-gray-200',
        brand:
          'bg-brand text-white hover:bg-brand-dark active:bg-brand-darker shadow-lg hover:shadow-xl hover:-translate-y-[1px] active:translate-y-0',
      },
      size: {
        sm: 'h-10 px-5 text-xs',
        default: 'h-12 px-7 text-xs',
        lg: 'h-14 px-9 text-sm',
        xl: 'h-16 px-12 text-sm',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
