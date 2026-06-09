'use client'

import { useState } from 'react'
import { GALLERY_ITEMS, CATEGORIES } from '@/lib/print3d/data'
import type { ModelCategory } from '@/lib/print3d/types'

const MATERIAL_COLORS: Record<string, string> = {
  PLA: '#22c55e',
  ABS: '#3b82f6',
  PETG: '#a855f7',
  Resin: '#f59e0b',
  TPU: '#ec4899',
  Nylon: '#f97316',
}

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState<ModelCategory | 'All'>('All')

  const filtered = activeCategory === 'All'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter(item => item.category === activeCategory)

  const allCategories: Array<ModelCategory | 'All'> = ['All', ...CATEGORIES]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black mb-3">Our 3D Print Gallery</h1>
        <p className="text-slate-400">Explore what&apos;s possible — from prototypes to art pieces</p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 justify-center mb-10">
        {allCategories.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
            style={{
              backgroundColor: activeCategory === cat ? '#f97316' : 'rgba(249,115,22,0.1)',
              color: activeCategory === cat ? '#fff' : '#f97316',
              border: `1px solid ${activeCategory === cat ? '#f97316' : 'rgba(249,115,22,0.2)'}`,
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map(item => (
          <GalleryCard key={item.id} item={item} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          No items in this category yet.
        </div>
      )}
    </div>
  )
}

function GalleryCard({ item }: { item: typeof GALLERY_ITEMS[number] }) {
  const matColor = MATERIAL_COLORS[item.material] ?? '#f97316'

  return (
    <div
      className="rounded-2xl overflow-hidden group transition-all duration-300"
      style={{
        backgroundColor: '#0d1220',
        border: '1px solid rgba(249,115,22,0.15)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 30px rgba(249,115,22,0.2)'
        ;(e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(249,115,22,0.4)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
        ;(e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(249,115,22,0.15)'
      }}
    >
      {/* Icon Box */}
      <div
        className="h-40 flex items-center justify-center text-6xl relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${item.color}33 0%, ${item.color}11 100%)` }}
      >
        <span className="relative z-10 filter drop-shadow-lg">{item.icon}</span>
        <div
          className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-300"
          style={{ background: `radial-gradient(circle at center, ${item.color} 0%, transparent 70%)` }}
        />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Badges */}
        <div className="flex gap-2 mb-3 flex-wrap">
          <span
            className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
            style={{ backgroundColor: 'rgba(249,115,22,0.15)', color: '#f97316' }}
          >
            {item.category}
          </span>
          <span
            className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
            style={{ backgroundColor: `${matColor}22`, color: matColor }}
          >
            {item.material}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-sm mb-2">{item.title}</h3>

        {/* Description */}
        <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-2">
          {item.description}
        </p>

        {/* Print Time */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-xs text-slate-500">⏱</span>
          <span className="text-xs text-slate-500">{item.printTime} print time</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {item.tags.map(tag => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 rounded font-medium"
              style={{ backgroundColor: '#1e293b', color: '#64748b' }}
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
