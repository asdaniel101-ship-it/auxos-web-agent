'use client'

interface ProductImageProps {
  name: string
  category?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  devices: { bg: 'from-amber-50 to-orange-100', text: 'text-amber-800' },
  skincare: { bg: 'from-rose-50 to-pink-100', text: 'text-rose-800' },
  bundles: { bg: 'from-amber-50 to-yellow-100', text: 'text-amber-900' },
  accessories: { bg: 'from-stone-50 to-stone-200', text: 'text-stone-700' },
  default: { bg: 'from-amber-50 to-orange-100', text: 'text-amber-800' },
}

export function ProductImage({ name, category = 'default', className = '', size = 'md' }: ProductImageProps) {
  const colors = categoryColors[category] || categoryColors.default
  const sizeClasses = {
    sm: 'h-48',
    md: 'h-72',
    lg: 'h-96',
  }

  return (
    <div className={`bg-gradient-to-br ${colors.bg} ${sizeClasses[size]} w-full flex items-center justify-center rounded-lg ${className}`}>
      <div className="text-center px-4">
        <div className={`${colors.text} font-medium text-lg`}>{name}</div>
        <div className={`${colors.text} opacity-60 text-sm mt-1`}>SolaGlow</div>
      </div>
    </div>
  )
}

export function BeforeAfterImage({ label, variant }: { label: string; variant: 'before' | 'after' }) {
  const bg = variant === 'before'
    ? 'bg-gradient-to-br from-stone-200 to-stone-300'
    : 'bg-gradient-to-br from-amber-100 to-orange-200'
  return (
    <div className={`${bg} aspect-square rounded-lg flex items-center justify-center`}>
      <span className="text-stone-600 font-medium">{label}</span>
    </div>
  )
}
