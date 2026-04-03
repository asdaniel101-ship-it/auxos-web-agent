import { notFound } from 'next/navigation'
import Link from 'next/link'
import { products } from '@/data/products'
import { ProductGallery } from '@/components/shop/ProductGallery'
import { ProductInfo } from '@/components/shop/ProductInfo'
import { ProductTabs } from '@/components/shop/ProductTabs'

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

      {/* Split layout: Gallery + Info */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-12 xl:gap-16">
          {/* Left: Gallery (55%) */}
          <div className="lg:w-[55%]">
            <ProductGallery images={product.images} name={product.name} category={product.category} />
          </div>

          {/* Right: Info (45%) */}
          <div className="lg:w-[45%] lg:sticky lg:top-24 self-start">
            <ProductInfo product={product} />
          </div>
        </div>
      </section>

      {/* Below the fold: Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <ProductTabs product={product} />
      </section>
    </div>
  )
}
