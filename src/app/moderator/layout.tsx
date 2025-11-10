'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import {
  LayoutDashboard,
  Clock,
  Flag,
  Mail,
  Settings,
} from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ModeratorLayout({ children }: { children: React.ReactNode }) {
  const [moderator, setModerator] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser()
      const user = data?.user
      if (!user) {
        alert('Oturum bulunamadı.')
        window.location.href = '/'
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, email, role')
        .eq('id', user.id)
        .single()

      if (!profile || profile.role !== 'moderator') {
        alert('Yetkisiz erişim.')
        window.location.href = '/'
        return
      }

      setModerator(profile)
      setLoading(false)
    })()
  }, [])

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-wb-olive">
        <span className="animate-spin mr-2">⏳</span> Panel yükleniyor...
      </div>
    )

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 shadow-sm flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold text-wb-olive flex items-center gap-2">
            Moderatör Paneli
          </h2>
        </div>

        <nav className="flex-1 p-3 text-sm space-y-4 overflow-y-auto">
          <SidebarSection
            title="İçerik Yönetimi"
            items={[
              { href: '/moderator/pending', label: 'Bekleyen İlanlar', icon: Clock },
              { href: '/moderator/reported', label: 'Raporlanan İçerikler', icon: Flag },
            ]}
          />

          <SidebarSection
            title="Kullanıcı Talepleri"
            items={[
              { href: '/moderator/contact', label: 'İletişim Talepleri', icon: Mail },
            ]}
          />

          <SidebarSection
            title="Ayarlar"
            items={[
              { href: '/moderator/settings', label: 'Tema Tercihleri', icon: Settings },
            ]}
          />
        </nav>

        <div className="p-3 border-t text-xs text-gray-400">
          Giriş: {moderator.email}
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  )
}

function SidebarSection({ title, items }: any) {
  return (
    <div>
      <p className="text-gray-500 text-xs uppercase mb-1">{title}</p>
      <div className="space-y-1">
        {items.map((item: any) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-gray-700 hover:bg-wb-olive/10 hover:text-wb-olive transition"
            >
              <Icon size={15} />
              {item.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
