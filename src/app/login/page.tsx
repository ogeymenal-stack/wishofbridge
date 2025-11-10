'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, LogIn, Mail } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('E-posta veya şifre hatalı. Lütfen tekrar deneyin.')
        } else if (error.message.includes('Email not confirmed')) {
          setError('E-posta adresiniz doğrulanmamış. Lütfen e-postanızı kontrol edin.')
        } else {
          setError(`Giriş hatası: ${error.message}`)
        }
        setLoading(false)
        return
      }

      if (data?.user) {
        setInfo('✅ Giriş başarılı! Yönlendiriliyorsunuz...')
        setTimeout(() => router.push('/'), 1500)
      }
    } catch (err: any) {
      setError(err.message || 'Beklenmeyen bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    setError('')
    setInfo('')
    
    if (!email) {
      setError('Lütfen önce e-posta adresinizi girin.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    setLoading(false)
    
    if (error) {
      setError(`Şifre sıfırlama hatası: ${error.message}`)
    } else {
      setInfo('📩 Şifre sıfırlama bağlantısı e-postanıza gönderildi. Lütfen e-postanızı kontrol edin.')
    }
  }

  return (
    <div className="min-h-screen bg-wb-cream flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-lg w-full max-w-md border border-wb-olive/20">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-wb-olive/10 rounded-full flex items-center justify-center mb-3">
            <LogIn className="text-wb-olive" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-wb-olive">Giriş Yap</h1>
          <p className="text-gray-600 text-sm mt-1">Hesabınıza erişin</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
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
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-wb-olive focus:border-transparent transition-all"
              placeholder="Şifrenizi girin"
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
                Giriş yapılıyor...
              </>
            ) : (
              <>
                <LogIn className="mr-2" size={18} />
                Giriş Yap
              </>
            )}
          </button>
        </form>

        <div className="mt-6 space-y-3 text-center">
          <button
            onClick={handleResetPassword}
            disabled={loading}
            className="w-full flex items-center justify-center text-wb-olive border border-wb-olive/30 py-2 rounded-xl font-medium hover:bg-wb-olive/5 transition disabled:opacity-50"
          >
            <Mail className="mr-2" size={16} />
            Şifremi Unuttum
          </button>

          <p className="text-sm text-gray-600">
            Hesabınız yok mu?{' '}
            <a 
              href="/register" 
              className="text-wb-olive font-semibold hover:underline transition"
            >
              Kayıt Olun
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}