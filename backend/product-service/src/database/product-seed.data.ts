export interface ProductSeedRecord {
  name: string;
  sku: string;
  description: string;
  category: string;
  quantity: number;
  price: number;
  active: boolean;
}

/**
 * Default in-store retail catalog for Revest platform demos.
 * SKUs are stable so startup seeding is idempotent (insert only when SKU is missing).
 */
export const PRODUCT_SEED_CATALOG: ProductSeedRecord[] = [
  {
    name: 'Almarai Fresh Laban Full Fat 1L',
    sku: 'RET-DAIRY-001',
    description:
      'Fresh laban drink, 1 litre. Chilled dairy — best seller in GCC convenience and hypermarket aisles.',
    category: 'Dairy & Chilled',
    quantity: 240,
    price: 6.75,
    active: true,
  },
  {
    name: 'Fresh Chicken Breast Fillet 500g',
    sku: 'RET-FRESH-002',
    description:
      'Skinless chicken breast fillets, vacuum packed. Ideal for grills, meal prep, and daily family cooking.',
    category: 'Fresh Food',
    quantity: 85,
    price: 18.95,
    active: true,
  },
  {
    name: 'Basmati Rice Premium 5kg',
    sku: 'RET-GROC-003',
    description:
      'Long-grain aged basmati rice. Staple grocery item with consistent weekly replenishment across stores.',
    category: 'Grocery',
    quantity: 160,
    price: 42.0,
    active: true,
  },
  {
    name: 'Nestlé Pure Life Water 12 × 330ml',
    sku: 'RET-BEV-004',
    description:
      'Pack of twelve 330ml still water bottles. High-velocity beverage SKU for checkout and pantry baskets.',
    category: 'Beverages',
    quantity: 320,
    price: 9.5,
    active: true,
  },
  {
    name: 'Persil Liquid Detergent 2.5L',
    sku: 'RET-HOME-005',
    description:
      'Concentrated liquid laundry detergent for everyday wash loads. Household essentials category.',
    category: 'Household',
    quantity: 110,
    price: 34.99,
    active: true,
  },
  {
    name: "L'Oréal Paris Elvive Shampoo 400ml",
    sku: 'RET-CARE-006',
    description:
      'Repairing shampoo for damaged hair. Personal care aisle product with strong repeat purchase rate.',
    category: 'Personal Care',
    quantity: 95,
    price: 24.5,
    active: true,
  },
  {
    name: 'Samsung Galaxy Buds FE',
    sku: 'RET-ELEC-007',
    description:
      'True wireless earbuds with active noise cancellation. Consumer electronics best seller.',
    category: 'Electronics',
    quantity: 42,
    price: 299.0,
    active: true,
  },
  {
    name: 'Philips Air Fryer 4.1L',
    sku: 'RET-KITCH-008',
    description:
      'Digital air fryer with rapid air technology. Popular home & kitchen appliance for family households.',
    category: 'Home & Kitchen',
    quantity: 28,
    price: 449.0,
    active: true,
  },
  {
    name: 'Classic Cotton Abaya — Black',
    sku: 'RET-APP-009',
    description:
      'Modest everyday abaya in breathable cotton blend. Apparel category aligned with regional retail demand.',
    category: 'Apparel',
    quantity: 60,
    price: 189.0,
    active: true,
  },
];

export const PRODUCT_SEED_SKUS = PRODUCT_SEED_CATALOG.map((p) => p.sku);

/** Legacy demo SKUs removed when the catalog was refactored to consumer retail. */
export const DEPRECATED_SEED_SKUS = [
  'RVST-POS-001',
  'RVST-PRN-002',
  'RVST-AI-003',
  'RVST-PAY-004',
  'RVST-ANA-005',
  'RVST-SCN-006',
  'RVST-LOY-007',
  'RVST-ESL-008',
  'RVST-INV-009',
];
