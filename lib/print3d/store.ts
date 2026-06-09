'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PrintOrder, OrderStatus } from './types'

const DEMO_ORDERS: PrintOrder[] = [
  {
    id: 'P3D-DEMO-001',
    name: 'Arjun Kumar',
    email: 'arjun@example.com',
    phone: '9876543210',
    title: 'Custom Drone Frame Prototype',
    description: 'Lightweight drone frame with integrated cable channels and motor mounts',
    purpose: 'Prototype for UAV research project',
    category: 'Prototype',
    material: 'Nylon',
    color: 'Matte Black',
    dimensions: { length: 25, width: 25, height: 4, unit: 'cm' },
    quantity: 2,
    infill: 40,
    referenceUrls: ['https://thingiverse.com/thing/drone-frame'],
    notes: 'Please ensure motor mount holes are exactly 16mm diameter',
    budget: '₹2000-₹10000',
    deadline: '2026-06-20',
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'P3D-DEMO-002',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    phone: '9123456789',
    title: 'Decorative Bookend Set',
    description: 'A pair of geometric mountain-themed bookends for home office',
    purpose: 'Home decoration and gift',
    category: 'Art & Decor',
    material: 'PLA',
    color: 'Pearl White',
    dimensions: { length: 120, width: 80, height: 150, unit: 'mm' },
    quantity: 1,
    infill: 20,
    referenceUrls: [],
    notes: 'Smooth finish preferred, will paint after',
    budget: '₹500-₹2000',
    deadline: '2026-06-15',
    status: 'printing',
    quote: 1450,
    adminNotes: 'PLA print started on Ender 3 Pro. ETA 18 hours.',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'P3D-DEMO-003',
    name: 'Ravi Venkatesh',
    email: 'ravi@example.com',
    phone: '9988776655',
    title: 'Custom Phone Case - iPhone 15 Pro',
    description: 'Flexible phone case with company logo embossed on back',
    purpose: 'Corporate gifting — 10 units',
    category: 'Functional',
    material: 'TPU',
    color: 'Translucent Blue',
    dimensions: { length: 15, width: 8, height: 1, unit: 'cm' },
    quantity: 10,
    infill: 30,
    referenceUrls: ['https://grabcad.com/iphone15-case-ref'],
    notes: 'Logo file will be shared separately over WhatsApp',
    budget: '₹2000-₹10000',
    deadline: '2026-06-12',
    status: 'shipped',
    quote: 3200,
    adminNotes: 'All 10 units printed and QC passed. Shipped via DTDC — tracking TN9987665.',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
]

interface Print3DStore {
  orders: PrintOrder[]
  addOrder: (order: Omit<PrintOrder, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => string
  updateOrder: (id: string, updates: { status?: OrderStatus; quote?: number; adminNotes?: string }) => void
  getOrderById: (id: string) => PrintOrder | undefined
  getOrdersByEmail: (email: string) => PrintOrder[]
}

export const usePrint3DStore = create<Print3DStore>()(
  persist(
    (set, get) => ({
      orders: DEMO_ORDERS,

      addOrder: (orderData) => {
        const id = `P3D-${Date.now().toString(36).toUpperCase()}`
        const now = new Date().toISOString()
        const newOrder: PrintOrder = {
          ...orderData,
          id,
          status: 'pending',
          createdAt: now,
          updatedAt: now,
        }
        set(state => ({ orders: [newOrder, ...state.orders] }))
        return id
      },

      updateOrder: (id, updates) => {
        set(state => ({
          orders: state.orders.map(o =>
            o.id === id
              ? { ...o, ...updates, updatedAt: new Date().toISOString() }
              : o
          ),
        }))
      },

      getOrderById: (id) => {
        return get().orders.find(o => o.id === id)
      },

      getOrdersByEmail: (email) => {
        return get().orders.filter(o => o.email.toLowerCase() === email.toLowerCase())
      },
    }),
    {
      name: 'print3d-orders',
    }
  )
)
