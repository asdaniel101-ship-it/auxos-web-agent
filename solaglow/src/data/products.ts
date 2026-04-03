export interface Product {
  id: string
  name: string
  slug: string
  tagline: string
  description: string
  price: number // cents
  comparePrice?: number // cents, for showing "was $X"
  category: 'devices' | 'skincare' | 'bundles' | 'accessories'
  images: string[]
  rating: number // 1-5
  reviewCount: number
  benefits: string[]
  ingredients?: string[]
  howToUse?: string
  badge?: string // "Best Seller", "New", "Limited Edition"
  inStock: boolean
}

export const products: Product[] = [
  {
    id: 'radiantwave-pro',
    name: 'RadiantWave Pro',
    slug: 'radiantwave-pro',
    tagline: 'Clinical-grade LED therapy at home',
    description:
      'The RadiantWave Pro delivers salon-quality LED light therapy with 7 clinically proven wavelengths. Red and near-infrared light penetrate deep to stimulate collagen production, reduce fine lines, and improve skin texture—all in a single 10-minute daily session.',
    price: 16900,
    category: 'devices',
    images: [
      'https://placehold.co/600x600/F5E6D3/8B7355?text=RadiantWave+Pro',
      'https://placehold.co/600x600/EDD9C2/7A6348?text=RadiantWave+Pro+2',
    ],
    rating: 4.9,
    reviewCount: 2847,
    benefits: [
      'Stimulates collagen and elastin production',
      'Reduces fine lines and wrinkles visibly',
      'Evens skin tone and reduces hyperpigmentation',
      'Accelerates skin cell regeneration',
      'Soothes inflammation and redness',
      'FDA-cleared for home use',
    ],
    howToUse:
      'Cleanse skin thoroughly. Hold device 1–2 inches from face and move in slow, circular motions for 10 minutes. Use 5 times per week for optimal results. Apply GlowBoost Serum immediately after for enhanced absorption.',
    badge: 'Best Seller',
    inStock: true,
  },
  {
    id: 'glowboost-serum',
    name: 'GlowBoost Serum',
    slug: 'glowboost-serum',
    tagline: 'Deeply hydrating hyaluronic acid serum',
    description:
      'A lightweight, fast-absorbing serum packed with three molecular weights of hyaluronic acid to plump, hydrate, and smooth at every layer of the skin. Formulated to work synergistically with LED therapy for maximum results.',
    price: 4900,
    category: 'skincare',
    images: [
      'https://placehold.co/600x600/E8D5C8/6B5B4E?text=GlowBoost+Serum',
      'https://placehold.co/600x600/DEC8BA/5E4F44?text=GlowBoost+Serum+2',
    ],
    rating: 4.8,
    reviewCount: 1923,
    benefits: [
      'Triple-weight hyaluronic acid for multi-depth hydration',
      'Plumps fine lines within 15 minutes of application',
      'Strengthens the skin moisture barrier',
      'Non-comedogenic and fragrance-free',
      'Suitable for all skin types including sensitive',
    ],
    ingredients: [
      'Aqua',
      'Sodium Hyaluronate (3 molecular weights)',
      'Niacinamide 5%',
      'Panthenol',
      'Allantoin',
      'Centella Asiatica Extract',
      'Glycerin',
      'Peptide Complex',
    ],
    howToUse:
      'Apply 3–4 drops to clean, slightly damp skin. Gently press into skin with fingertips. Follow with moisturizer. For best results, use immediately after LED therapy session.',
    inStock: true,
  },
  {
    id: 'radiantwave-mini',
    name: 'RadiantWave Mini',
    slug: 'radiantwave-mini',
    tagline: 'Portable LED therapy, anywhere you go',
    description:
      'All the power of LED therapy in a travel-ready size. The RadiantWave Mini features 4 therapeutic wavelengths and a rechargeable battery that lasts up to 30 sessions per charge. Perfect for maintaining your glow routine on the go.',
    price: 9900,
    category: 'devices',
    images: [
      'https://placehold.co/600x600/F5E6D3/8B7355?text=RadiantWave+Mini',
      'https://placehold.co/600x600/EDD9C2/7A6348?text=RadiantWave+Mini+2',
    ],
    rating: 4.7,
    reviewCount: 642,
    benefits: [
      'Compact design fits in any bag or carry-on',
      'USB-C rechargeable with 30-session battery life',
      '4 therapeutic LED wavelengths',
      'Auto-shutoff after 10-minute treatment',
      'Silicone head is easy to clean and hygienic',
    ],
    howToUse:
      'Charge fully before first use. Cleanse skin, then glide the device over your face in upward motions for 10 minutes. Device will automatically shut off. Use daily or as needed.',
    badge: 'New',
    inStock: true,
  },
  {
    id: 'renew-complex-cream',
    name: 'Renew Complex Cream',
    slug: 'renew-complex-cream',
    tagline: 'Advanced anti-aging moisturizer',
    description:
      'A rich yet non-greasy moisturizer powered by a proprietary peptide blend, bakuchiol (a natural retinol alternative), and ceramides. Visibly firms, plumps, and renews skin overnight while you sleep.',
    price: 5900,
    category: 'skincare',
    images: [
      'https://placehold.co/600x600/E8D5C8/6B5B4E?text=Renew+Complex',
      'https://placehold.co/600x600/DEC8BA/5E4F44?text=Renew+Complex+2',
    ],
    rating: 4.8,
    reviewCount: 1105,
    benefits: [
      'Visibly reduces fine lines and wrinkles in 4 weeks',
      'Bakuchiol gently resurfaces without irritation',
      'Ceramide complex locks in moisture overnight',
      'Peptide blend supports collagen synthesis',
      'Dermatologist tested, suitable for sensitive skin',
    ],
    ingredients: [
      'Aqua',
      'Bakuchiol 1%',
      'Ceramide NP',
      'Ceramide AP',
      'Matrixyl 3000 (Palmitoyl Tripeptide-1)',
      'Squalane',
      'Shea Butter',
      'Niacinamide 3%',
    ],
    howToUse:
      'Apply a pea-sized amount to face and neck after cleansing and serum. Gently massage in upward strokes until absorbed. Use morning and/or evening.',
    inStock: true,
  },
  {
    id: 'solaglow-starter-kit',
    name: 'SolaGlow Starter Kit',
    slug: 'solaglow-starter-kit',
    tagline: 'Everything you need to start glowing',
    description:
      'Begin your SolaGlow journey with our most popular pairing: the RadiantWave Pro LED device and our best-selling GlowBoost Serum. This duo is designed to work together—the LED light increases serum absorption by up to 40%, supercharging your results.',
    price: 19900,
    comparePrice: 21800,
    category: 'bundles',
    images: [
      'https://placehold.co/600x600/FAF0E6/8B7355?text=Starter+Kit',
      'https://placehold.co/600x600/F5E6D3/7A6348?text=Starter+Kit+2',
    ],
    rating: 4.9,
    reviewCount: 3412,
    benefits: [
      'Save $19 versus buying separately',
      'RadiantWave Pro LED device included',
      'Full-size GlowBoost Serum included',
      'Complete getting-started guide',
      'Free express shipping',
      '60-day money-back guarantee',
    ],
    howToUse:
      'Cleanse skin. Apply 3–4 drops of GlowBoost Serum to face. Immediately use RadiantWave Pro for 10 minutes. The LED light boosts serum penetration for amplified results. Finish with moisturizer.',
    badge: 'Best Seller',
    inStock: true,
  },
  {
    id: 'brightening-eye-cream',
    name: 'Brightening Eye Cream',
    slug: 'brightening-eye-cream',
    tagline: 'Brighter, smoother, younger-looking eyes',
    description:
      'A concentrated treatment for the delicate eye area. Vitamin C and caffeine work together to brighten dark circles and reduce puffiness, while peptides and hyaluronic acid visibly smooth crow\'s feet and fine lines.',
    price: 4500,
    category: 'skincare',
    images: [
      'https://placehold.co/600x600/E8D5C8/6B5B4E?text=Eye+Cream',
      'https://placehold.co/600x600/DEC8BA/5E4F44?text=Eye+Cream+2',
    ],
    rating: 4.7,
    reviewCount: 887,
    benefits: [
      'Brightens dark circles with stable Vitamin C',
      'Reduces puffiness with caffeine and green tea extract',
      'Smooths crow\'s feet and fine lines',
      'Lightweight, non-migrating formula',
      'Ophthalmologist tested',
    ],
    ingredients: [
      'Aqua',
      'Ascorbyl Glucoside (Vitamin C)',
      'Caffeine 2%',
      'Dipeptide-2',
      'Palmitoyl Tetrapeptide-7',
      'Sodium Hyaluronate',
      'Green Tea Extract',
      'Arnica Montana Extract',
    ],
    howToUse:
      'Using your ring finger, gently tap a small amount around the orbital bone, starting from the inner corner and moving outward. Use morning and evening. Avoid applying too close to the lash line.',
    inStock: true,
  },
  {
    id: 'advanced-repair-mask',
    name: 'Advanced Repair Mask',
    slug: 'advanced-repair-mask',
    tagline: 'LED-compatible intensive treatment mask',
    description:
      'A clinically formulated sheet mask designed to be used in tandem with LED therapy. Saturated with a potent blend of marine collagen, niacinamide, and plant stem cells, this mask maximizes the results of every LED session.',
    price: 3900,
    category: 'skincare',
    images: [
      'https://placehold.co/600x600/E8D5C8/6B5B4E?text=Repair+Mask',
      'https://placehold.co/600x600/DEC8BA/5E4F44?text=Repair+Mask+2',
    ],
    rating: 4.6,
    reviewCount: 534,
    benefits: [
      'Translucent design allows LED light to pass through',
      'Marine collagen supports skin\'s natural firmness',
      'Niacinamide evens skin tone and minimizes pores',
      'Plant stem cells protect and renew skin cells',
      'Pack of 5 individually wrapped masks',
    ],
    ingredients: [
      'Aqua',
      'Hydrolyzed Marine Collagen',
      'Niacinamide 5%',
      'Malus Domestica Fruit Cell Culture Extract',
      'Beta-Glucan',
      'Hyaluronic Acid',
      'Centella Asiatica',
    ],
    howToUse:
      'Apply mask to clean, dry face. Smooth out any air bubbles. Use your RadiantWave Pro directly over the mask for 10 minutes. Remove mask and gently pat remaining essence into skin. No rinse needed.',
    inStock: true,
  },
  {
    id: 'complete-glow-system',
    name: 'Complete Glow System',
    slug: 'complete-glow-system',
    tagline: 'Your full 360° skincare transformation',
    description:
      'The ultimate SolaGlow routine in one box. Includes the RadiantWave Pro, GlowBoost Serum, Renew Complex Cream, Brightening Eye Cream, and Advanced Repair Mask (5-pack). Everything you need for a complete, results-driven skincare ritual.',
    price: 28900,
    comparePrice: 36100,
    category: 'bundles',
    images: [
      'https://placehold.co/600x600/FAF0E6/8B7355?text=Complete+Glow+System',
      'https://placehold.co/600x600/F5E6D3/7A6348?text=Complete+System+2',
    ],
    rating: 5.0,
    reviewCount: 1248,
    benefits: [
      'Save $72 versus buying everything separately',
      'RadiantWave Pro LED device included',
      'Full-size GlowBoost Serum included',
      'Full-size Renew Complex Cream included',
      'Full-size Brightening Eye Cream included',
      'Advanced Repair Mask 5-pack included',
      'Priority shipping + exclusive routine guide',
      '60-day money-back guarantee',
    ],
    howToUse:
      'Follow the included 8-week transformation guide for step-by-step daily and weekly routines. Combine LED sessions with targeted serums and creams for full-spectrum results.',
    badge: 'Best Value',
    inStock: true,
  },
  {
    id: 'gentle-cleanser',
    name: 'Gentle Cleanser',
    slug: 'gentle-cleanser',
    tagline: 'Balanced daily face wash for all skin types',
    description:
      'A pH-balanced, sulfate-free cleanser that removes impurities, makeup, and sunscreen without stripping the skin. Formulated with amino acid surfactants and aloe vera to leave skin clean, soft, and prepped for treatment.',
    price: 3200,
    category: 'skincare',
    images: [
      'https://placehold.co/600x600/E8D5C8/6B5B4E?text=Gentle+Cleanser',
      'https://placehold.co/600x600/DEC8BA/5E4F44?text=Gentle+Cleanser+2',
    ],
    rating: 4.7,
    reviewCount: 763,
    benefits: [
      'Sulfate-free, non-stripping formula',
      'pH-balanced to support the skin barrier',
      'Removes makeup and SPF effectively',
      'Fragrance-free and dye-free',
      'Suitable for acne-prone and sensitive skin',
    ],
    ingredients: [
      'Aqua',
      'Sodium Cocoyl Glutamate',
      'Aloe Barbadensis Leaf Juice',
      'Glycerin',
      'Panthenol',
      'Allantoin',
      'Chamomile Extract',
      'Citric Acid',
    ],
    howToUse:
      'Massage a small amount onto wet skin for 30–60 seconds. Rinse thoroughly with lukewarm water. Use morning and evening as the first step of your skincare routine.',
    inStock: true,
  },
  {
    id: 'spf50-day-shield',
    name: 'SPF 50 Day Shield',
    slug: 'spf50-day-shield',
    tagline: 'Lightweight mineral sunscreen with a dewy finish',
    description:
      'A 100% mineral SPF 50 moisturizer that goes on sheer and dries to a luminous, dewy finish. No white cast. Fortified with antioxidant Vitamin E and soothing oat extract to protect and nourish skin all day long.',
    price: 3800,
    category: 'skincare',
    images: [
      'https://placehold.co/600x600/E8D5C8/6B5B4E?text=SPF+50+Day+Shield',
      'https://placehold.co/600x600/DEC8BA/5E4F44?text=Day+Shield+2',
    ],
    rating: 4.8,
    reviewCount: 981,
    benefits: [
      'Broad-spectrum SPF 50 with zinc oxide',
      'No white cast — suitable for all skin tones',
      'Lightweight formula doubles as a moisturizer',
      'Antioxidant Vitamin E protects against free radicals',
      'Water-resistant up to 80 minutes',
      'Reef-safe mineral formula',
    ],
    ingredients: [
      'Zinc Oxide 18%',
      'Aqua',
      'Caprylic/Capric Triglyceride',
      'Tocopherol (Vitamin E)',
      'Avena Sativa (Oat) Kernel Extract',
      'Glycerin',
      'Sodium Hyaluronate',
    ],
    howToUse:
      'Apply generously as the last step of your morning routine, at least 15 minutes before sun exposure. Reapply every 2 hours when outdoors. Use every day — even on cloudy days — to protect LED therapy results.',
    badge: 'New',
    inStock: true,
  },
]

export const testimonials = [
  {
    name: 'Jessica M.',
    rating: 5,
    text: 'I\'ve tried every LED device on the market and nothing compares to the RadiantWave Pro. After 6 weeks, my dermatologist actually asked what I\'d been doing differently. My skin has never looked this good.',
    location: 'Los Angeles, CA',
    verified: true,
  },
  {
    name: 'Rachel T.',
    rating: 5,
    text: 'The Starter Kit completely changed my morning routine. I was skeptical at first, but the difference in my skin texture after just one month is undeniable. My foundation goes on so much smoother now.',
    location: 'New York, NY',
    verified: true,
  },
  {
    name: 'Priya S.',
    rating: 5,
    text: 'The GlowBoost Serum is legitimately the best serum I\'ve ever used. It layers beautifully under my moisturizer and my skin stays plump all day. I repurchase this every single month without hesitation.',
    location: 'Chicago, IL',
    verified: true,
  },
  {
    name: 'Amanda K.',
    rating: 4,
    text: 'I bought the Complete Glow System as a birthday gift to myself and it was the best decision. The routine guide is incredibly helpful, and seeing results week by week keeps me motivated. My dark spots have faded noticeably.',
    location: 'Austin, TX',
    verified: true,
  },
  {
    name: 'Lauren B.',
    rating: 5,
    text: 'The Brightening Eye Cream is magic in a tube. I\'ve struggled with dark circles my whole life and this is the first product that\'s actually made a real difference. I look less tired even on my worst days.',
    location: 'Miami, FL',
    verified: true,
  },
  {
    name: 'Sophia W.',
    rating: 5,
    text: 'As an esthetician, I recommend SolaGlow to all my clients. The science is solid, the formulations are clean, and the results speak for themselves. The RadiantWave Pro is now a staple in my professional toolkit too.',
    location: 'Seattle, WA',
    verified: true,
  },
]

export const pressLogos = [
  'Vogue',
  'Allure',
  "Harper's Bazaar",
  'Elle',
  'Cosmopolitan',
  'InStyle',
]
