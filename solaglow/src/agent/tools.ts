import { Tool } from '@anthropic-ai/sdk/resources/messages'

export const tools: Tool[] = [
  {
    name: 'navigate_to',
    description:
      'Navigate to a page on the SolaGlow site. Valid pages: home, shop, science, results, about, cart, checkout',
    input_schema: {
      type: 'object' as const,
      properties: {
        page: {
          type: 'string',
          description: 'Page to navigate to',
          enum: ['home', 'shop', 'science', 'results', 'about', 'cart', 'checkout'],
        },
      },
      required: ['page'],
    },
  },
  {
    name: 'scroll_to_section',
    description:
      'Scroll to a specific section on the current page. Sections: hero, best-sellers, how-it-works, doctor-endorsement, results-preview, testimonials, newsletter, community, press-bar, reviews, faq, technology, before-after, guarantee, related-products, how-to-use, doctor-panel, clinical-results, led-wavelengths, research, team, values, brand-story',
    input_schema: {
      type: 'object' as const,
      properties: {
        section: {
          type: 'string',
          description: 'Section ID to scroll to',
        },
      },
      required: ['section'],
    },
  },
  {
    name: 'show_product',
    description:
      'Navigate to a specific product detail page. Available products: radiantwave-pro, glowboost-serum, radiantwave-mini, renew-complex-cream, solaglow-starter-kit, brightening-eye-cream, advanced-repair-mask, complete-glow-system, gentle-cleanser, spf50-day-shield',
    input_schema: {
      type: 'object' as const,
      properties: {
        slug: {
          type: 'string',
          description: 'Product slug',
          enum: [
            'radiantwave-pro',
            'glowboost-serum',
            'radiantwave-mini',
            'renew-complex-cream',
            'solaglow-starter-kit',
            'brightening-eye-cream',
            'advanced-repair-mask',
            'complete-glow-system',
            'gentle-cleanser',
            'spf50-day-shield',
          ],
        },
      },
      required: ['slug'],
    },
  },
  {
    name: 'find_proof',
    description:
      'Find evidence on the site that addresses a customer concern. Returns the page and section where proof can be found, then navigates there. Use this when a customer asks about efficacy, safety, ingredients, or whether the product works for their specific concern.',
    input_schema: {
      type: 'object' as const,
      properties: {
        concern: {
          type: 'string',
          description:
            'The customer concern to find evidence for (e.g., "does it work", "safe for sensitive skin", "acne", "fine lines", "worth the price")',
        },
      },
      required: ['concern'],
    },
  },
  {
    name: 'compare_products',
    description:
      'Compare two products by navigating to each one and highlighting key differences. Use when a customer is deciding between products.',
    input_schema: {
      type: 'object' as const,
      properties: {
        product_a: { type: 'string', description: 'First product slug' },
        product_b: { type: 'string', description: 'Second product slug' },
      },
      required: ['product_a', 'product_b'],
    },
  },
  {
    name: 'add_to_cart',
    description: 'Add a product to the shopping cart.',
    input_schema: {
      type: 'object' as const,
      properties: {
        slug: { type: 'string', description: 'Product slug to add' },
        quantity: { type: 'number', description: 'Quantity to add (default 1)' },
      },
      required: ['slug'],
    },
  },
  {
    name: 'apply_filter',
    description: 'Filter products on the shop page by category or sort order.',
    input_schema: {
      type: 'object' as const,
      properties: {
        category: {
          type: 'string',
          description: 'Category to filter by',
          enum: ['all', 'devices', 'skincare', 'bundles', 'accessories'],
        },
        sort: {
          type: 'string',
          description: 'Sort order',
          enum: ['featured', 'price-asc', 'price-desc', 'best-selling'],
        },
      },
      required: [],
    },
  },
  {
    name: 'fill_checkout_field',
    description:
      'Fill a single field in the checkout form. Use this to help users complete checkout by filling fields one at a time as they provide information conversationally. Fields: firstName, lastName, email, phone, address1, address2, city, state, zip, cardNumber, expiration, cvv, nameOnCard',
    input_schema: {
      type: 'object' as const,
      properties: {
        field: {
          type: 'string',
          description: 'The checkout field to fill',
          enum: [
            'firstName',
            'lastName',
            'email',
            'phone',
            'address1',
            'address2',
            'city',
            'state',
            'zip',
            'cardNumber',
            'expiration',
            'cvv',
            'nameOnCard',
          ],
        },
        value: { type: 'string', description: 'Value to fill in the field' },
      },
      required: ['field', 'value'],
    },
  },
]
