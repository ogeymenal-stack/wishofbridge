'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function ModeratorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { logout } = useAuth()

  const navItems = [
    { href: '/moderator', label: 'Panel Ana Sayfa' },
    { href: '/moderator/pending', label: 'Onay Bekleyenler' },
    { href: '/moderator/reported', label: 'Raporlananlar' },
    { href: '/moderator/contact', label: 'İletişim Talepleri' },
    { href: '/moderator/settings', label: 'Tema / Ayarlar' },
  ]

  return (
    <div className="min-h-screen bg-wb-cream/40">
      <div className="flex flex-col md:flex-row">
        {/* Sol Menü */}
        <aside className="w-full md:w-64 bg-white/80 backdrop-blur border-r border-wb-olive/20 shadow-sm p-4">
          <h2 className="text-lg font-semibold text-wb-olive mb-4">🎛️ Moderatör Paneli</h2>
          <nav className="space-y-2">
            {navItems.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`block px-3 py-2 rounded-lg transition ${
                  pathname === n.href
                    ? 'bg-wb-olive text-white'
                    : 'hover:bg-wb-olive/10 text-slate-700'
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <button
            onClick={logout}
            className="mt-6 w-full text-left bg-red-500/90 hover:bg-red-500 text-white px-3 py-2 rounded-lg transition"
          >
            Çıkış Yap
          </button>
        </aside>

        {/* İçerik */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
