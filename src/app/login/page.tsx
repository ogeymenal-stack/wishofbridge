'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function AuthPage() {
  const router = useRouter()

  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setInfo(null)

    if (mode === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      setLoading(false)

      if (error) return setError(error.message)
      if (data?.user) router.push('/create')
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      setLoading(false)
      if (error) return setError(error.message)
      if (data?.user) setInfo('✅ Kayıt başarılı! E-postanızı doğrulayıp giriş yapabilirsiniz.')
    }
  }

  const handleResetPassword = async () => {
    setError(null)
    setInfo(null)
    if (!email) return setError('Lütfen önce e-posta adresinizi girin.')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    })
    if (error) setError(error.message)
    else setInfo('📩 Şifre sıfırlama bağlantısı e-postanıza gönderildi.')
  }

  return (
    <section className="max-w-md mx-auto pastel-card p-6 mt-10">
      <h1 className="text-2xl font-semibold text-slate-800 mb-4 text-center">
        {mode === 'login' ? '🔐 Giriş Yap' : '📝 Kayıt Ol'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700">E-posta</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-wb-olive/40 bg-white/70 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-wb-olive/50"
            placeholder="ornek@mail.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700">Şifre</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-wb-olive/40 bg-white/70 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-wb-olive/50"
            placeholder="••••••••"
            required
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {info && <p className="text-green-600 text-sm">{info}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-wb-olive text-white hover:bg-wb-olive/90 rounded-xl px-5 py-2 transition disabled:opacity-60"
        >
          {loading
            ? mode === 'login'
              ? 'Giriş yapılıyor...'
              : 'Kayıt oluşturuluyor...'
            : mode === 'login'
            ? 'Giriş Yap'
            : 'Kayıt Ol'}
        </button>
      </form>

      <div className="mt-5 text-center space-y-2">
        <button
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          className="text-sm text-wb-olive hover:underline"
        >
          {mode === 'login'
            ? 'Hesabınız yok mu? Kayıt olun.'
            : 'Zaten hesabınız var mı? Giriş yapın.'}
        </button>

        <div>
          <button
            onClick={handleResetPassword}
            className="text-xs text-slate-500 hover:text-slate-700 underline"
          >
            Şifremi unuttum
          </button>
        </div>
      </div>
    </section>
  )
}
