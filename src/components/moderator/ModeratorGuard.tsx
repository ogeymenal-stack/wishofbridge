'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ModeratorGuard({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) router.push('/login')
      else if (role !== 'moderator') router.push('/')
    }
  }, [user, role, loading, router])

  if (loading) return <p className="text-center py-10 text-slate-500">Yükleniyor...</p>
  if (!user || role !== 'moderator') return null

  return <>{children}</>
}
