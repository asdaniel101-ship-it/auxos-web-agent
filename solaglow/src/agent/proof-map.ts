/**
 * Hardcoded mapping of customer concerns to site content locations.
 * Each entry tells the agent WHERE to navigate and WHAT to highlight.
 */
export interface ProofEntry {
  page: string
  section: string
  summary: string
}

export interface ProofResult {
  entries: ProofEntry[]
  narrative: string
}

const proofMap: Record<string, ProofResult> = {
  'does it work': {
    entries: [
      { page: '/science', section: 'clinical-results', summary: '93% improved skin texture, 89% fine line reduction in 200+ participant study over 8 weeks' },
      { page: '/results', section: 'hero', summary: '6 real before/after transformations from customers aged 28-52' },
      { page: '/', section: 'doctor-endorsement', summary: '3 board-certified dermatologists endorse SolaGlow' },
    ],
    narrative: 'Clinical studies show 93% texture improvement and 89% fine line reduction. Here are the published studies, real customer transformations, and dermatologist endorsements.',
  },
  'fine lines': {
    entries: [
      { page: '/science', section: 'led-wavelengths', summary: 'Red light (630nm) stimulates collagen production, directly targeting fine lines' },
      { page: '/science', section: 'research', summary: 'Journal of Cosmetic Dermatology: 31% collagen density increase with red light therapy' },
      { page: '/results', section: 'hero', summary: 'Jennifer M., age 42: visible fine line reduction after 6 weeks' },
    ],
    narrative: 'Red light at 630nm stimulates collagen production. A peer-reviewed study found 31% increase in collagen density. Here\'s a customer who saw fine line reduction in 6 weeks.',
  },
  'acne': {
    entries: [
      { page: '/science', section: 'led-wavelengths', summary: 'Blue light (415nm) kills acne-causing bacteria and reduces inflammation' },
      { page: '/science', section: 'research', summary: 'International Journal of Dermatology: 87% bacterial reduction with blue light therapy' },
    ],
    narrative: 'Blue light at 415nm targets acne-causing bacteria. A clinical study showed 87% bacterial reduction. The RadiantWave Pro includes this wavelength.',
  },
  'sensitive skin': {
    entries: [
      { page: '/', section: 'doctor-endorsement', summary: 'Dr. Elena Rodriguez (Anti-Aging Specialist) discusses suitability for sensitive skin' },
      { page: '/shop/gentle-cleanser', section: 'hero', summary: 'Gentle Cleanser: sulfate-free, fragrance-free, pH-balanced for sensitive skin' },
      { page: '/about', section: 'values', summary: 'Clean Beauty: non-toxic, cruelty-free, inclusive skincare for all skin types' },
    ],
    narrative: 'SolaGlow products are formulated for sensitive skin. The Gentle Cleanser is sulfate-free and fragrance-free. Dr. Rodriguez endorses the line for sensitive skin types.',
  },
  'rosacea': {
    entries: [
      { page: '/science', section: 'led-wavelengths', summary: 'Near-infrared (850nm) reduces redness and inflammation at deep tissue level' },
      { page: '/', section: 'doctor-endorsement', summary: 'Dr. Elena Rodriguez discusses anti-inflammatory benefits' },
      { page: '/shop/gentle-cleanser', section: 'hero', summary: 'Fragrance-free, pH-balanced cleanser suitable for rosacea-prone skin' },
    ],
    narrative: 'Near-infrared light at 850nm penetrates deep to reduce redness and inflammation. The Gentle Cleanser is fragrance-free and pH-balanced for reactive skin.',
  },
  'worth the price': {
    entries: [
      { page: '/shop/radiantwave-pro', section: 'hero', summary: 'RadiantWave Pro at $169: $0.46/session vs $150-300 per LED facial at a spa' },
      { page: '/shop/radiantwave-pro', section: 'guarantee', summary: '90-day money-back guarantee, 2-year warranty, free shipping' },
      { page: '/shop/complete-glow-system', section: 'hero', summary: 'Complete system saves $72 vs buying separately' },
    ],
    narrative: 'At $169, the RadiantWave Pro costs $0.46 per session vs $150-300 for a single spa facial. You break even after 2 uses. Plus: 90-day money-back guarantee.',
  },
  'dark circles': {
    entries: [
      { page: '/shop/brightening-eye-cream', section: 'hero', summary: 'Vitamin C + Caffeine 2% brightens dark circles and reduces puffiness' },
      { page: '/results', section: 'hero', summary: 'Customer testimonials mention dark circle improvement' },
    ],
    narrative: 'The Brightening Eye Cream uses Vitamin C and 2% caffeine to brighten dark circles. It\'s ophthalmologist tested. Here are customer results.',
  },
  'anti-aging': {
    entries: [
      { page: '/science', section: 'led-wavelengths', summary: 'Red (630nm) + Near-infrared (850nm) stimulate collagen and deep healing' },
      { page: '/shop/renew-complex-cream', section: 'hero', summary: 'Bakuchiol 1% (natural retinol alternative) + Matrixyl 3000 peptides' },
      { page: '/science', section: 'research', summary: 'Dermatologic Surgery study: significant collagen synthesis improvement' },
    ],
    narrative: 'The anti-aging approach combines LED therapy (collagen stimulation) with the Renew Complex Cream (bakuchiol + peptides). Clinical studies back both.',
  },
  'ingredients': {
    entries: [
      { page: '/about', section: 'values', summary: 'Clean Beauty: non-toxic, cruelty-free, full ingredient disclosure, no greenwashing' },
    ],
    narrative: 'Every product has full ingredient disclosure. SolaGlow is committed to clean beauty: non-toxic, cruelty-free, vegan, and sustainable.',
  },
  'safe': {
    entries: [
      { page: '/shop/radiantwave-pro', section: 'hero', summary: 'FDA-cleared for home use' },
      { page: '/', section: 'doctor-endorsement', summary: '3 board-certified dermatologists endorse SolaGlow' },
      { page: '/about', section: 'values', summary: 'Clean Beauty values: non-toxic, dermatologist tested' },
    ],
    narrative: 'The RadiantWave Pro is FDA-cleared for home use. Three board-certified dermatologists endorse SolaGlow. All products are dermatologist tested.',
  },
  'collagen': {
    entries: [
      { page: '/science', section: 'led-wavelengths', summary: 'Red light (630nm) stimulates collagen and elastin production' },
      { page: '/science', section: 'research', summary: '31% collagen density increase (Journal of Cosmetic Dermatology, 2023)' },
      { page: '/shop/renew-complex-cream', section: 'hero', summary: 'Matrixyl 3000 peptide supports collagen synthesis topically' },
    ],
    narrative: 'Red light therapy increases collagen density by 31% (published study). The Renew Complex Cream adds topical peptides that support collagen synthesis.',
  },
  'hydration': {
    entries: [
      { page: '/shop/glowboost-serum', section: 'hero', summary: 'Triple-weight hyaluronic acid for multi-depth hydration' },
      { page: '/shop/renew-complex-cream', section: 'hero', summary: 'Ceramide complex locks in moisture' },
    ],
    narrative: 'The GlowBoost Serum has three molecular weights of hyaluronic acid for hydration at every skin layer. The Renew Complex Cream seals it in with ceramides.',
  },
  'sunscreen': {
    entries: [
      { page: '/shop/spf50-day-shield', section: 'hero', summary: 'SPF 50 mineral sunscreen, no white cast, reef-safe, water-resistant 80 min' },
    ],
    narrative: 'The SPF 50 Day Shield is a mineral sunscreen with no white cast, suitable for all skin tones. Water-resistant 80 minutes, reef-safe.',
  },
}

/**
 * Find proof entries for a customer concern.
 * Uses fuzzy keyword matching against the proof map.
 */
export function findProof(concern: string): ProofResult {
  const lower = concern.toLowerCase()

  // Direct match
  for (const [key, value] of Object.entries(proofMap)) {
    if (lower.includes(key) || key.includes(lower)) {
      return value
    }
  }

  // Keyword matching
  const keywords: Record<string, string> = {
    'wrinkle': 'fine lines',
    'aging': 'anti-aging',
    'old': 'anti-aging',
    'red': 'rosacea',
    'inflam': 'rosacea',
    'dry': 'hydration',
    'moist': 'hydration',
    'pimple': 'acne',
    'breakout': 'acne',
    'spot': 'acne',
    'eye': 'dark circles',
    'puffy': 'dark circles',
    'proof': 'does it work',
    'evidence': 'does it work',
    'clinical': 'does it work',
    'study': 'does it work',
    'research': 'does it work',
    'scam': 'does it work',
    'legit': 'does it work',
    'money': 'worth the price',
    'expensive': 'worth the price',
    'cost': 'worth the price',
    'afford': 'worth the price',
    'chemical': 'ingredients',
    'toxic': 'ingredients',
    'clean': 'ingredients',
    'natural': 'ingredients',
    'danger': 'safe',
    'harm': 'safe',
    'side effect': 'safe',
    'sun': 'sunscreen',
    'spf': 'sunscreen',
    'uv': 'sunscreen',
    'protect': 'sunscreen',
    'collagen': 'collagen',
    'firm': 'collagen',
  }

  for (const [keyword, mapKey] of Object.entries(keywords)) {
    if (lower.includes(keyword)) {
      return proofMap[mapKey]
    }
  }

  // Fallback: general efficacy proof
  return proofMap['does it work']
}
