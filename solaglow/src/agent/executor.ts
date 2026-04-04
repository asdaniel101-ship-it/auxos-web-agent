import { products } from '@/data/products'
import { useCartStore } from '@/store/cart'
import { findProof } from './proof-map'

interface ToolResult {
  success: boolean
  data?: unknown
  error?: string
}

export function executeTool(
  toolName: string,
  input: Record<string, unknown>,
): ToolResult {
  try {
    switch (toolName) {
      case 'navigate_to': {
        const page = input.page as string
        const path = page === 'home' ? '/' : `/${page}`
        return { success: true, data: { navigate: path } }
      }

      case 'scroll_to_section': {
        const section = input.section as string
        return { success: true, data: { scrollTo: section } }
      }

      case 'show_product': {
        const slug = input.slug as string
        const product = products.find((p) => p.slug === slug)
        if (!product) return { success: false, error: `Product "${slug}" not found` }
        return {
          success: true,
          data: {
            navigate: `/shop/${slug}`,
            product: {
              name: product.name,
              tagline: product.tagline,
              price: `$${(product.price / 100).toFixed(2)}`,
              rating: product.rating,
              reviewCount: product.reviewCount,
              benefits: product.benefits,
              ingredients: product.ingredients,
              badge: product.badge,
            },
          },
        }
      }

      case 'find_proof': {
        const concern = input.concern as string
        const result = findProof(concern)
        // Navigate to the first proof entry's page
        const firstEntry = result.entries[0]
        return {
          success: true,
          data: {
            navigate: firstEntry.page.startsWith('/shop/')
              ? firstEntry.page
              : firstEntry.page === '/'
                ? '/'
                : firstEntry.page,
            scrollTo: firstEntry.section,
            proof: result,
          },
        }
      }

      case 'compare_products': {
        const slugA = input.product_a as string
        const slugB = input.product_b as string
        const productA = products.find((p) => p.slug === slugA)
        const productB = products.find((p) => p.slug === slugB)
        if (!productA) return { success: false, error: `Product "${slugA}" not found` }
        if (!productB) return { success: false, error: `Product "${slugB}" not found` }

        return {
          success: true,
          data: {
            navigate: `/shop/${slugA}`,
            comparison: {
              a: {
                name: productA.name,
                price: `$${(productA.price / 100).toFixed(2)}`,
                rating: productA.rating,
                reviewCount: productA.reviewCount,
                category: productA.category,
                benefits: productA.benefits,
                badge: productA.badge,
              },
              b: {
                name: productB.name,
                price: `$${(productB.price / 100).toFixed(2)}`,
                rating: productB.rating,
                reviewCount: productB.reviewCount,
                category: productB.category,
                benefits: productB.benefits,
                badge: productB.badge,
              },
            },
          },
        }
      }

      case 'add_to_cart': {
        const slug = input.slug as string
        const quantity = (input.quantity as number) || 1
        const product = products.find((p) => p.slug === slug)
        if (!product) return { success: false, error: `Product "${slug}" not found` }

        const cart = useCartStore.getState()
        cart.addItem(
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0],
            slug: product.slug,
          },
          quantity
        )

        const subtotal = useCartStore.getState().getSubtotal()
        const itemCount = useCartStore.getState().getItemCount()
        return {
          success: true,
          data: {
            added: product.name,
            quantity,
            cartItemCount: itemCount,
            cartSubtotal: `$${(subtotal / 100).toFixed(2)}`,
            freeShipping: subtotal >= 7500,
          },
        }
      }

      case 'apply_filter': {
        const category = input.category as string | undefined
        const sort = input.sort as string | undefined
        return {
          success: true,
          data: {
            navigate: '/shop',
            filter: { category, sort },
          },
        }
      }

      case 'fill_checkout_field': {
        const field = input.field as string
        const value = input.value as string
        return {
          success: true,
          data: {
            fillField: { field, value },
          },
        }
      }

      default:
        return { success: false, error: `Unknown tool: ${toolName}` }
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Tool execution failed' }
  }
}
