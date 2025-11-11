'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Role = 'user' | 'moderator' | 'admin'

type Profile = {
  id: string
  email: string | null
  first_name: string | null
  last_name: string | null
  full_name: string | null
  role: Role
  profile_photo?: string | null
  username?: string | null
  join_date?: string | null
  phone?: string | null
  date_of_birth?: string | null
  gender?: string | null
  registration_completed?: boolean
  status?: string
}

type Ctx = {
  user: any | null
  profile: Profile | null
  role: Role
  loading: boolean
  refreshProfile: () => Promise<void>
  logout: () => Promise<void>
  isAdmin: boolean
  isModerator: boolean
  hasAccess: (requiredRole: Role) => boolean
}

const AuthContext = createContext<Ctx | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const role: Role = (profile?.role as Role) || 'user'
  const isAdmin = role === 'admin'
  const isModerator = role === 'moderator'
  
  const hasAccess = (requiredRole: Role) => {
    return role === requiredRole
  }

  const fetchProfileWithRetry = async (
    uid: string,
    userEmail: string | undefined,
    attempts = 3
  ): Promise<void> => {
    console.log(`🔄 Profil getiriliyor (attempts left: ${attempts})`)

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, full_name, role, profile_photo, username, join_date, phone, date_of_birth, gender, registration_completed, status')
        .eq('id', uid)
        .maybeSingle()

      if (error) {
        console.error('❌ Profil sorgusu hatası:', error)
        return
      }

      if (data) {
        console.log('✅ Profil bulundu:', data.email)
        setProfile({
          id: data.id,
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          full_name: data.full_name,
          role: (data.role || 'user') as Role,
          profile_photo: data.profile_photo,
          username: data.username,
          join_date: data.join_date,
          phone: data.phone,
          date_of_birth: data.date_of_birth,
          gender: data.gender,
          registration_completed: data.registration_completed,
          status: data.status
        })
        return
      }

      if (attempts > 0) {
        console.log('⏳ Profil bulunamadı, yeniden deneniyor...')
        await new Promise((r) => setTimeout(r, 800))
        return fetchProfileWithRetry(uid, userEmail, attempts - 1)
      }

      // Profil yoksa otomatik oluştur
      console.log('🆕 Profil oluşturuluyor...')
      const newProfile = {
        id: uid,
        email: userEmail || null,
        first_name: userEmail?.split('@')[0] || 'Kullanıcı',
        last_name: '',
        full_name: userEmail?.split('@')[0] || 'Kullanıcı',
        role: 'user',
        join_date: new Date().toISOString(),
        registration_completed: false,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { error: insertError } = await supabase.from('profiles').insert(newProfile)
      if (insertError) {
        console.error('Profil oluşturma hatası:', insertError)
      } else {
        // Oluşturulan profili tekrar getir
        await new Promise((r) => setTimeout(r, 500))
        const { data: finalData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', uid)
          .single()

        if (finalData) {
          setProfile({
            id: finalData.id,
            email: finalData.email,
            first_name: finalData.first_name,
            last_name: finalData.last_name,
            full_name: finalData.full_name,
            role: (finalData.role || 'user') as Role,
            profile_photo: finalData.profile_photo,
            username: finalData.username,
            join_date: finalData.join_date,
            phone: finalData.phone,
            date_of_birth: finalData.date_of_birth,
            gender: finalData.gender,
            registration_completed: finalData.registration_completed,
            status: finalData.status
          })
        }
      }
    } catch (err: any) {
      console.error('💥 fetchProfileWithRetry hatası:', err)
    }
  }

  const refreshProfile = async () => {
    if (user?.id) await fetchProfileWithRetry(user.id, user.email)
  }

  const logout = async () => {
    try {
      console.log('🔐 Çıkış yapılıyor...')
      
      // 1. Önce Supabase'den çıkış yap
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('❌ Çıkış hatası:', error)
        throw error
      }
      
      // 2. Local state'i temizle
      setUser(null)
      setProfile(null)
      
      console.log('✅ Çıkış başarılı, sayfa yenileniyor...')
      
      // 3. Sayfayı ana sayfaya yönlendir ve yenile
      window.location.href = '/'
      
    } catch (err: any) {
      console.error('💥 Çıkış işlemi başarısız:', err)
      // Hata olsa bile local state'i temizle ve sayfayı yenile
      setUser(null)
      setProfile(null)
      window.location.href = '/'
    }
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        const { data } = await supabase.auth.getUser()
        const u = data?.user || null
        setUser(u)

        if (u?.id) {
          await fetchProfileWithRetry(u.id, u.email)
        }
      } catch (err) {
        console.error('Auth init hatası:', err)
      } finally {
        setLoading(false)
      }
    }

    init()

    const { data: authSub } = supabase.auth.onAuthStateChange(async (_e, session) => {
      const u = session?.user || null
      setUser(u)
      if (u?.id) {
        await fetchProfileWithRetry(u.id, u.email)
      } else {
        setProfile(null)
      }
    })

    return () => {
      authSub?.subscription?.unsubscribe()
    }
  }, [])

  const contextValue: Ctx = {
    user,
    profile,
    role,
    loading,
    refreshProfile,
    logout,
    isAdmin,
    isModerator,
    hasAccess
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}