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
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      if (error.message.includes('User already registered')) {
        alert('Bu e-posta zaten kayıtlı. Giriş yapmayı deneyin.')
        router.push('/login')
      } else {
        setError(error.message)
      }
      setLoading(false)
      return
    }

    if (data?.user) {
      setInfo('✅ Kayıt başarılı! Lütfen e-postanızı doğrulayıp giriş yapın.')
      setTimeout(() => router.push('/login'), 2500)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-wb-cream flex items-center justify-center">
      <form
        onSubmit={handleRegister}
        className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-lg w-full max-w-md space-y-5"
      >
        <h1 className="text-2xl font-bold text-center text-wb-olive flex justify-center items-center gap-2">
          <UserPlus size={22} /> Hesap Oluştur
        </h1>

        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        {info && <p className="text-green-600 text-sm text-center">{info}</p>}

        <div>
          <label className="block text-sm font-semibold text-wb-olive mb-1">Ad Soyad</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-wb-olive focus:border-wb-olive"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-wb-olive mb-1">E-posta</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-wb-olive focus:border-wb-olive"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-wb-olive mb-1">Şifre</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-wb-olive focus:border-wb-olive"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center bg-wb-olive text-white py-3 rounded-xl font-semibold hover:bg-wb-green transition"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2" /> Kayıt yapılıyor...
            </>
          ) : (
            'Kayıt Ol'
          )}
        </button>

        <p className="text-center text-sm text-slate-600">
          Zaten hesabın var mı?{' '}
          <a href="/login" className="text-wb-olive font-semibold hover:underline">
            Giriş Yap
          </a>
        </p>
      </form>
    </div>
  )
}
