export type Material = 'PLA' | 'ABS' | 'PETG' | 'Resin' | 'TPU' | 'Nylon'
export type OrderStatus = 'pending' | 'quoted' | 'approved' | 'printing' | 'quality_check' | 'shipped' | 'delivered' | 'cancelled'
export type ModelCategory = 'Prototype' | 'Art & Decor' | 'Functional' | 'Miniature' | 'Jewelry' | 'Mechanical' | 'Architecture' | 'Educational'

export interface OrderDimensions {
  length: number
  width: number
  height: number
  unit: 'cm' | 'mm'
}

export interface PrintOrder {
  id: string
  name: string
  email: string
  phone: string
  title: string
  description: string
  purpose: string
  category: ModelCategory
  material: Material
  color: string
  dimensions: OrderDimensions
  quantity: number
  infill: number
  referenceUrls: string[]
  notes: string
  budget: string
  deadline: string
  status: OrderStatus
  quote?: number
  adminNotes?: string
  createdAt: string
  updatedAt: string
}

export interface GalleryItem {
  id: string
  title: string
  category: ModelCategory
  material: Material
  description: string
  printTime: string
  tags: string[]
  color: string
  icon: string
}
