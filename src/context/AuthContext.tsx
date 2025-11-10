'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Role = 'user' | 'moderator' | 'admin'

type Profile = {
  id: string
  email: string | null
  full_name: string | null
  role: Role
  profile_photo?: string | null
  username?: string | null
  join_date?: string | null
}

type Ctx = {
  user: any | null
  profile: Profile | null
  role: Role
  loading: boolean
  refreshProfile: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<Ctx | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const role: Role = (profile?.role as Role) || 'user'

  // Profil getir - basitleştirilmiş versiyon
  const fetchProfileWithRetry = async (uid: string, userEmail: string | undefined, attempts = 3, waitMs = 1000): Promise<void> => {
    console.log(`🔄 Profil getiriliyor: ${uid}, deneme: ${4 - attempts}`)
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, profile_photo, username, join_date')
        .eq('id', uid)
        .maybeSingle()

      if (error) {
        console.error('❌ Profile fetch error:', error)
        throw error
      }

      if (!data) {
        if (attempts > 0) {
          console.log(`⏳ Profil henüz oluşmamış, ${waitMs}ms bekleniyor...`)
          await new Promise((r) => setTimeout(r, waitMs))
          return fetchProfileWithRetry(uid, userEmail, attempts - 1, waitMs)
        } else {
          console.log('🆕 Profil otomatik oluşturuluyor...')
          // ÇOK BASİT PROFİL OLUŞTURMA
          const profileData = {
            id: uid,
            email: userEmail || null,
            full_name: userEmail?.split('@')[0] || 'Kullanıcı',
            role: 'user',
            join_date: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }

          const { error: insertError } = await supabase
            .from('profiles')
            .insert(profileData)

          if (insertError) {
            console.error('❌ Profil oluşturma hatası:', insertError)
            // Hata olsa bile devam et
            return
          }

          console.log('✅ Profil oluşturuldu, sonuç bekleniyor...')
          // Oluşturduktan sonra son bir deneme
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
              full_name: finalData.full_name,
              role: (finalData.role || 'user') as Role,
              profile_photo: finalData.profile_photo,
              username: finalData.username,
              join_date: finalData.join_date,
            })
          }
          return
        }
      }

      console.log('✅ Profil başarıyla getirildi:', data)
      setProfile({
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        role: (data.role || 'user') as Role,
        profile_photo: data.profile_photo,
        username: data.username,
        join_date: data.join_date,
      })
    } catch (err: any) {
      console.error('💥 fetchProfileWithRetry hatası:', err)
      // Hata durumunda sessizce devam et
    }
  }

  const refreshProfile = async () => {
    if (user?.id) await fetchProfileWithRetry(user.id, user.email)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
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

  return (
    <AuthContext.Provider value={{ user, profile, role, loading, refreshProfile, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}