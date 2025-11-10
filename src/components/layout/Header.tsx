'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import {
  Gift,
  Heart,
  Users,
  ShoppingCart,
  MessageCircle,
  User,
  LogOut,
  Menu,
  X,
  Plus,
  Bell,
  Shield,
  Home,
  Info,
} from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type NavigationItem = {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  requiresAuth?: boolean
}

const navigation: NavigationItem[] = [
  { name: 'Ana Sayfa', href: '/', icon: Home },
  { name: 'Hakkımızda', href: '/about', icon: Info },
  { name: 'Hediyeleşme', href: '/gifts', icon: Gift },
  { name: 'Yardımlaşma', href: '/help', icon: Heart },
  { name: 'Satış', href: '/market', icon: ShoppingCart },
  { name: 'Mesajlar', href: '/messages', icon: MessageCircle, requiresAuth: true },
]

type Profile = {
  role?: 'user' | 'moderator' | 'admin'
  full_name?: string
}

export default function Header() {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [imgError, setImgError] = useState(false)

  const [unreadCount, setUnreadCount] = useState(0)
  const [convIds, setConvIds] = useState<string[]>([])
  const [role, setRole] = useState<'user' | 'moderator' | 'admin'>('user')
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    if (!user) {
      setRole('user')
      setProfile(null)
      return
    }

    ;(async () => {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .single()
      
      if (error) return
      if (profile?.role) setRole(profile.role as 'user' | 'moderator' | 'admin')
      setProfile(profile)
    })()
  }, [user])

  const panelLabel =
    role === 'admin'
      ? 'Admin Panel'
      : role === 'moderator'
      ? 'Yönetim Paneli'
      : 'Profilim'

  const panelHref =
    role === 'admin' || role === 'moderator'
      ? '/admin'
      : `/profile/${user?.id}`

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Kullanıcı'

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-wb-olive/20 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3 md:py-4">
        <Link href="/" className="flex items-center justify-center hover:opacity-90 transition-opacity">
          {!imgError ? (
            <Image
              src="/logo-wishofbridge.png"
              alt="Wish Of Bridge - Paylaşmanın Yeni Köprüsü"
              width={200}
              height={80}
              priority
              className="object-contain h-12 w-auto"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-wb-olive text-white font-bold">
                WB
              </div>
              <span className="text-wb-olive font-semibold text-lg hidden sm:block">
                Wish Of Bridge
              </span>
            </div>
          )}
        </Link>

        {/* NAV MENÜ */}
        <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
          {navigation.map((item) => {
            if (item.requiresAuth && !user) return null
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-2 text-slate-700 hover:text-wb-olive transition-colors duration-200 text-[15px] font-medium group relative"
              >
                <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* USER / AUTH MENÜ */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex items-center space-x-2 bg-wb-olive text-white px-4 py-2 rounded-xl hover:bg-wb-olive/90 transition-all duration-200 text-sm font-medium min-w-[120px] justify-center"
              >
                <User className="w-4 h-4" />
                <span className="max-w-[80px] truncate">{displayName}</span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-wb-olive/20 rounded-xl shadow-lg py-2 z-50">
                  <Link href={panelHref} className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-wb-olive/10 transition">
                    <Shield className="w-4 h-4" /> {panelLabel}
                  </Link>
                  <Link href="/create" className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-wb-olive/10 transition">
                    <Plus className="w-4 h-4" /> Yeni Gönderi
                  </Link>
                  <button
                    onClick={async () => {
                      await logout()
                      setMenuOpen(false)
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut className="w-4 h-4" /> Çıkış Yap
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-sm font-medium text-wb-olive hover:text-wb-olive/80 transition">
                Giriş Yap
              </Link>
              <Link
                href="/register"
                className="bg-wb-olive text-white px-4 py-2 rounded-xl hover:bg-wb-olive/90 transition text-sm font-medium"
              >
                Kayıt Ol
              </Link>
            </div>
          )}
        </div>

        {/* MOBİL MENÜ BUTONU */}
        <button
          onClick={() => setMobileOpen((prev) => !prev)}
          className="md:hidden p-2 text-wb-olive hover:bg-wb-olive/10 rounded-lg transition-colors"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
    </header>
  )
}
