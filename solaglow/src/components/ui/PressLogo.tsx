'use client'

interface PressLogoProps {
  name: string
  className?: string
}

const logoStyles: Record<string, { fontClass: string; fontWeight: string; fontSize: string; letterSpacing: string; textTransform?: string; italic?: boolean }> = {
  'Forbes': { fontClass: 'font-heading', fontWeight: 'font-bold', fontSize: 'text-2xl', letterSpacing: 'tracking-wider', textTransform: 'uppercase' },
  'Vogue': { fontClass: 'font-heading', fontWeight: 'font-normal', fontSize: 'text-3xl', letterSpacing: 'tracking-[0.3em]', textTransform: 'uppercase' },
  'Allure': { fontClass: 'font-heading', fontWeight: 'font-bold', fontSize: 'text-2xl', letterSpacing: 'tracking-widest', textTransform: 'uppercase', italic: true },
  "Harper's Bazaar": { fontClass: 'font-heading', fontWeight: 'font-light', fontSize: 'text-xl', letterSpacing: 'tracking-[0.2em]', textTransform: 'uppercase' },
  'Elle': { fontClass: 'font-sans', fontWeight: 'font-extrabold', fontSize: 'text-3xl', letterSpacing: 'tracking-[0.15em]', textTransform: 'uppercase' },
  'Cosmopolitan': { fontClass: 'font-heading', fontWeight: 'font-bold', fontSize: 'text-lg', letterSpacing: 'tracking-wide', textTransform: 'uppercase' },
  'InStyle': { fontClass: 'font-heading', fontWeight: 'font-semibold', fontSize: 'text-2xl', letterSpacing: 'tracking-tight', italic: true },
}

const defaultStyle = { fontClass: 'font-heading', fontWeight: 'font-semibold', fontSize: 'text-2xl', letterSpacing: 'tracking-wide', textTransform: 'uppercase' as string | undefined, italic: false }

export function PressLogo({ name, className = '' }: PressLogoProps) {
  const style = logoStyles[name] || defaultStyle

  return (
    <span
      className={`
        ${style.fontClass} ${style.fontWeight} ${style.fontSize} ${style.letterSpacing}
        ${style.textTransform === 'uppercase' ? 'uppercase' : ''}
        ${style.italic ? 'italic' : ''}
        text-foreground/40 hover:text-foreground/70 transition-colors duration-200
        cursor-default whitespace-nowrap select-none
        ${className}
      `}
    >
      {name}
    </span>
  )
}
