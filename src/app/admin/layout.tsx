'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import {
  LayoutDashboard,
  Users,
  Layers,
  CreditCard,
  PieChart,
  Settings,
  Bell,
  Database,
  Flag,
  Shield,
  Clock,
  Package,
  DollarSign,
  BarChart2,
  TrendingUp,
  Activity,
  Mail,
  Instagram,
  Facebook,
  Twitter,
  Music2,
  Youtube,
  Linkedin,
} from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const socialIcons: Record<string, any> = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  tiktok: Music2,
  youtube: Youtube,
  linkedin: Linkedin,
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [socialLinks, setSocialLinks] = useState<{ key: string; value: string }[]>([])

  useEffect(() => {
    ;(async () => {
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

      if (!profile || (profile.role !== 'admin' && profile.role !== 'moderator')) {
        alert('Yetkisiz erişim.')
        window.location.href = '/'
        return
      }

      setAdmin(profile)
      await loadSocialLinks()
      setLoading(false)
    })()
  }, [])

  const loadSocialLinks = async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('key, value')
      .eq('is_active', true)
      .in('key', ['facebook', 'instagram', 'twitter', 'tiktok', 'youtube', 'linkedin'])
    if (data) setSocialLinks(data)
  }

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-wb-olive">
        <span className="animate-spin mr-2">⏳</span> Panel yükleniyor...
      </div>
    )

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 🧭 Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 shadow-sm flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold text-wb-olive flex items-center gap-2">
            <LayoutDashboard size={18} />
            {admin.role === 'moderator' ? 'Yönetim Paneli' : 'Admin Panel'}
          </h2>
        </div>

        <nav className="flex-1 p-3 text-sm space-y-4 overflow-y-auto">
          <SidebarSection
            title="Dashboard"
            items={[
              { href: '/admin', label: 'Genel Bakış', icon: BarChart2 },
              { href: '/admin/analytics', label: 'Analitik', icon: TrendingUp },
            ]}
          />

          <SidebarSection
            title="Kullanıcı Yönetimi"
            items={[
              { href: '/admin/users', label: 'Tüm Kullanıcılar', icon: Users },
              { href: '/admin/verifications', label: 'Doğrulamalar', icon: Shield },
            ]}
          />

          <SidebarSection
            title="İçerik Yönetimi"
            items={[
              { href: '/admin/listings', label: 'Tüm İlanlar', icon: Package },
              { href: '/admin/pending', label: 'Bekleyen İlanlar', icon: Clock },
              { href: '/admin/reported', label: 'Raporlanan İçerik', icon: Flag },
              { href: '/admin/categories', label: 'Kategoriler', icon: Layers },
            ]}
          />

          <SidebarSection
            title="Finansal İşlemler"
            items={[
              { href: '/admin/transactions', label: 'İşlemler', icon: CreditCard },
              { href: '/admin/payouts', label: 'Ödemeler', icon: DollarSign },
              { href: '/admin/commissions', label: 'Komisyonlar', icon: PieChart },
            ]}
          />

          <SidebarSection
            title="Sistem"
            items={[
              { href: '/admin/settings/social', label: 'Sosyal Medya', icon: Settings },
              { href: '/admin/notifications', label: 'Bildirimler', icon: Bell },
              { href: '/admin/logs', label: 'Loglar', icon: Activity },
              { href: '/admin/contact', label: 'İletişim Talepleri', icon: Mail },
              { href: '/admin/backup', label: 'Yedekleme', icon: Database },
            ]}
          />
        </nav>

        {/* 🔗 Dinamik Sosyal Medya */}
        <div className="border-t p-3">
          <p className="text-xs text-gray-400 mb-2">Sosyal Medya</p>
          <div className="flex flex-wrap gap-2">
            {socialLinks.map((link) => {
              const Icon = socialIcons[link.key] || Settings
              return (
                <a
                  key={link.key}
                  href={link.value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 bg-wb-olive/10 text-wb-olive rounded-full hover:bg-wb-olive/20 transition"
                  title={link.key}
                >
                  <Icon size={14} />
                </a>
              )
            })}
            {socialLinks.length === 0 && (
              <p className="text-xs text-gray-400 italic">Aktif bağlantı yok</p>
            )}
          </div>
        </div>

        {/* 🧾 Kullanıcı Bilgisi */}
        <div className="p-3 border-t text-xs text-gray-400">
          Giriş: {admin.email}
        </div>
      </aside>

      {/* 📄 Sayfa İçeriği */}
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  )
}

/* 🔸 Sidebar Bölüm Bileşeni */
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
