'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, UserPlus } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)

    try {
      // Sadece auth kaydı yap, profile'ı AuthContext halletsin
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (authError) {
        if (authError.message.includes('User already registered')) {
          setError('Bu e-posta zaten kayıtlı. Lütfen giriş yapın.')
          setTimeout(() => router.push('/login'), 2000)
        } else {
          setError(`Kayıt hatası: ${authError.message}`)
        }
        setLoading(false)
        return
      }

      if (authData?.user) {
        setInfo('✅ Kayıt başarılı! Profiliniz otomatik oluşturulacak. Giriş sayfasına yönlendiriliyorsunuz...')
        setTimeout(() => router.push('/login'), 3000)
      }
    } catch (err: any) {
      setError(err.message || 'Beklenmeyen bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-wb-cream flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-lg w-full max-w-md border border-wb-olive/20">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-wb-olive/10 rounded-full flex items-center justify-center mb-3">
            <UserPlus className="text-wb-olive" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-wb-olive">Hesap Oluştur</h1>
          <p className="text-gray-600 text-sm mt-1">Topluluğumuza katılın</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}
          
          {info && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3">
              <p className="text-green-600 text-sm text-center">{info}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-wb-olive mb-2">Ad Soyad</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-wb-olive focus:border-transparent transition-all"
              placeholder="Adınız ve soyadınız"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-wb-olive mb-2">E-posta</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-wb-olive focus:border-transparent transition-all"
              placeholder="ornek@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-wb-olive mb-2">Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-wb-olive focus:border-transparent transition-all"
              placeholder="En az 6 karakter"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center bg-wb-olive text-white py-3 rounded-xl font-semibold hover:bg-wb-green transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={18} />
                Kayıt yapılıyor...
              </>
            ) : (
              'Hesap Oluştur'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Zaten hesabınız var mı?{' '}
            <a 
              href="/login" 
              className="text-wb-olive font-semibold hover:underline transition"
            >
              Giriş Yapın
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}