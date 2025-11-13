'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

/**
 * ModeratorGuard
 * — yalnızca moderator veya admin kullanıcılarının erişmesine izin verir.
 * — yetkisiz kullanıcıyı /login sayfasına yönlendirir.
 */

export default function ModeratorGuard({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, role, loading } = useAuth()
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
      } else if (role !== 'moderator' && role !== 'admin') {
        router.push('/')
      } else {
        setChecked(true)
      }
    }
  }, [user, role, loading, router])

  if (loading || !checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-wb-cream">
        <div className="text-center text-wb-olive">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-wb-olive mx-auto mb-3"></div>
          <p>Yetki kontrolü yapılıyor...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
