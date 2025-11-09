'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import {
  LayoutDashboard,
  Flag,
  Clock,
  Mail,
  Palette,
  LogOut,
} from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ModeratorLayout({ children }: { children: React.ReactNode }) {
  const [moderator, setModerator] = useState<any>(null)

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.auth.getUser()
      const user = data?.user
      if (!user) {
        window.location.href = '/'
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, email, role')
        .eq('id', user.id)
        .single()

      if (!profile || profile.role !== 'moderator') {
        alert('Bu sayfa sadece moderatörler içindir.')
        window.location.href = '/'
        return
      }

      setModerator(profile)
    })()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r shadow-sm flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold text-wb-olive flex items-center gap-2">
            🛡️ Moderator Paneli
          </h2>
        </div>

        <nav className="flex-1 p-3 text-sm space-y-3">
          <SidebarLink href="/moderator" icon={LayoutDashboard} label="Genel Bakış" />
          <SidebarLink href="/moderator/pending" icon={Clock} label="Bekleyen İçerikler" />
          <SidebarLink href="/moderator/reported" icon={Flag} label="Raporlananlar" />
          <SidebarLink href="/moderator/contact" icon={Mail} label="İletişim Talepleri" />
          <SidebarLink href="/moderator/settings" icon={Palette} label="Tema Ayarları" />
        </nav>

        <div className="border-t p-3 text-xs text-gray-500">
          {moderator?.email}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 mt-2 text-red-600 hover:text-red-800"
          >
            <LogOut size={14} /> Çıkış Yap
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  )
}

function SidebarLink({ href, icon: Icon, label }: any) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-wb-olive/10 hover:text-wb-olive transition"
    >
      <Icon size={15} />
      {label}
    </Link>
  )
}
