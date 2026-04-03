'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Menu, X, ShoppingBag, Search, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { mainNav } from '@/data/navigation'
import { AnnouncementBar } from './AnnouncementBar'

interface HeaderProps {
  transparent?: boolean
}

export function Header({ transparent = false }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [cartCount] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const isTransparent = transparent && !scrolled

  return (
    <>
      <AnnouncementBar />
      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-300',
          isTransparent
            ? 'bg-transparent'
            : 'bg-white border-b border-border shadow-warm-sm'
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-[72px]">

            {/* Logo */}
            <Link
              href="/"
              className="flex-shrink-0"
              onClick={() => setMobileOpen(false)}
            >
              <span
                className={cn(
                  'font-heading text-2xl font-semibold tracking-tight transition-colors',
                  isTransparent ? 'text-white' : 'text-foreground'
                )}
              >
                SolaGlow
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav
              className="hidden lg:flex items-center gap-1"
              ref={dropdownRef}
            >
              {mainNav.map((item) => (
                <div key={item.label} className="relative">
                  {item.children ? (
                    <button
                      className={cn(
                        'flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-full transition-colors',
                        isTransparent
                          ? 'text-white/90 hover:text-white hover:bg-white/10'
                          : 'text-foreground hover:text-brand hover:bg-muted'
                      )}
                      onMouseEnter={() => setActiveDropdown(item.label)}
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      {item.label}
                      <ChevronDown
                        className={cn(
                          'w-3.5 h-3.5 transition-transform duration-200',
                          activeDropdown === item.label && 'rotate-180'
                        )}
                      />
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center px-4 py-2 text-sm font-medium rounded-full transition-colors',
                        isTransparent
                          ? 'text-white/90 hover:text-white hover:bg-white/10'
                          : 'text-foreground hover:text-brand hover:bg-muted'
                      )}
                    >
                      {item.label}
                    </Link>
                  )}

                  {/* Dropdown */}
                  {item.children && activeDropdown === item.label && (
                    <div
                      className="absolute top-full left-0 mt-1 w-52 bg-white border border-border rounded-2xl shadow-warm-lg py-2 animate-slide-down"
                      onMouseEnter={() => setActiveDropdown(item.label)}
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className="block px-4 py-2.5 text-sm text-foreground hover:text-brand hover:bg-muted transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1">
              {/* Search */}
              <button
                aria-label="Search"
                className={cn(
                  'p-2.5 rounded-full transition-colors',
                  isTransparent
                    ? 'text-white/90 hover:text-white hover:bg-white/10'
                    : 'text-foreground hover:text-brand hover:bg-muted'
                )}
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Cart */}
              <Link
                href="/cart"
                aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ''}`}
                className={cn(
                  'relative p-2.5 rounded-full transition-colors',
                  isTransparent
                    ? 'text-white/90 hover:text-white hover:bg-white/10'
                    : 'text-foreground hover:text-brand hover:bg-muted'
                )}
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold bg-brand text-white rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Mobile hamburger */}
              <button
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                onClick={() => setMobileOpen(!mobileOpen)}
                className={cn(
                  'lg:hidden p-2.5 rounded-full transition-colors ml-1',
                  isTransparent
                    ? 'text-white/90 hover:text-white hover:bg-white/10'
                    : 'text-foreground hover:text-brand hover:bg-muted'
                )}
              >
                {mobileOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 top-[calc(2.5rem+64px)] bg-white z-40 overflow-y-auto animate-slide-down">
            <nav className="px-6 py-6 space-y-1">
              {mainNav.map((item) => (
                <div key={item.label}>
                  <Link
                    href={item.href}
                    className="block py-3 text-lg font-medium text-foreground hover:text-brand border-b border-border"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <div className="pl-4 mt-1 mb-2 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className="block py-2 text-sm text-muted-foreground hover:text-brand"
                          onClick={() => setMobileOpen(false)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Mobile CTA */}
            <div className="px-6 pb-8">
              <Link
                href="/shop"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center py-3 px-6 bg-brand text-white font-medium rounded-full hover:bg-brand-dark transition-colors"
              >
                Shop All Products
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
