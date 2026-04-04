import { custom } from '@auxos/agent'
import type { AuxosTool } from '@auxos/agent'
import { products } from '@/data/products'
import type { CartStore } from '@/store/cart'

const PAGE_MAP: Record<string, string> = {
  home: '/',
  shop: '/shop',
  about: '/about',
  science: '/science',
  results: '/results',
  cart: '/cart',
  checkout: '/checkout',
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

function toProductSummary(p: (typeof products)[number]) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    tagline: p.tagline,
    price: formatPrice(p.price),
    category: p.category,
    rating: p.rating,
    reviewCount: p.reviewCount,
    inStock: p.inStock,
    badge: p.badge,
  }
}

export function createSolaGlowTools(
  getCart?: () => CartStore
): AuxosTool[] {
  const cart = getCart ?? (() => null as unknown as CartStore)

  return [
    // 1. navigate_to
    custom({
      name: 'navigate_to',
      description: `Navigate to a page. Valid pages: ${Object.keys(PAGE_MAP).join(', ')}`,
      parameters: {
        type: 'object',
        properties: {
          page: {
            type: 'string',
            description: 'Page name to navigate to',
            enum: Object.keys(PAGE_MAP),
          },
        },
        required: ['page'],
      },
      execute: (input) => {
        const page = input.page as string
        const path = PAGE_MAP[page]
        if (!path) {
          return { success: false, error: `Unknown page: ${page}. Valid pages: ${Object.keys(PAGE_MAP).join(', ')}` }
        }
        return { success: true, data: { navigate: path } }
      },
    }),

    // 2. navigate_to_product
    custom({
      name: 'navigate_to_product',
      description: 'Navigate to a specific product page by slug',
      parameters: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'Product slug' },
        },
        required: ['slug'],
      },
      execute: (input) => {
        const slug = input.slug as string
        const product = products.find((p) => p.slug === slug)
        if (!product) {
          return { success: false, error: `Product not found: ${slug}` }
        }
        return { success: true, data: { navigate: `/shop/${slug}` } }
      },
    }),

    // 3. search_products
    custom({
      name: 'search_products',
      description: 'Search products by name, description, category, benefits, or ingredients',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
        },
        required: ['query'],
      },
      execute: (input) => {
        const query = (input.query as string).toLowerCase()
        const results = products.filter((p) => {
          const searchable = [
            p.name,
            p.description,
            p.category,
            ...p.benefits,
            ...(p.ingredients || []),
          ]
            .join(' ')
            .toLowerCase()
          return searchable.includes(query)
        })
        return {
          success: true,
          data: results.map(toProductSummary),
        }
      },
    }),

    // 4. list_products
    custom({
      name: 'list_products',
      description: 'List all products, optionally filtered by category',
      parameters: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            description: 'Filter by category',
            enum: ['devices', 'skincare', 'bundles', 'accessories'],
          },
        },
      },
      execute: (input) => {
        const category = input.category as string | undefined
        const filtered = category
          ? products.filter((p) => p.category === category)
          : products
        return {
          success: true,
          data: filtered.map((p) => ({
            ...toProductSummary(p),
            comparePrice: p.comparePrice ? formatPrice(p.comparePrice) : undefined,
          })),
        }
      },
    }),

    // 5. get_product
    custom({
      name: 'get_product',
      description: 'Get full details for a specific product by slug',
      parameters: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'Product slug' },
        },
        required: ['slug'],
      },
      execute: (input) => {
        const slug = input.slug as string
        const product = products.find((p) => p.slug === slug)
        if (!product) {
          return { success: false, error: `Product not found: ${slug}` }
        }
        return {
          success: true,
          data: {
            ...product,
            price: formatPrice(product.price),
            comparePrice: product.comparePrice
              ? formatPrice(product.comparePrice)
              : undefined,
          },
        }
      },
    }),

    // 6. add_to_cart
    custom({
      name: 'add_to_cart',
      description: 'Add a product to the shopping cart',
      parameters: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'Product slug' },
          quantity: { type: 'number', description: 'Quantity to add (defaults to 1)' },
        },
        required: ['slug'],
      },
      execute: (input) => {
        const slug = input.slug as string
        const quantity = (input.quantity as number) ?? 1
        const product = products.find((p) => p.slug === slug)
        if (!product) {
          return { success: false, error: `Product not found: ${slug}` }
        }
        if (!product.inStock) {
          return { success: false, error: `${product.name} is currently out of stock` }
        }
        cart().addItem(
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0],
            slug: product.slug,
          },
          quantity
        )
        return {
          success: true,
          data: {
            added: product.name,
            quantity,
            price: formatPrice(product.price),
            message: `Added ${quantity}x ${product.name} to cart`,
          },
        }
      },
    }),

    // 7. remove_from_cart
    custom({
      name: 'remove_from_cart',
      description: 'Remove a product from the shopping cart by product ID',
      parameters: {
        type: 'object',
        properties: {
          productId: { type: 'string', description: 'Product ID to remove' },
        },
        required: ['productId'],
      },
      execute: (input) => {
        const productId = input.productId as string
        const c = cart()
        const item = c.items.find((i) => i.productId === productId)
        if (!item) {
          return { success: false, error: `Product ${productId} is not in the cart` }
        }
        c.removeItem(productId)
        return {
          success: true,
          data: { removed: item.name, message: `Removed ${item.name} from cart` },
        }
      },
    }),

    // 8. update_cart_quantity
    custom({
      name: 'update_cart_quantity',
      description: 'Update the quantity of a product in the cart',
      parameters: {
        type: 'object',
        properties: {
          productId: { type: 'string', description: 'Product ID' },
          quantity: { type: 'number', description: 'New quantity (0 removes the item)' },
        },
        required: ['productId', 'quantity'],
      },
      execute: (input) => {
        const productId = input.productId as string
        const quantity = input.quantity as number
        const c = cart()
        const item = c.items.find((i) => i.productId === productId)
        if (!item) {
          return { success: false, error: `Product ${productId} is not in the cart` }
        }
        c.updateQuantity(productId, quantity)
        return {
          success: true,
          data: {
            product: item.name,
            quantity,
            message:
              quantity <= 0
                ? `Removed ${item.name} from cart`
                : `Updated ${item.name} quantity to ${quantity}`,
          },
        }
      },
    }),

    // 9. get_cart
    custom({
      name: 'get_cart',
      description: 'Get the current shopping cart contents and totals',
      parameters: {
        type: 'object',
        properties: {},
      },
      execute: () => {
        const c = cart()
        const subtotal = c.getSubtotal()
        const shipping = c.getShipping()
        const total = c.getTotal()
        return {
          success: true,
          data: {
            items: c.items.map((item) => ({
              productId: item.productId,
              name: item.name,
              slug: item.slug,
              price: formatPrice(item.price),
              quantity: item.quantity,
              lineTotal: formatPrice(item.price * item.quantity),
            })),
            itemCount: c.getItemCount(),
            subtotal: formatPrice(subtotal),
            shipping: shipping === 0 ? 'Free' : formatPrice(shipping),
            total: formatPrice(total),
            freeShippingThreshold: formatPrice(7500),
          },
        }
      },
    }),

    // 10. clear_cart
    custom({
      name: 'clear_cart',
      description: 'Remove all items from the shopping cart',
      parameters: {
        type: 'object',
        properties: {},
      },
      execute: () => {
        cart().clearCart()
        return { success: true, data: { message: 'Cart cleared' } }
      },
    }),

    // 11. recommend_products
    custom({
      name: 'recommend_products',
      description: 'Get product recommendations based on keywords or skin concerns',
      parameters: {
        type: 'object',
        properties: {
          keywords: {
            type: 'string',
            description: 'Keywords or skin concerns (e.g., "anti-aging", "hydration", "dark circles")',
          },
        },
        required: ['keywords'],
      },
      execute: (input) => {
        const keywords = (input.keywords as string).toLowerCase().split(/[\s,]+/)
        const scored = products.map((p) => {
          const searchable = [
            p.name,
            p.description,
            p.tagline,
            ...p.benefits,
          ]
            .join(' ')
            .toLowerCase()
          const score = keywords.reduce(
            (total, kw) => total + (searchable.includes(kw) ? 1 : 0),
            0
          )
          return { product: p, score }
        })
        const recommendations = scored
          .filter((s) => s.score > 0)
          .sort((a, b) => b.score - a.score)
          .map((s) => ({
            ...toProductSummary(s.product),
            relevanceScore: s.score,
            topBenefits: s.product.benefits.slice(0, 3),
          }))
        return {
          success: true,
          data: recommendations.length > 0
            ? recommendations
            : { message: 'No products matched those keywords. Try broader terms like "hydration", "anti-aging", or "LED".' },
        }
      },
    }),
  ]
}
