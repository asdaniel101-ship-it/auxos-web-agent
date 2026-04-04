import { queueAgentSteps } from '@/components/agent/AgentCursor'

/**
 * Visual actions that should run BEFORE tool execution.
 * These target elements on the CURRENT page (buttons, fields, etc).
 */
export function queuePreAction(
  toolName: string,
  input: Record<string, unknown>
): Promise<void> {
  switch (toolName) {
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

    default:
      return Promise.resolve()
  }
}

/**
 * Visual actions that should run AFTER navigation completes.
 * These target elements on the DESTINATION page.
 */
export function queuePostNavigationAction(
  toolName: string,
  input: Record<string, unknown>,
  result: any
): Promise<void> {
  switch (toolName) {
    case 'navigate_to': {
      // After landing on the page, scroll to top to orient the user
      return queueAgentSteps([
        { type: 'scroll-to', selector: '[data-section="hero"], main' },
        { type: 'wait', delay: 400 },
      ])
    }

    case 'show_product': {
      // After navigating to the product page, highlight the hero
      return queueAgentSteps([
        { type: 'scroll-to', selector: '[data-section="hero"]' },
        { type: 'wait', delay: 400 },
      ])
    }

    case 'find_proof': {
      // After navigating, scroll to the evidence section
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
      // After navigating to the first product
      return queueAgentSteps([
        { type: 'scroll-to', selector: '[data-section="hero"]' },
        { type: 'wait', delay: 400 },
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
