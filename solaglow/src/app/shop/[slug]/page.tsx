import { notFound } from 'next/navigation'
import Link from 'next/link'
import { products } from '@/data/products'
import { ProductHero } from '@/components/product/ProductHero'
import { MetricsBanner } from '@/components/product/MetricsBanner'
import { TechnologySection } from '@/components/product/TechnologySection'
import { BeforeAfterSection } from '@/components/product/BeforeAfterSection'
import { HowToUse } from '@/components/product/HowToUse'
import { DoctorPanel } from '@/components/product/DoctorPanel'
import { ReviewsSection } from '@/components/product/ReviewsSection'
import { PricingTiers } from '@/components/product/PricingTiers'
import { FAQSection } from '@/components/product/FAQSection'
import { GuaranteeBanner } from '@/components/product/GuaranteeBanner'
import { RelatedProducts } from '@/components/product/RelatedProducts'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const product = products.find((p) => p.slug === slug)
  if (!product) return {}
  return {
    title: `${product.name} | SolaGlow`,
    description: product.tagline,
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params
  const product = products.find((p) => p.slug === slug)

  if (!product) {
    notFound()
  }

  const relatedProducts = products
    .filter((p) => p.id !== product.id)
    .slice(0, 4)

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-foreground transition-colors">
            Shop
          </Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>
      </div>

      {/* Section 1: Product Hero */}
      <ProductHero product={product} />

      {/* Section 2: Key Metrics Banner */}
      <MetricsBanner />

      {/* Section 3: Technology Breakdown */}
      <TechnologySection />

      {/* Section 4: Before & After Results */}
      <BeforeAfterSection />

      {/* Section 5: How to Use */}
      <HowToUse />

      {/* Section 6: Doctor Endorsement */}
      <DoctorPanel />

      {/* Section 7: Customer Reviews */}
      <ReviewsSection />

      {/* Section 8: Pricing Tiers */}
      <PricingTiers />

      {/* Section 9: FAQ */}
      <FAQSection />

      {/* Section 10: Guarantee Banner */}
      <GuaranteeBanner />

      {/* Section 11: Related Products */}
      <RelatedProducts products={relatedProducts} />
    </div>
  )
}
