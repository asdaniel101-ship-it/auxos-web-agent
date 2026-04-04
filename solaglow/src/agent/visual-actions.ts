import { queueAgentSteps } from '@/components/agent/AgentCursor'

// Nav selectors in the header that reliably exist on every page
const NAV_SELECTORS: Record<string, string> = {
  home: 'header a[href="/"]',
  shop: 'header nav button',           // Shop is a dropdown button
  science: 'header a[href="/science"]',
  results: 'header a[href="/results"]',
  about: 'header a[href="/about"]',
  cart: 'header a[href="/cart"]',
  checkout: 'header a[href="/cart"]',   // no checkout in nav, use cart icon
}

/**
 * Visual actions that run BEFORE tool execution and navigation.
 * For navigation tools: cursor moves to the header nav link and clicks it.
 * For interaction tools: cursor moves to the target element on the current page.
 */
export function queuePreAction(
  toolName: string,
  input: Record<string, unknown>
): Promise<void> {
  switch (toolName) {
    case 'navigate_to': {
      const page = input.page as string
      const selector = NAV_SELECTORS[page]
      if (!selector) return Promise.resolve()
      return queueAgentSteps([
        { type: 'scroll-to', selector: 'header' },
        { type: 'move', selector },
        { type: 'click', selector },
        { type: 'wait', delay: 300 },
      ])
    }

    case 'show_product': {
      const slug = input.slug as string
      // Try to click the product card link if it exists on the current page
      // Otherwise click the Shop nav button in the header
      const productSelector = `a[href="/shop/${slug}"]`
      const fallbackSelector = 'header nav button'
      return queueAgentSteps([
        { type: 'scroll-to', selector: productSelector + ', ' + fallbackSelector },
        { type: 'click', selector: productSelector + ', ' + fallbackSelector },
        { type: 'wait', delay: 300 },
      ])
    }

    case 'find_proof': {
      // Click the "Our Science" nav link to show we're navigating to evidence
      return queueAgentSteps([
        { type: 'scroll-to', selector: 'header' },
        { type: 'move', selector: 'header a[href="/science"]' },
        { type: 'click', selector: 'header a[href="/science"]' },
        { type: 'wait', delay: 300 },
      ])
    }

    case 'compare_products': {
      const slugA = input.product_a as string
      const productSelector = `a[href="/shop/${slugA}"]`
      const fallbackSelector = 'header nav button'
      return queueAgentSteps([
        { type: 'scroll-to', selector: productSelector + ', ' + fallbackSelector },
        { type: 'click', selector: productSelector + ', ' + fallbackSelector },
        { type: 'wait', delay: 300 },
      ])
    }

    case 'add_to_cart': {
      return queueAgentSteps([
        { type: 'scroll-to', selector: '[data-add-to-cart]' },
        { type: 'wait', delay: 200 },
        { type: 'click', selector: '[data-add-to-cart]' },
        { type: 'wait', delay: 400 },
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

    case 'scroll_to_section': {
      const section = input.section as string
      return queueAgentSteps([
        { type: 'scroll-to', selector: `[data-section="${section}"]` },
        { type: 'wait', delay: 400 },
      ])
    }

    default:
      return Promise.resolve()
  }
}

/**
 * Visual actions that run AFTER navigation completes.
 * Scrolls to the relevant section on the destination page.
 */
export function queuePostNavigationAction(
  toolName: string,
  input: Record<string, unknown>,
  result: any
): Promise<void> {
  switch (toolName) {
    case 'navigate_to': {
      return queueAgentSteps([
        { type: 'scroll-to', selector: '[data-section="hero"], main' },
        { type: 'wait', delay: 400 },
      ])
    }

    case 'show_product': {
      return queueAgentSteps([
        { type: 'scroll-to', selector: '[data-section="hero"]' },
        { type: 'wait', delay: 400 },
      ])
    }

    case 'find_proof': {
      const scrollTo = result?.data?.scrollTo
      if (scrollTo) {
        return queueAgentSteps([
          { type: 'scroll-to', selector: `[data-section="${scrollTo}"]` },
          { type: 'wait', delay: 500 },
        ])
      }
      return Promise.resolve()
    }

    case 'compare_products': {
      return queueAgentSteps([
        { type: 'scroll-to', selector: '[data-section="hero"]' },
        { type: 'wait', delay: 400 },
      ])
    }

    default:
      return Promise.resolve()
  }
}
