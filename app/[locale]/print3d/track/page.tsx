'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePrint3DStore } from '@/lib/print3d/store'
import { STATUS_STEPS } from '@/lib/print3d/data'
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

export default function TrackPage() {
  const [orderId, setOrderId] = useState('')
  const [email, setEmail] = useState('')
  const [foundOrder, setFoundOrder] = useState<PrintOrder | null | 'not-found'>(null)
  const [searched, setSearched] = useState(false)

  const { getOrderById, getOrdersByEmail } = usePrint3DStore()

  const handleSearch = () => {
    setSearched(true)
    if (orderId.trim()) {
      const order = getOrderById(orderId.trim().toUpperCase())
      if (order) {
        if (email && order.email.toLowerCase() !== email.toLowerCase()) {
          setFoundOrder('not-found')
          return
        }
        setFoundOrder(order)
        return
      }
    }
    if (email.trim() && !orderId.trim()) {
      const orders = getOrdersByEmail(email.trim())
      if (orders.length > 0) {
        setFoundOrder(orders[0])
        return
      }
    }
    setFoundOrder('not-found')
  }

  const currentStatusIdx = foundOrder && foundOrder !== 'not-found'
    ? STATUS_STEPS.findIndex(s => s.status === foundOrder.status)
    : -1

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-black mb-2">Track Your Order</h1>
      <p className="text-slate-400 mb-8">Enter your Order ID to get real-time status updates.</p>

      {/* Demo hint */}
      <div className="p-4 rounded-xl mb-8"
        style={{ backgroundColor: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)' }}>
        <p className="text-sm text-cyan-400 font-semibold mb-1">💡 Demo Orders Available</p>
        <p className="text-xs text-slate-400">
          Try these demo order IDs:{' '}
          {['P3D-DEMO-001', 'P3D-DEMO-002', 'P3D-DEMO-003'].map((id, i) => (
            <span key={id}>
              <button
                type="button"
                onClick={() => setOrderId(id)}
                className="font-mono font-bold underline decoration-dotted"
                style={{ color: '#22d3ee' }}
              >
                {id}
              </button>
              {i < 2 ? ', ' : ''}
            </span>
          ))}
        </p>
      </div>

      {/* Search Form */}
      <div className="p-6 rounded-2xl mb-8"
        style={{ backgroundColor: '#0d1220', border: '1px solid rgba(249,115,22,0.15)' }}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Order ID</label>
            <input
              type="text"
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
              placeholder="e.g. P3D-DEMO-001"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none font-mono"
              style={{ backgroundColor: '#060912', border: '1px solid rgba(249,115,22,0.2)', color: '#fff' }}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Your email (optional if ID provided)"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ backgroundColor: '#060912', border: '1px solid rgba(249,115,22,0.2)', color: '#fff' }}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all"
            style={{ backgroundColor: '#f97316' }}
          >
            Track Order →
          </button>
        </div>
      </div>

      {/* Not Found */}
      {searched && foundOrder === 'not-found' && (
        <div className="p-6 rounded-2xl text-center"
          style={{ backgroundColor: '#0d1220', border: '1px solid rgba(239,68,68,0.2)' }}>
          <div className="text-4xl mb-3">🔍</div>
          <p className="font-bold mb-1">Order Not Found</p>
          <p className="text-sm text-slate-400">
            No order matches that ID or email. Double-check and try again.
          </p>
        </div>
      )}

      {/* Order Found */}
      {foundOrder && foundOrder !== 'not-found' && (
        <div className="space-y-6">
          {/* Order Summary Card */}
          <div className="p-6 rounded-2xl"
            style={{ backgroundColor: '#0d1220', border: '1px solid rgba(249,115,22,0.15)' }}>
            <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
              <div>
                <p className="text-xs text-slate-500 font-mono mb-1">{foundOrder.id}</p>
                <h2 className="text-xl font-bold">{foundOrder.title}</h2>
                <p className="text-sm text-slate-400 mt-1">{foundOrder.category} • {foundOrder.material}</p>
              </div>
              <StatusBadge status={foundOrder.status} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <SummaryItem label="Quantity" value={String(foundOrder.quantity)} />
              <SummaryItem label="Color" value={foundOrder.color} />
              <SummaryItem label="Infill" value={`${foundOrder.infill}%`} />
              {foundOrder.quote ? (
                <SummaryItem label="Quote" value={`₹${foundOrder.quote.toLocaleString('en-IN')}`} highlight />
              ) : (
                <SummaryItem label="Quote" value="Pending" />
              )}
            </div>

            {foundOrder.adminNotes && (
              <div className="mt-4 p-3 rounded-lg"
                style={{ backgroundColor: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)' }}>
                <p className="text-xs text-cyan-400 font-semibold mb-1">Studio Update</p>
                <p className="text-sm text-slate-300">{foundOrder.adminNotes}</p>
              </div>
            )}
          </div>

          {/* Status Timeline */}
          {foundOrder.status !== 'cancelled' && (
            <div className="p-6 rounded-2xl"
              style={{ backgroundColor: '#0d1220', border: '1px solid rgba(249,115,22,0.15)' }}>
              <h3 className="font-bold mb-6">Order Timeline</h3>
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />

                <div className="space-y-6">
                  {STATUS_STEPS.map((stepItem, idx) => {
                    const isCompleted = idx <= currentStatusIdx
                    const isCurrent = idx === currentStatusIdx
                    const color = STATUS_COLORS[stepItem.status]

                    return (
                      <div key={stepItem.status} className="flex gap-4 relative">
                        {/* Dot */}
                        <div className="relative z-10 flex-shrink-0">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{
                              backgroundColor: isCompleted ? `${color}33` : '#1e293b',
                              border: `2px solid ${isCompleted ? color : '#334155'}`,
                            }}
                          >
                            {isCompleted && !isCurrent ? (
                              <span style={{ color }}>✓</span>
                            ) : isCurrent ? (
                              <span
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor: color,
                                  animation: 'pulse 1.5s ease-in-out infinite',
                                  boxShadow: `0 0 8px ${color}`,
                                }}
                              />
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-slate-700" />
                            )}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-2">
                          <p
                            className="font-semibold text-sm"
                            style={{ color: isCompleted ? '#fff' : '#475569' }}
                          >
                            {stepItem.label}
                            {isCurrent && (
                              <span
                                className="ml-2 text-xs px-2 py-0.5 rounded-full font-bold"
                                style={{ backgroundColor: `${color}22`, color }}
                              >
                                Current
                              </span>
                            )}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: isCompleted ? '#94a3b8' : '#334155' }}>
                            {stepItem.description}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {foundOrder.status === 'cancelled' && (
            <div className="p-6 rounded-2xl text-center"
              style={{ backgroundColor: '#0d1220', border: '1px solid rgba(239,68,68,0.3)' }}>
              <div className="text-4xl mb-3">❌</div>
              <p className="font-bold text-red-400">Order Cancelled</p>
              <p className="text-sm text-slate-400 mt-2">
                This order was cancelled. Contact us if you believe this is an error.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setFoundOrder(null); setSearched(false); setOrderId(''); setEmail('') }}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-400"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}
            >
              Search Another
            </button>
            <Link
              href="/print3d/order"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ backgroundColor: '#f97316' }}
            >
              New Order →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const color = STATUS_COLORS[status]
  const labels: Record<OrderStatus, string> = {
    pending: 'Pending Review',
    quoted: 'Quote Sent',
    approved: 'Approved',
    printing: 'Printing',
    quality_check: 'Quality Check',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  }
  return (
    <span
      className="px-3 py-1.5 rounded-full text-xs font-bold"
      style={{ backgroundColor: `${color}22`, color, border: `1px solid ${color}44` }}
    >
      {labels[status]}
    </span>
  )
}

function SummaryItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p className="text-sm font-bold" style={{ color: highlight ? '#f97316' : '#fff' }}>{value}</p>
    </div>
  )
}
