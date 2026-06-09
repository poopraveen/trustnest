'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { usePrint3DStore } from '@/lib/print3d/store'
import { MATERIALS, QUOTE_CALC, CATEGORIES } from '@/lib/print3d/data'
import type { Material, ModelCategory } from '@/lib/print3d/types'

const COLOR_SWATCHES = [
  { label: 'White', value: '#ffffff' },
  { label: 'Black', value: '#1a1a1a' },
  { label: 'Red', value: '#ef4444' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Green', value: '#22c55e' },
  { label: 'Orange', value: '#f97316' },
  { label: 'Purple', value: '#a855f7' },
  { label: 'Yellow', value: '#eab308' },
]

const BUDGET_OPTIONS = [
  'Under ₹500',
  '₹500-₹2000',
  '₹2000-₹10000',
  '₹10000+',
]

interface FormState {
  // Step 1
  title: string
  description: string
  purpose: string
  category: ModelCategory | ''
  // Step 2
  material: Material | ''
  color: string
  dimLength: string
  dimWidth: string
  dimHeight: string
  dimUnit: 'cm' | 'mm'
  quantity: string
  infill: number
  // Step 3
  referenceUrls: string[]
  notes: string
  budget: string
  deadline: string
  // Step 4
  name: string
  email: string
  phone: string
}

const INITIAL: FormState = {
  title: '', description: '', purpose: '', category: '',
  material: '', color: 'White',
  dimLength: '', dimWidth: '', dimHeight: '', dimUnit: 'cm',
  quantity: '1', infill: 20,
  referenceUrls: [''], notes: '', budget: '', deadline: '',
  name: '', email: '', phone: '',
}

export default function OrderPage() {
  const searchParams = useSearchParams()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormState>(INITIAL)
  const [fromCAD, setFromCAD] = useState(false)
  const [submittedId, setSubmittedId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const { addOrder } = usePrint3DStore()

  // Pre-fill from CAD Designer URL params: ?w=&h=&d=&unit=&title=
  useEffect(() => {
    const w = searchParams.get('w')
    const h = searchParams.get('h')
    const d = searchParams.get('d')
    const unit = searchParams.get('unit')
    const title = searchParams.get('title')
    if (w || h || d) {
      setForm(f => ({
        ...f,
        ...(title ? { title } : {}),
        ...(w ? { dimWidth: w } : {}),
        ...(h ? { dimHeight: h } : {}),
        ...(d ? { dimLength: d } : {}),
        ...(unit === 'mm' || unit === 'cm' ? { dimUnit: unit } : {}),
      }))
      setFromCAD(true)
    }
  }, [searchParams])

  const update = (field: keyof FormState, value: FormState[keyof FormState]) => {
    setForm(f => ({ ...f, [field]: value }))
  }

  const updateUrl = (idx: number, val: string) => {
    const urls = [...form.referenceUrls]
    urls[idx] = val
    update('referenceUrls', urls)
  }

  const addUrl = () => update('referenceUrls', [...form.referenceUrls, ''])
  const removeUrl = (idx: number) => {
    const urls = form.referenceUrls.filter((_, i) => i !== idx)
    update('referenceUrls', urls.length ? urls : [''])
  }

  const getQuote = () => {
    if (!form.material || !form.dimLength || !form.dimWidth || !form.dimHeight) return null
    return QUOTE_CALC(
      { length: Number(form.dimLength), width: Number(form.dimWidth), height: Number(form.dimHeight), unit: form.dimUnit },
      form.material as Material,
      Number(form.quantity) || 1,
      form.infill,
    )
  }

  const handleSubmit = () => {
    const id = addOrder({
      name: form.name,
      email: form.email,
      phone: form.phone,
      title: form.title,
      description: form.description,
      purpose: form.purpose,
      category: form.category as ModelCategory,
      material: form.material as Material,
      color: form.color,
      dimensions: {
        length: Number(form.dimLength),
        width: Number(form.dimWidth),
        height: Number(form.dimHeight),
        unit: form.dimUnit,
      },
      quantity: Number(form.quantity) || 1,
      infill: form.infill,
      referenceUrls: form.referenceUrls.filter(Boolean),
      notes: form.notes,
      budget: form.budget,
      deadline: form.deadline,
    })
    setSubmittedId(id)
  }

  const copyId = () => {
    if (submittedId) {
      navigator.clipboard.writeText(submittedId).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  if (submittedId) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-lg w-full text-center p-10 rounded-3xl"
          style={{ backgroundColor: '#0d1220', border: '1px solid rgba(249,115,22,0.3)' }}>
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-2xl font-black mb-2">Order Submitted!</h2>
          <p className="text-slate-400 mb-6">We&apos;ll review your request and send a quote within 24 hours.</p>
          <div className="p-4 rounded-xl mb-6"
            style={{ backgroundColor: '#060912', border: '1px solid rgba(249,115,22,0.2)' }}>
            <p className="text-xs text-slate-500 mb-1">Your Order ID</p>
            <p className="text-xl font-mono font-bold" style={{ color: '#f97316' }}>{submittedId}</p>
          </div>
          <button
            onClick={copyId}
            className="w-full py-2.5 rounded-xl font-semibold text-sm mb-4 transition-all"
            style={{ backgroundColor: copied ? '#22c55e' : 'rgba(249,115,22,0.15)', color: copied ? '#fff' : '#f97316', border: '1px solid rgba(249,115,22,0.3)' }}
          >
            {copied ? '✓ Copied!' : 'Copy Order ID'}
          </button>
          <Link
            href="/print3d/track"
            className="block w-full py-2.5 rounded-xl font-semibold text-sm text-white transition-all"
            style={{ backgroundColor: '#f97316' }}
          >
            Track My Order →
          </Link>
        </div>
      </div>
    )
  }

  const STEPS = ['Project Details', 'Specifications', 'References', 'Contact', 'Review']

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-black mb-2">Place Your Order</h1>
      <p className="text-slate-400 mb-8">Fill in your requirements and we&apos;ll get back with a quote.</p>

      {/* Progress */}
      <div className="flex items-center gap-1 mb-10">
        {STEPS.map((label, i) => {
          const n = i + 1
          const isActive = step === n
          const isDone = step > n
          return (
            <div key={n} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  style={{
                    backgroundColor: isDone ? '#f97316' : isActive ? 'rgba(249,115,22,0.2)' : '#1e293b',
                    color: isDone || isActive ? '#f97316' : '#64748b',
                    border: `2px solid ${isActive ? '#f97316' : isDone ? '#f97316' : '#334155'}`,
                  }}
                >
                  {isDone ? '✓' : n}
                </div>
                <span className="text-[10px] font-medium hidden sm:block"
                  style={{ color: isActive ? '#f97316' : isDone ? '#f97316' : '#475569' }}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mx-1 mb-4"
                  style={{ backgroundColor: step > n ? '#f97316' : '#1e293b' }} />
              )}
            </div>
          )
        })}
      </div>

      <div className="p-6 sm:p-8 rounded-2xl" style={{ backgroundColor: '#0d1220', border: '1px solid rgba(249,115,22,0.15)' }}>

        {/* Step 1: Project Details */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold mb-6">Project Details</h2>
            {fromCAD && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', color: '#fb923c' }}>
                <span>▲</span> Dimensions pre-filled from CAD Designer — review specs in Step 2
              </div>
            )}
            <FormField label="Project Title *">
              <input
                type="text"
                value={form.title}
                onChange={e => update('title', e.target.value)}
                placeholder="e.g. Custom Drone Frame Prototype"
                className="w-full px-4 py-3 rounded-xl text-sm bg-transparent outline-none"
                style={{ backgroundColor: '#060912', border: '1px solid rgba(249,115,22,0.2)', color: '#fff' }}
              />
            </FormField>
            <FormField label="Description *">
              <textarea
                value={form.description}
                onChange={e => update('description', e.target.value)}
                rows={4}
                placeholder="Describe what you want to build in detail..."
                className="w-full px-4 py-3 rounded-xl text-sm bg-transparent outline-none resize-none"
                style={{ backgroundColor: '#060912', border: '1px solid rgba(249,115,22,0.2)', color: '#fff' }}
              />
            </FormField>
            <FormField label="Purpose / Use Case *">
              <input
                type="text"
                value={form.purpose}
                onChange={e => update('purpose', e.target.value)}
                placeholder="e.g. Industrial prototype for UAV research"
                className="w-full px-4 py-3 rounded-xl text-sm bg-transparent outline-none"
                style={{ backgroundColor: '#060912', border: '1px solid rgba(249,115,22,0.2)', color: '#fff' }}
              />
            </FormField>
            <FormField label="Category *">
              <select
                value={form.category}
                onChange={e => update('category', e.target.value as ModelCategory)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ backgroundColor: '#060912', border: '1px solid rgba(249,115,22,0.2)', color: form.category ? '#fff' : '#64748b' }}
              >
                <option value="">Select category...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormField>
            <StepNav
              onNext={() => setStep(2)}
              canNext={!!(form.title && form.description && form.purpose && form.category)}
            />
          </div>
        )}

        {/* Step 2: Specifications */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold mb-6">Specifications</h2>

            <FormField label="Material *">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {MATERIALS.map(mat => (
                  <button
                    key={mat.name}
                    type="button"
                    onClick={() => update('material', mat.name)}
                    className="p-3 rounded-xl text-left transition-all"
                    style={{
                      backgroundColor: form.material === mat.name ? `${mat.borderColor}22` : '#060912',
                      border: `1px solid ${form.material === mat.name ? mat.borderColor : 'rgba(255,255,255,0.08)'}`,
                    }}
                  >
                    <div className="font-bold text-sm" style={{ color: mat.borderColor }}>{mat.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5 line-clamp-2">{mat.description.slice(0, 60)}...</div>
                  </button>
                ))}
              </div>
            </FormField>

            <FormField label="Color Preference">
              <div className="flex flex-wrap gap-2 mb-2">
                {COLOR_SWATCHES.map(c => (
                  <button
                    key={c.label}
                    type="button"
                    onClick={() => update('color', c.label)}
                    title={c.label}
                    className="w-8 h-8 rounded-full transition-all"
                    style={{
                      backgroundColor: c.value,
                      border: form.color === c.label ? '2px solid #f97316' : '2px solid transparent',
                      outline: form.color === c.label ? '2px solid rgba(249,115,22,0.4)' : 'none',
                    }}
                  />
                ))}
              </div>
              <input
                type="text"
                value={form.color}
                onChange={e => update('color', e.target.value)}
                placeholder="Or type custom color..."
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-transparent outline-none mt-2"
                style={{ backgroundColor: '#060912', border: '1px solid rgba(249,115,22,0.2)', color: '#fff' }}
              />
            </FormField>

            <FormField label="Dimensions *">
              <div className="flex gap-3 items-center">
                {(['dimLength', 'dimWidth', 'dimHeight'] as const).map((dim, i) => (
                  <div key={dim} className="flex-1">
                    <label className="text-xs text-slate-500 block mb-1">{['Length', 'Width', 'Height'][i]}</label>
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={form[dim]}
                      onChange={e => update(dim, e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{ backgroundColor: '#060912', border: '1px solid rgba(249,115,22,0.2)', color: '#fff' }}
                    />
                  </div>
                ))}
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Unit</label>
                  <select
                    value={form.dimUnit}
                    onChange={e => update('dimUnit', e.target.value as 'cm' | 'mm')}
                    className="px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ backgroundColor: '#060912', border: '1px solid rgba(249,115,22,0.2)', color: '#fff' }}
                  >
                    <option value="cm">cm</option>
                    <option value="mm">mm</option>
                  </select>
                </div>
              </div>
            </FormField>

            <div className="flex gap-4">
              <FormField label="Quantity" className="flex-1">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={form.quantity}
                  onChange={e => update('quantity', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ backgroundColor: '#060912', border: '1px solid rgba(249,115,22,0.2)', color: '#fff' }}
                />
              </FormField>
              <FormField label={`Infill: ${form.infill}%`} className="flex-1">
                <input
                  type="range"
                  min="15"
                  max="100"
                  value={form.infill}
                  onChange={e => update('infill', Number(e.target.value))}
                  className="w-full mt-2"
                  style={{ accentColor: '#f97316' }}
                />
                <div className="flex justify-between text-xs text-slate-600 mt-1">
                  <span>15% (Light)</span>
                  <span>100% (Solid)</span>
                </div>
              </FormField>
            </div>

            <StepNav
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
              canNext={!!(form.material && form.dimLength && form.dimWidth && form.dimHeight)}
            />
          </div>
        )}

        {/* Step 3: References */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold mb-6">References & Details</h2>

            <FormField label="Reference URLs">
              <div className="space-y-2">
                {form.referenceUrls.map((url, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="url"
                      value={url}
                      onChange={e => updateUrl(i, e.target.value)}
                      placeholder="https://thingiverse.com/thing/..."
                      className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
                      style={{ backgroundColor: '#060912', border: '1px solid rgba(249,115,22,0.2)', color: '#fff' }}
                    />
                    <button
                      type="button"
                      onClick={() => removeUrl(i)}
                      className="px-3 py-2.5 rounded-xl text-sm text-red-400"
                      style={{ backgroundColor: '#060912', border: '1px solid rgba(239,68,68,0.2)' }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addUrl}
                  className="text-sm font-medium px-3 py-2 rounded-lg transition-all"
                  style={{ color: '#f97316', border: '1px dashed rgba(249,115,22,0.3)' }}
                >
                  + Add Reference URL
                </button>
              </div>
            </FormField>

            <FormField label="Additional Notes">
              <textarea
                value={form.notes}
                onChange={e => update('notes', e.target.value)}
                rows={3}
                placeholder="Any special requirements, finish preferences, etc."
                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                style={{ backgroundColor: '#060912', border: '1px solid rgba(249,115,22,0.2)', color: '#fff' }}
              />
            </FormField>

            <div className="flex gap-4">
              <FormField label="Budget Range *" className="flex-1">
                <select
                  value={form.budget}
                  onChange={e => update('budget', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ backgroundColor: '#060912', border: '1px solid rgba(249,115,22,0.2)', color: form.budget ? '#fff' : '#64748b' }}
                >
                  <option value="">Select range...</option>
                  {BUDGET_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </FormField>
              <FormField label="Deadline" className="flex-1">
                <input
                  type="date"
                  value={form.deadline}
                  onChange={e => update('deadline', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ backgroundColor: '#060912', border: '1px solid rgba(249,115,22,0.2)', color: '#fff', colorScheme: 'dark' }}
                />
              </FormField>
            </div>

            <StepNav
              onBack={() => setStep(2)}
              onNext={() => setStep(4)}
              canNext={!!form.budget}
            />
          </div>
        )}

        {/* Step 4: Contact */}
        {step === 4 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold mb-6">Contact Information</h2>
            <FormField label="Full Name *">
              <input
                type="text"
                value={form.name}
                onChange={e => update('name', e.target.value)}
                placeholder="Arjun Kumar"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ backgroundColor: '#060912', border: '1px solid rgba(249,115,22,0.2)', color: '#fff' }}
              />
            </FormField>
            <FormField label="Email Address *">
              <input
                type="email"
                value={form.email}
                onChange={e => update('email', e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ backgroundColor: '#060912', border: '1px solid rgba(249,115,22,0.2)', color: '#fff' }}
              />
            </FormField>
            <FormField label="Phone Number *">
              <input
                type="tel"
                value={form.phone}
                onChange={e => update('phone', e.target.value)}
                placeholder="9876543210"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ backgroundColor: '#060912', border: '1px solid rgba(249,115,22,0.2)', color: '#fff' }}
              />
            </FormField>
            <StepNav
              onBack={() => setStep(3)}
              onNext={() => setStep(5)}
              canNext={!!(form.name && form.email && form.phone)}
            />
          </div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold mb-6">Review Your Order</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ReviewCard title="Project">
                <Row label="Title" value={form.title} />
                <Row label="Category" value={form.category} />
                <Row label="Purpose" value={form.purpose} />
              </ReviewCard>
              <ReviewCard title="Specifications">
                <Row label="Material" value={form.material} />
                <Row label="Color" value={form.color} />
                <Row label="Dimensions" value={`${form.dimLength} × ${form.dimWidth} × ${form.dimHeight} ${form.dimUnit}`} />
                <Row label="Quantity" value={form.quantity} />
                <Row label="Infill" value={`${form.infill}%`} />
              </ReviewCard>
              <ReviewCard title="Details">
                <Row label="Budget" value={form.budget} />
                <Row label="Deadline" value={form.deadline || 'Not specified'} />
                {form.referenceUrls.filter(Boolean).length > 0 && (
                  <Row label="References" value={`${form.referenceUrls.filter(Boolean).length} URL(s)`} />
                )}
              </ReviewCard>
              <ReviewCard title="Contact">
                <Row label="Name" value={form.name} />
                <Row label="Email" value={form.email} />
                <Row label="Phone" value={form.phone} />
              </ReviewCard>
            </div>

            {/* Quote estimate */}
            {getQuote() !== null && (
              <div className="p-5 rounded-xl"
                style={{ backgroundColor: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)' }}>
                <p className="text-sm text-slate-400 mb-1">Estimated Quote</p>
                <p className="text-3xl font-black" style={{ color: '#f97316' }}>
                  ₹{getQuote()?.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  *Final price confirmed after review. Includes printing, QC & local delivery.
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-5 py-3 rounded-xl text-sm font-semibold text-slate-400"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all"
                style={{ backgroundColor: '#f97316' }}
              >
                Submit Order →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function FormField({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-slate-300 mb-2">{label}</label>
      {children}
    </div>
  )
}

function StepNav({ onBack, onNext, canNext }: { onBack?: () => void; onNext?: () => void; canNext?: boolean }) {
  return (
    <div className="flex gap-3 pt-4">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-3 rounded-xl text-sm font-semibold text-slate-400"
          style={{ border: '1px solid rgba(255,255,255,0.1)' }}
        >
          ← Back
        </button>
      )}
      {onNext && (
        <button
          type="button"
          onClick={onNext}
          disabled={!canNext}
          className="flex-1 py-3 rounded-xl text-sm font-bold transition-all"
          style={{
            backgroundColor: canNext ? '#f97316' : '#1e293b',
            color: canNext ? '#fff' : '#475569',
            cursor: canNext ? 'pointer' : 'not-allowed',
          }}
        >
          Continue →
        </button>
      )}
    </div>
  )
}

function ReviewCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-xl" style={{ backgroundColor: '#060912', border: '1px solid rgba(255,255,255,0.06)' }}>
      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">{title}</h4>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-xs font-medium text-right">{value}</span>
    </div>
  )
}
