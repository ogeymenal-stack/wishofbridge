'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import {
  Gift,
  Heart,
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

export default function Header() {
  const { user, profile, role, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [imgError, setImgError] = useState(false)

  // Mesaj sayacı (backend kurulduğunda bağlarız – şimdilik 0 tutalım)
  const [unreadCount] = useState(0)

  // Rol bazlı panel metni & linki
  const panelLabel =
    role === 'admin' ? 'Admin Panel' : role === 'moderator' ? 'Yönetim Paneli' : 'Profilim'

  const panelHref =
    role === 'admin' || role === 'moderator' ? '/admin' : user ? `/profile/${user.id}` : '/login'

  const displayName =
    profile?.full_name ||
    user?.email?.split('@')[0] ||
    'Kullanıcı'

  // Menü kapatma (route değişimlerinde veya logo tıklanınca)
  useEffect(() => {
    const close = () => {
      setMenuOpen(false)
      setMobileOpen(false)
    }
    window.addEventListener('hashchange', close)
    return () => window.removeEventListener('hashchange', close)
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-wb-olive/20 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3 md:py-4">
        {/* LOGO */}
        <Link
          href="/"
          className="flex items-center justify-center hover:opacity-90 transition-opacity"
          onClick={() => {
            setMenuOpen(false)
            setMobileOpen(false)
          }}
        >
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

        {/* MASAÜSTÜ MENÜ */}
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
                {item.name === 'Mesajlar' && unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-medium">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* KULLANICI MENÜSÜ */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((p) => !p)}
                className="flex items-center space-x-2 bg-wb-olive text-white px-4 py-2 rounded-xl hover:bg-wb-olive/90 transition-all duration-200 text-sm font-medium min-w-[120px] justify-center"
              >
                <User className="w-4 h-4" />
                <span className="max-w-[80px] truncate">{displayName}</span>
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-wb-olive/20 rounded-xl shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b border-wb-olive/10">
                      <p className="text-sm font-medium text-wb-olive truncate">{displayName}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>

                    <Link
                      href={panelHref}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-wb-olive/10 transition-colors"
                    >
                      <Shield className="w-4 h-4" />
                      {panelLabel}
                    </Link>

                    <Link
                      href="/create"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-wb-olive/10 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Yeni Gönderi
                    </Link>

                    <div className="border-t border-wb-olive/10 mt-1 pt-1">
                      <button
                        onClick={async () => {
                          await logout()
                          setMenuOpen(false)
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Çıkış Yap
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-sm font-medium text-wb-olive hover:text-wb-olive/80 transition-colors"
              >
                Giriş Yap
              </Link>
              <Link
                href="/register"
                className="bg-wb-olive text-white px-4 py-2 rounded-xl hover:bg-wb-olive/90 transition-colors text-sm font-medium"
              >
                Kayıt Ol
              </Link>
            </div>
          )}
        </div>

        {/* MOBİL MENÜ BUTONU */}
        <button
          onClick={() => setMobileOpen((p) => !p)}
          className="md:hidden p-2 text-wb-olive hover:bg-wb-olive/10 rounded-lg transition-colors"
          aria-label={mobileOpen ? 'Menüyü kapat' : 'Menüyü aç'}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* MOBİL MENÜ */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-wb-olive/10 shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <nav className="space-y-2 mb-4">
              {navigation.map((item) => {
                if (item.requiresAuth && !user) return null
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between px-3 py-3 text-slate-700 hover:bg-wb-olive/10 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    {item.name === 'Mesajlar' && unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>

            {user ? (
              <div className="border-t border-wb-olive/10 pt-4 space-y-3">
                <div className="px-3">
                  <p className="text-sm font-medium text-wb-olive">{displayName}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>

                <Link
                  href={panelHref}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-wb-olive/10 rounded-lg transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  {panelLabel}
                </Link>

                <Link
                  href="/create"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-wb-olive/10 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Yeni Gönderi
                </Link>

                <button
                  onClick={async () => {
                    await logout()
                    setMobileOpen(false)
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Çıkış Yap
                </button>
              </div>
            ) : (
              <div className="border-t border-wb-olive/10 pt-4 space-y-2">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center bg-wb-olive text-white py-3 rounded-xl hover:bg-wb-olive/90 transition-colors font-medium"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center border border-wb-olive text-wb-olive py-3 rounded-xl hover:bg-wb-olive/10 transition-colors font-medium"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
