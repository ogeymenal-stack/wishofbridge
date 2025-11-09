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

  // 🔹 Kullanıcı rolünü al
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
      
      if (error) {
        console.error('Profile fetch error:', error)
        return
      }
      
      if (profile?.role) {
        setRole(profile.role as 'user' | 'moderator' | 'admin')
      }
      setProfile(profile)
    })()
  }, [user])

  // 🔔 Okunmamış mesaj sayısı
  useEffect(() => {
    if (!user) {
      setUnreadCount(0)
      setConvIds([])
      return
    }

    let mounted = true

    const fetchUnreadMessages = async () => {
      try {
        const { data: convs, error } = await supabase
          .from('conversations')
          .select('id, user1, user2')
          .or(`user1.eq.${user.id},user2.eq.${user.id}`)

        if (error) {
          console.error('Conversations error:', error)
          return
        }

        const ids = (convs || []).map((c: any) => c.id)
        if (!mounted) return
        setConvIds(ids)

        if (ids.length > 0) {
          const { data: unreadRows, error: unreadError } = await supabase
            .from('messages')
            .select('id')
            .in('conversation_id', ids)
            .eq('is_read', false)
            .neq('sender_id', user.id)

          if (unreadError) {
            console.error('Unread messages error:', unreadError)
            return
          }

          if (!mounted) return
          setUnreadCount(unreadRows?.length || 0)
        }
      } catch (error) {
        console.error('Fetch unread messages error:', error)
      }
    }

    fetchUnreadMessages()

    // Real-time subscription
    const channel = supabase
      .channel('header-unread')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `sender_id=neq.${user.id}`
        },
        (payload) => {
          const msg = payload.new as any
          if (convIds.includes(msg.conversation_id)) {
            setUnreadCount((n) => n + 1)
          }
        }
      )
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'messages',
          filter: `is_read=eq.true`
        },
        (payload) => {
          const newRow = payload.new as any
          if (convIds.includes(newRow.conversation_id) && newRow.sender_id !== user.id) {
            setUnreadCount((n) => Math.max(0, n - 1))
          }
        }
      )
      .subscribe()

    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [user, convIds.join('|')])

  // 🔹 Rol bazlı panel bağlantısı
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

  // Kullanıcı adı veya email gösterimi
  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Kullanıcı'

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
          {user && (
            <Link 
              href="/messages" 
              className="relative p-2 hover:bg-wb-olive/10 rounded-lg transition-colors group"
              title="Mesajlar"
            >
              <Bell className="w-5 h-5 text-wb-olive" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-medium">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          )}

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
                <>
                  {/* Overlay */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setMenuOpen(false)}
                  />
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-wb-olive/20 rounded-xl shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b border-wb-olive/10">
                      <p className="text-sm font-medium text-wb-olive truncate">
                        {displayName}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {user.email}
                      </p>
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
                href="/login" 
                className="bg-wb-olive text-white px-4 py-2 rounded-xl hover:bg-wb-olive/90 transition-colors text-sm font-medium"
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
          aria-label={mobileOpen ? "Menüyü kapat" : "Menüyü aç"}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* MOBİL MENÜ */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-wb-olive/10 shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-4">
            {/* Navigasyon */}
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

            {/* Kullanıcı Bilgisi */}
            {user ? (
              <div className="border-t border-wb-olive/10 pt-4 space-y-3">
                <div className="px-3">
                  <p className="text-sm font-medium text-wb-olive">{displayName}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
                
                <Link
                  href="/messages"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between px-3 py-2 text-slate-700 hover:bg-wb-olive/10 rounded-lg transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Mesajlar
                  </span>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                
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
                  Giriş Yap / Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}