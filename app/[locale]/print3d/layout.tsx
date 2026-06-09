import Link from 'next/link'

export default function Print3DLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#060912', color: '#fff' }}>
      <header
        className="sticky top-0 z-50"
        style={{
          backgroundColor: '#060912',
          borderBottom: '1px solid rgba(249,115,22,0.2)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link href="/print3d" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg font-black"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                  ▲
                </div>
                <span className="text-xl font-black tracking-tight"
                  style={{ background: 'linear-gradient(90deg, #f97316, #fb923c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  PRINT3D
                </span>
              </Link>
              <span className="hidden sm:block text-xs font-medium text-slate-400 border-l border-slate-700 pl-3">
                Chennai&apos;s Premium 3D Printing Studio
              </span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              <NavLink href="/print3d">Home</NavLink>
              <NavLink href="/print3d/gallery">Gallery</NavLink>
              <NavLink href="/print3d/track">Track Order</NavLink>
              <Link
                href="/print3d/order"
                className="ml-2 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all"
                style={{ backgroundColor: '#f97316' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#ea6e0f' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#f97316' }}
              >
                Order Now
              </Link>
            </nav>

            {/* Mobile Nav */}
            <div className="md:hidden flex items-center gap-2">
              <Link
                href="/print3d/order"
                className="px-3 py-1.5 text-xs font-semibold text-white rounded-lg"
                style={{ backgroundColor: '#f97316' }}
              >
                Order Now
              </Link>
            </div>
          </div>

          {/* Mobile menu links */}
          <div className="md:hidden flex items-center gap-4 pb-3 overflow-x-auto">
            <NavLink href="/print3d">Home</NavLink>
            <NavLink href="/print3d/gallery">Gallery</NavLink>
            <NavLink href="/print3d/track">Track Order</NavLink>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer style={{ backgroundColor: '#0d1220', borderTop: '1px solid rgba(249,115,22,0.15)' }}
        className="mt-20 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-black text-lg mb-1"
            style={{ background: 'linear-gradient(90deg, #f97316, #fb923c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            PRINT3D
          </p>
          <p className="text-slate-400 text-sm">Chennai&apos;s Premium 3D Printing Studio</p>
          <p className="text-slate-600 text-xs mt-3">© 2026 Print3D. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg transition-colors whitespace-nowrap"
      style={{ transitionProperty: 'color' }}
    >
      {children}
    </Link>
  )
}
