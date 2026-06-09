import type { GalleryItem, Material, ModelCategory, OrderStatus } from './types'

export interface MaterialInfo {
  name: Material
  rate_per_cm3: number
  description: string
  properties: {
    strength: number
    detail: number
    flexibility: number
  }
  best_for: string
  borderColor: string
}

export const MATERIALS: MaterialInfo[] = [
  {
    name: 'PLA',
    rate_per_cm3: 12,
    description: 'Biodegradable thermoplastic. Easy to print, great detail, ideal for beginners and prototypes.',
    properties: { strength: 3, detail: 5, flexibility: 2 },
    best_for: 'Prototypes, display models, educational tools',
    borderColor: '#22c55e',
  },
  {
    name: 'ABS',
    rate_per_cm3: 15,
    description: 'Tough, impact-resistant plastic. Excellent for functional parts requiring durability.',
    properties: { strength: 4, detail: 3, flexibility: 3 },
    best_for: 'Functional parts, enclosures, mechanical components',
    borderColor: '#3b82f6',
  },
  {
    name: 'PETG',
    rate_per_cm3: 16,
    description: 'Hybrid of PLA ease and ABS strength. Food-safe, chemical resistant, semi-transparent.',
    properties: { strength: 4, detail: 4, flexibility: 3 },
    best_for: 'Food containers, medical models, waterproof parts',
    borderColor: '#a855f7',
  },
  {
    name: 'Resin',
    rate_per_cm3: 22,
    description: 'Ultra-high detail photopolymer. Smooth surface finish, perfect for miniatures and jewelry.',
    properties: { strength: 2, detail: 5, flexibility: 1 },
    best_for: 'Miniatures, jewelry, dental models, art pieces',
    borderColor: '#f59e0b',
  },
  {
    name: 'TPU',
    rate_per_cm3: 18,
    description: 'Flexible, rubber-like material. Excellent impact absorption and wear resistance.',
    properties: { strength: 3, detail: 3, flexibility: 5 },
    best_for: 'Phone cases, gaskets, flexible joints, grips',
    borderColor: '#ec4899',
  },
  {
    name: 'Nylon',
    rate_per_cm3: 24,
    description: 'Engineering-grade material. High strength-to-weight ratio, low friction, chemical resistant.',
    properties: { strength: 5, detail: 3, flexibility: 4 },
    best_for: 'Gears, hinges, industrial parts, structural components',
    borderColor: '#f97316',
  },
]

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'g1',
    title: 'Dragon Figurine',
    category: 'Art & Decor',
    material: 'Resin',
    description: 'Highly detailed dragon sculpture with intricate wing texture and scale patterns.',
    printTime: '14 hours',
    tags: ['fantasy', 'collectible', 'display'],
    color: '#f59e0b',
    icon: '🐉',
  },
  {
    id: 'g2',
    title: 'Custom Gear Assembly',
    category: 'Mechanical',
    material: 'Nylon',
    description: 'Precision interlocking gear set for industrial automation prototype.',
    printTime: '8 hours',
    tags: ['engineering', 'industrial', 'functional'],
    color: '#f97316',
    icon: '⚙️',
  },
  {
    id: 'g3',
    title: 'Architectural Scale Model',
    category: 'Architecture',
    material: 'PLA',
    description: 'Detailed 1:100 scale model of a residential building complex.',
    printTime: '22 hours',
    tags: ['architecture', 'model', 'presentation'],
    color: '#22c55e',
    icon: '🏛️',
  },
  {
    id: 'g4',
    title: 'Engagement Ring',
    category: 'Jewelry',
    material: 'Resin',
    description: 'Custom-designed engagement ring prototype for casting. Ultra-smooth finish.',
    printTime: '3 hours',
    tags: ['jewelry', 'custom', 'casting'],
    color: '#f59e0b',
    icon: '💍',
  },
  {
    id: 'g5',
    title: 'Phone Stand',
    category: 'Functional',
    material: 'PETG',
    description: 'Ergonomic adjustable phone stand with cable management channels.',
    printTime: '4 hours',
    tags: ['desk', 'utility', 'ergonomic'],
    color: '#a855f7',
    icon: '📱',
  },
  {
    id: 'g6',
    title: 'D&D Miniatures Set',
    category: 'Miniature',
    material: 'Resin',
    description: 'Set of 6 highly detailed tabletop RPG character miniatures.',
    printTime: '10 hours',
    tags: ['gaming', 'miniature', 'tabletop'],
    color: '#f59e0b',
    icon: '🧙',
  },
  {
    id: 'g7',
    title: 'Flexible Phone Case',
    category: 'Functional',
    material: 'TPU',
    description: 'Custom-fit flexible phone case with textured grip and raised bezels.',
    printTime: '3 hours',
    tags: ['phone', 'protection', 'flexible'],
    color: '#ec4899',
    icon: '📲',
  },
  {
    id: 'g8',
    title: 'Human Skull Replica',
    category: 'Educational',
    material: 'PLA',
    description: 'Anatomically correct human skull for medical education purposes.',
    printTime: '18 hours',
    tags: ['medical', 'anatomy', 'education'],
    color: '#22c55e',
    icon: '💀',
  },
  {
    id: 'g9',
    title: 'Sports Car Prototype',
    category: 'Prototype',
    material: 'ABS',
    description: '1:10 scale aerodynamic prototype for wind tunnel testing.',
    printTime: '12 hours',
    tags: ['automotive', 'prototype', 'engineering'],
    color: '#3b82f6',
    icon: '🚗',
  },
  {
    id: 'g10',
    title: 'Vase Collection',
    category: 'Art & Decor',
    material: 'PLA',
    description: 'Set of 3 Voronoi-pattern decorative vases with organic geometry.',
    printTime: '9 hours',
    tags: ['home decor', 'vase', 'geometric'],
    color: '#22c55e',
    icon: '🏺',
  },
  {
    id: 'g11',
    title: 'Robotic Hand',
    category: 'Prototype',
    material: 'Nylon',
    description: 'Fully articulated prosthetic hand prototype with tendon-driven fingers.',
    printTime: '20 hours',
    tags: ['robotics', 'medical', 'prototype'],
    color: '#f97316',
    icon: '🦾',
  },
  {
    id: 'g12',
    title: 'Custom Chess Set',
    category: 'Art & Decor',
    material: 'Resin',
    description: 'Themed chess set with custom-designed pieces in historical warrior style.',
    printTime: '16 hours',
    tags: ['chess', 'game', 'collectible'],
    color: '#f59e0b',
    icon: '♟️',
  },
]

export const CATEGORIES: ModelCategory[] = [
  'Prototype',
  'Art & Decor',
  'Functional',
  'Miniature',
  'Jewelry',
  'Mechanical',
  'Architecture',
  'Educational',
]

export interface StatusStep {
  status: OrderStatus
  label: string
  description: string
}

export const STATUS_STEPS: StatusStep[] = [
  { status: 'pending', label: 'Order Received', description: 'Your order has been submitted and is awaiting review.' },
  { status: 'quoted', label: 'Quote Sent', description: 'We have reviewed your order and sent a price quote.' },
  { status: 'approved', label: 'Approved', description: 'Quote approved. Your order is confirmed and queued for printing.' },
  { status: 'printing', label: 'Printing', description: 'Your model is currently being printed.' },
  { status: 'quality_check', label: 'Quality Check', description: 'Your print is undergoing quality inspection.' },
  { status: 'shipped', label: 'Shipped', description: 'Your order has been dispatched and is on its way.' },
  { status: 'delivered', label: 'Delivered', description: 'Your order has been successfully delivered.' },
]

export function QUOTE_CALC(
  dimensions: { length: number; width: number; height: number; unit: 'cm' | 'mm' },
  material: Material,
  quantity: number,
  infill: number
): number {
  const mat = MATERIALS.find(m => m.name === material)
  const rate = mat?.rate_per_cm3 ?? 12

  let l = dimensions.length
  let w = dimensions.width
  let h = dimensions.height

  if (dimensions.unit === 'mm') {
    l /= 10
    w /= 10
    h /= 10
  }

  const volume_cm3 = l * w * h
  const print_vol = volume_cm3 * (0.3 + 0.7 * (infill / 100))

  let qty_factor = 1.0
  if (quantity >= 2 && quantity <= 5) qty_factor = 0.9
  else if (quantity >= 6 && quantity <= 10) qty_factor = 0.8
  else if (quantity >= 11) qty_factor = 0.7

  const price = print_vol * rate * qty_factor * quantity
  return Math.max(299, Math.ceil(price))
}
