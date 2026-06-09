import Link from 'next/link'
import { MATERIALS, GALLERY_ITEMS } from '@/lib/print3d/data'

export default function Print3DHome() {
  const previewItems = GALLERY_ITEMS.slice(0, 4)

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #f97316 0%, transparent 70%)' }} />
        </div>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Text */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
                style={{ backgroundColor: 'rgba(249,115,22,0.15)', color: '#f97316', border: '1px solid rgba(249,115,22,0.3)' }}>
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                Chennai&apos;s Premium 3D Printing Studio
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6">
                Turn Your Ideas Into{' '}
                <span style={{ background: 'linear-gradient(90deg, #f97316, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Physical Reality
                </span>
              </h1>
              <p className="text-slate-400 text-lg mb-8 max-w-xl lg:mx-0 mx-auto">
                Upload your design, choose your material, and we&apos;ll bring your 3D models to life with precision manufacturing and fast delivery across India.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Link
                  href="/print3d/order"
                  className="px-6 py-3 font-semibold text-white rounded-xl transition-all text-sm"
                  style={{ backgroundColor: '#f97316' }}
                >
                  Start Your Order →
                </Link>
                <Link
                  href="/print3d/gallery"
                  className="px-6 py-3 font-semibold rounded-xl transition-all text-sm"
                  style={{ border: '1px solid rgba(249,115,22,0.4)', color: '#f97316' }}
                >
                  View Gallery
                </Link>
              </div>
            </div>

            {/* Animated 3D Print Visual */}
            <div className="flex-shrink-0 flex items-end justify-center" style={{ height: 240, width: 240 }}>
              <PrintAnimation />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section style={{ backgroundColor: '#0d1220', borderTop: '1px solid rgba(249,115,22,0.15)', borderBottom: '1px solid rgba(249,115,22,0.15)' }}
        className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '500+', label: 'Orders Completed' },
              { value: '200+', label: 'Happy Clients' },
              { value: '6', label: 'Materials' },
              { value: '24hr', label: 'Quote Turnaround' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-black" style={{ color: '#f97316' }}>{stat.value}</div>
                <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black mb-3">How It Works</h2>
            <p className="text-slate-400">From idea to delivery in 3 simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: '📋',
                title: 'Submit Your Request',
                desc: 'Fill out our detailed order form with your design specs, dimensions, material preferences, and reference files.',
              },
              {
                step: '02',
                icon: '💬',
                title: 'We Quote in 24hrs',
                desc: 'Our team reviews your request and sends a detailed price quote within 24 hours. Approve and we get started.',
              },
              {
                step: '03',
                icon: '📦',
                title: 'Print, QC & Deliver',
                desc: 'We print with precision, run quality checks, and ship directly to your door with tracking updates.',
              },
            ].map((step) => (
              <div
                key={step.step}
                className="relative p-6 rounded-2xl"
                style={{ backgroundColor: '#0d1220', border: '1px solid rgba(249,115,22,0.15)' }}
              >
                <div className="text-5xl mb-4">{step.icon}</div>
                <div className="text-xs font-black text-slate-600 mb-2">{step.step}</div>
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                {step.step !== '03' && (
                  <div className="hidden md:block absolute top-1/2 -right-4 z-10 text-slate-600 text-xl">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Materials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#0d1220' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black mb-3">Materials We Use</h2>
            <p className="text-slate-400">6 professional-grade materials for every application</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MATERIALS.map((mat) => (
              <div
                key={mat.name}
                className="p-6 rounded-2xl transition-all"
                style={{ backgroundColor: '#060912', border: `1px solid ${mat.borderColor}33` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold" style={{ color: mat.borderColor }}>{mat.name}</h3>
                  <span className="text-xs text-slate-500 font-mono">₹{mat.rate_per_cm3}/cm³</span>
                </div>
                <p className="text-sm text-slate-400 mb-4 leading-relaxed">{mat.description}</p>
                <div className="space-y-2 mb-4">
                  {(['strength', 'detail', 'flexibility'] as const).map((prop) => (
                    <div key={prop} className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 capitalize w-16">{prop}</span>
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map((n) => (
                          <div
                            key={n}
                            className="w-5 h-1.5 rounded-full"
                            style={{ backgroundColor: n <= mat.properties[prop] ? mat.borderColor : '#1e293b' }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500">
                  <span className="font-semibold text-slate-400">Best for: </span>
                  {mat.best_for}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-black mb-2">Our Work</h2>
              <p className="text-slate-400">A glimpse of what we&apos;ve built</p>
            </div>
            <Link href="/print3d/gallery" className="text-sm font-semibold" style={{ color: '#f97316' }}>
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {previewItems.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl overflow-hidden transition-all"
                style={{ backgroundColor: '#0d1220', border: '1px solid rgba(249,115,22,0.15)' }}
              >
                <div className="h-32 flex items-center justify-center text-5xl"
                  style={{ background: `linear-gradient(135deg, ${item.color}22, ${item.color}44)` }}>
                  {item.icon}
                </div>
                <div className="p-4">
                  <div className="flex gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: 'rgba(249,115,22,0.15)', color: '#f97316' }}>
                      {item.category}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium text-slate-300"
                      style={{ backgroundColor: '#1e293b' }}>
                      {item.material}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-slate-500">{item.printTime} print time</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#0d1220' }}>
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-10 rounded-3xl"
            style={{ border: '1px solid rgba(249,115,22,0.3)', background: 'linear-gradient(135deg, rgba(249,115,22,0.05), rgba(34,211,238,0.05))' }}>
            <h2 className="text-3xl sm:text-4xl font-black mb-4">
              Ready to Build Something{' '}
              <span style={{ color: '#f97316' }}>Amazing?</span>
            </h2>
            <p className="text-slate-400 mb-8">
              Join 200+ creators, engineers, and businesses who trust us with their 3D printing needs.
              Submit your design today and get a quote within 24 hours.
            </p>
            <Link
              href="/print3d/order"
              className="inline-block px-8 py-4 font-bold text-white rounded-xl text-lg transition-all"
              style={{ backgroundColor: '#f97316' }}
            >
              Start Your Order Now →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function PrintAnimation() {
  return (
    <div className="relative" style={{ width: 180, height: 220 }}>
      <style>{`
        @keyframes printLayer {
          0%, 100% { transform: scaleY(0); opacity: 0; }
          10% { transform: scaleY(1); opacity: 1; }
        }
        @keyframes nozzleMove {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(60px); }
        }
        .layer-1 { animation: printLayer 3s ease-in-out 0s infinite; }
        .layer-2 { animation: printLayer 3s ease-in-out 0.3s infinite; }
        .layer-3 { animation: printLayer 3s ease-in-out 0.6s infinite; }
        .layer-4 { animation: printLayer 3s ease-in-out 0.9s infinite; }
        .layer-5 { animation: printLayer 3s ease-in-out 1.2s infinite; }
        .layer-6 { animation: printLayer 3s ease-in-out 1.5s infinite; }
        .nozzle { animation: nozzleMove 3s ease-in-out infinite; }
      `}</style>

      {/* Nozzle */}
      <div className="nozzle absolute" style={{ top: 10, left: 50, width: 16, height: 24, backgroundColor: '#94a3b8', borderRadius: '0 0 4px 4px', zIndex: 10 }} />
      <div className="absolute" style={{ top: 34, left: 58, width: 2, height: 8, backgroundColor: '#f97316', zIndex: 10 }} />

      {/* Layers */}
      <div style={{ position: 'absolute', bottom: 0, left: 20, width: 140 }}>
        {[
          { color: '#f97316', h: 12 },
          { color: '#ea580c', h: 12 },
          { color: '#c2410c', h: 12 },
          { color: '#9a3412', h: 12 },
          { color: '#7c2d12', h: 12 },
          { color: '#431407', h: 12 },
        ].map((layer, i) => (
          <div
            key={i}
            className={`layer-${i + 1}`}
            style={{
              height: layer.h,
              backgroundColor: layer.color,
              transformOrigin: 'bottom',
              marginBottom: 1,
              borderRadius: i === 5 ? '6px 6px 0 0' : undefined,
              opacity: 0.9,
            }}
          />
        ))}
      </div>

      {/* Build Platform */}
      <div className="absolute bottom-0 left-10 right-10 h-3 rounded"
        style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
    </div>
  )
}
