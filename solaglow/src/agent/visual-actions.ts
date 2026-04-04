import { queueAgentSteps } from '@/components/agent/AgentCursor'

/**
 * Queue visual cursor animations for a tool execution.
 * Returns a Promise that resolves when the animation completes.
 * The caller should AWAIT this before mutating data.
 */
export function queueVisualAction(
  toolName: string,
  input: Record<string, unknown>
): Promise<void> {
  switch (toolName) {
    case 'navigate_to': {
      const page = input.page as string
      // Click the matching nav link in the header
      const navMap: Record<string, string> = {
        home: 'a[href="/"]',
        shop: 'a[href="/shop"]',
        science: 'a[href="/science"]',
        results: 'a[href="/results"]',
        about: 'a[href="/about"]',
        cart: 'a[href="/cart"]',
        checkout: 'a[href="/checkout"]',
      }
      const selector = navMap[page]
      if (!selector) return Promise.resolve()
      return queueAgentSteps([
        { type: 'scroll-to', selector: 'header' },
        { type: 'click', selector },
        { type: 'wait', delay: 500 },
      ])
    }

    case 'scroll_to_section': {
      const section = input.section as string
      return queueAgentSteps([
        { type: 'scroll-to', selector: `[data-section="${section}"]` },
        { type: 'wait', delay: 400 },
      ])
    }

    case 'show_product': {
      const slug = input.slug as string
      // Try to click the product card on the shop page, or navigate directly
      return queueAgentSteps([
        { type: 'click', selector: `a[href="/shop/${slug}"]` },
        { type: 'wait', delay: 600 },
      ])
    }

    case 'find_proof': {
      // The executor returns navigate + scrollTo, those get handled by the panel
      // Here we just animate scrolling to the section
      return queueAgentSteps([
        { type: 'wait', delay: 300 },
      ])
    }

    case 'compare_products': {
      const slugA = input.product_a as string
      return queueAgentSteps([
        { type: 'click', selector: `a[href="/shop/${slugA}"]` },
        { type: 'wait', delay: 800 },
      ])
    }

    case 'add_to_cart': {
      return queueAgentSteps([
        { type: 'scroll-to', selector: '[data-section="hero"], [data-add-to-cart]' },
        { type: 'wait', delay: 200 },
        { type: 'click', selector: '[data-add-to-cart]' },
        { type: 'wait', delay: 500 },
      ])
    }

    case 'apply_filter': {
      const category = input.category as string | undefined
      if (category && category !== 'all') {
        return queueAgentSteps([
          { type: 'click', selector: `[data-filter="${category}"]` },
          { type: 'wait', delay: 400 },
        ])
      }
      return Promise.resolve()
    }

    case 'fill_checkout_field': {
      const field = input.field as string
      const value = input.value as string
      return queueAgentSteps([
        { type: 'scroll-to', selector: `[data-checkout-field="${field}"]` },
        { type: 'type', selector: `[data-checkout-field="${field}"]`, text: value },
        { type: 'wait', delay: 300 },
      ])
    }

    default:
      return Promise.resolve()
  }
}
