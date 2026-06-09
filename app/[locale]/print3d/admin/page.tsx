'use client'

import { useState } from 'react'
import { usePrint3DStore } from '@/lib/print3d/store'
import type { PrintOrder, OrderStatus } from '@/lib/print3d/types'

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: '#f59e0b',
  quoted: '#3b82f6',
  approved: '#22d3ee',
  printing: '#f97316',
  quality_check: '#a855f7',
  shipped: '#10b981',
  delivered: '#22c55e',
  cancelled: '#ef4444',
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  quoted: 'Quoted',
  approved: 'Approved',
  printing: 'Printing',
  quality_check: 'QC',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const ALL_STATUSES: OrderStatus[] = [
  'pending', 'quoted', 'approved', 'printing', 'quality_check', 'shipped', 'delivered', 'cancelled',
]

export default function AdminPage() {
  const { orders, updateOrder } = usePrint3DStore()
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all')
  const [selectedOrder, setSelectedOrder] = useState<PrintOrder | null>(null)
  const [editStatus, setEditStatus] = useState<OrderStatus>('pending')
  const [editQuote, setEditQuote] = useState<string>('')
  const [editNotes, setEditNotes] = useState<string>('')
  const [saved, setSaved] = useState(false)

  const filtered = filterStatus === 'all'
    ? orders
    : orders.filter(o => o.status === filterStatus)

  const totalRevenue = orders
    .filter(o => o.quote && ['printing', 'quality_check', 'shipped', 'delivered'].includes(o.status))
    .reduce((s, o) => s + (o.quote ?? 0), 0)

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    inProgress: orders.filter(o => ['approved', 'printing', 'quality_check'].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue: totalRevenue,
  }

  const openModal = (order: PrintOrder) => {
    setSelectedOrder(order)
    setEditStatus(order.status)
    setEditQuote(order.quote ? String(order.quote) : '')
    setEditNotes(order.adminNotes ?? '')
    setSaved(false)
  }

  const handleSave = () => {
    if (!selectedOrder) return
    updateOrder(selectedOrder.id, {
      status: editStatus,
      quote: editQuote ? Number(editQuote) : undefined,
      adminNotes: editNotes,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    // Update local selected order state
    setSelectedOrder(prev => prev ? { ...prev, status: editStatus, quote: editQuote ? Number(editQuote) : undefined, adminNotes: editNotes } : null)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black mb-1">Admin Dashboard</h1>
          <p className="text-slate-400 text-sm">Manage all 3D print orders</p>
        </div>
        <div className="px-3 py-1.5 rounded-lg text-xs font-bold"
          style={{ backgroundColor: 'rgba(249,115,22,0.15)', color: '#f97316', border: '1px solid rgba(249,115,22,0.3)' }}>
          Demo Mode
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Total Orders', value: stats.total, color: '#f97316' },
          { label: 'Pending Quotes', value: stats.pending, color: '#f59e0b' },
          { label: 'In Progress', value: stats.inProgress, color: '#22d3ee' },
          { label: 'Delivered', value: stats.delivered, color: '#22c55e' },
          { label: 'Revenue', value: `₹${stats.revenue.toLocaleString('en-IN')}`, color: '#a855f7' },
        ].map(stat => (
          <div key={stat.label}
            className="p-4 rounded-xl"
            style={{ backgroundColor: '#0d1220', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-2xl font-black mb-0.5" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-xs text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <FilterTab label="All" value="all" active={filterStatus === 'all'} onClick={() => setFilterStatus('all')} count={orders.length} />
        {ALL_STATUSES.map(s => (
          <FilterTab
            key={s}
            label={STATUS_LABELS[s]}
            value={s}
            active={filterStatus === s}
            onClick={() => setFilterStatus(s)}
            count={orders.filter(o => o.status === s).length}
            color={STATUS_COLORS[s]}
          />
        ))}
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(249,115,22,0.15)', backgroundColor: '#0d1220' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Order ID', 'Client', 'Title', 'Material', 'Qty', 'Status', 'Quote', 'Date', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((order, idx) => (
                <tr
                  key={order.id}
                  className="transition-colors cursor-pointer"
                  style={{ borderBottom: idx < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                  onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'rgba(249,115,22,0.04)'}
                  onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'transparent'}
                  onClick={() => openModal(order)}
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-bold" style={{ color: '#f97316' }}>{order.id}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-sm whitespace-nowrap">{order.name}</div>
                    <div className="text-xs text-slate-500">{order.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm max-w-[180px] truncate">{order.title}</div>
                    <div className="text-xs text-slate-500">{order.category}</div>
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">{order.material}</td>
                  <td className="px-4 py-3 text-sm">{order.quantity}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    {order.quote ? `₹${order.quote.toLocaleString('en-IN')}` : <span className="text-slate-600">—</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-500">→</span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-600">
                    No orders with this status.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
          onClick={e => { if (e.target === e.currentTarget) setSelectedOrder(null) }}
        >
          <div
            className="h-full w-full max-w-lg overflow-y-auto"
            style={{ backgroundColor: '#0d1220', borderLeft: '1px solid rgba(249,115,22,0.2)' }}
          >
            <div className="p-6">
              {/* Drawer Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="font-mono text-xs font-bold mb-1" style={{ color: '#f97316' }}>{selectedOrder.id}</p>
                  <h2 className="text-lg font-bold">{selectedOrder.title}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-lg transition-colors"
                  style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  ✕
                </button>
              </div>

              {/* Order Details */}
              <Section title="Project Details">
                <Detail label="Description" value={selectedOrder.description} />
                <Detail label="Purpose" value={selectedOrder.purpose} />
                <Detail label="Category" value={selectedOrder.category} />
              </Section>

              <Section title="Specifications">
                <Detail label="Material" value={selectedOrder.material} />
                <Detail label="Color" value={selectedOrder.color} />
                <Detail label="Dimensions" value={`${selectedOrder.dimensions.length} × ${selectedOrder.dimensions.width} × ${selectedOrder.dimensions.height} ${selectedOrder.dimensions.unit}`} />
                <Detail label="Quantity" value={String(selectedOrder.quantity)} />
                <Detail label="Infill" value={`${selectedOrder.infill}%`} />
              </Section>

              <Section title="Contact">
                <Detail label="Name" value={selectedOrder.name} />
                <Detail label="Email" value={selectedOrder.email} />
                <Detail label="Phone" value={selectedOrder.phone} />
              </Section>

              <Section title="Order Details">
                <Detail label="Budget" value={selectedOrder.budget} />
                <Detail label="Deadline" value={selectedOrder.deadline || 'Not specified'} />
                {selectedOrder.notes && <Detail label="Notes" value={selectedOrder.notes} />}
                {selectedOrder.referenceUrls.filter(Boolean).length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-slate-500 mb-1">Reference URLs</p>
                    {selectedOrder.referenceUrls.filter(Boolean).map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                        className="text-xs block truncate" style={{ color: '#22d3ee' }}>
                        {url}
                      </a>
                    ))}
                  </div>
                )}
              </Section>

              {/* Admin Controls */}
              <div className="p-4 rounded-xl space-y-4"
                style={{ backgroundColor: '#060912', border: '1px solid rgba(249,115,22,0.2)' }}>
                <h3 className="font-bold text-sm" style={{ color: '#f97316' }}>Update Order</h3>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-2">Status</label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value as OrderStatus)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ backgroundColor: '#0d1220', border: '1px solid rgba(249,115,22,0.2)', color: '#fff' }}
                  >
                    {ALL_STATUSES.map(s => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-2">Quote Amount (₹)</label>
                  <input
                    type="number"
                    value={editQuote}
                    onChange={e => setEditQuote(e.target.value)}
                    placeholder="Enter quote in INR"
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ backgroundColor: '#0d1220', border: '1px solid rgba(249,115,22,0.2)', color: '#fff' }}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-2">Admin Notes</label>
                  <textarea
                    value={editNotes}
                    onChange={e => setEditNotes(e.target.value)}
                    rows={3}
                    placeholder="Internal notes for this order..."
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                    style={{ backgroundColor: '#0d1220', border: '1px solid rgba(249,115,22,0.2)', color: '#fff' }}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  className="w-full py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={{
                    backgroundColor: saved ? '#22c55e' : '#f97316',
                    color: '#fff',
                  }}
                >
                  {saved ? '✓ Saved!' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FilterTab({
  label, value, active, onClick, count, color,
}: {
  label: string; value: string; active: boolean; onClick: () => void; count: number; color?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
      style={{
        backgroundColor: active ? (color ? `${color}22` : 'rgba(249,115,22,0.15)') : '#0d1220',
        color: active ? (color ?? '#f97316') : '#64748b',
        border: `1px solid ${active ? (color ?? '#f97316') + '44' : 'rgba(255,255,255,0.06)'}`,
      }}
    >
      {label}
      <span className="px-1 py-0.5 rounded text-[10px] font-bold"
        style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
        {count}
      </span>
    </button>
  )
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const color = STATUS_COLORS[status]
  return (
    <span
      className="px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap"
      style={{
        backgroundColor: `${color}22`,
        color,
        border: `1px solid ${color}44`,
        animation: status === 'printing' ? 'pulse 1.5s ease-in-out infinite' : 'none',
      }}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-slate-500">{label}: </span>
      <span className="text-xs text-slate-200">{value}</span>
    </div>
  )
}
