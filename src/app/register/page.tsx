'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, UserPlus, Eye, EyeOff, Calendar, Phone } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    acceptTerms: false,
    marketingEmails: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [step, setStep] = useState(1)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const validateStep1 = () => {
    if (!formData.firstName.trim()) {
      setError('Ad alanı zorunludur')
      return false
    }
    if (!formData.lastName.trim()) {
      setError('Soyad alanı zorunludur')
      return false
    }
    if (!formData.email.trim()) {
      setError('E-posta alanı zorunludur')
      return false
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Geçerli bir e-posta adresi girin')
      return false
    }
    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor')
      return false
    }
    return true
  }

  const handleNextStep = () => {
    setError('')
    if (validateStep1()) {
      setStep(2)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault()
  setError('')
  setInfo('')
  setLoading(true)

  try {
    console.log('🔄 1. Auth kaydı başlıyor...')

    // 1. Sadece auth kaydı yap
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    })

    console.log('🔄 2. Auth sonucu:', { 
      user: authData?.user?.id, 
      error: authError?.message 
    })

    if (authError) {
      if (authError.message.includes('User already registered')) {
        setError('Bu e-posta zaten kayıtlı. Lütfen giriş yapın.')
      } else {
        setError(`Kayıt hatası: ${authError.message}`)
      }
      setLoading(false)
      return
    }

    if (authData?.user) {
      console.log('✅ 3. Auth başarılı, profil güncelleniyor...')
      
      // 2. INSERT yerine UPDATE kullan
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          full_name: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone || null,
          date_of_birth: formData.dateOfBirth || null,
          gender: formData.gender || null,
          terms_accepted: formData.acceptTerms,
          marketing_emails: formData.marketingEmails,
          registration_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', authData.user.id)

      console.log('🔄 4. UPDATE sonucu:', { error: updateError })

      if (updateError) {
        console.error('❌ UPDATE başarısız:', updateError)
        setInfo('✅ Hesabınız oluşturuldu ancak profil bilgileri kaydedilemedi. Giriş yaparak profilinizi tamamlayabilirsiniz.')
      } else {
        console.log('✅ 5. Profil başarıyla güncellendi')
        setInfo('✅ Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...')
      }

      setTimeout(() => router.push('/login'), 3000)
    }
  } catch (err: any) {
    console.error('💥 Beklenmeyen hata:', err)
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
          
          {/* Step indicator */}
          <div className="flex justify-center mt-4 mb-2">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= 1 ? 'bg-wb-olive text-white' : 'bg-gray-200 text-gray-500'
              }`}>1</div>
              <div className={`w-12 h-1 mx-1 ${
                step >= 2 ? 'bg-wb-olive' : 'bg-gray-200'
              }`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= 2 ? 'bg-wb-olive text-white' : 'bg-gray-200 text-gray-500'
              }`}>2</div>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            {step === 1 ? 'Temel Bilgiler' : 'Ek Bilgiler'}
          </p>
        </div>

        <form onSubmit={handleRegister}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}
          
          {info && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
              <p className="text-green-600 text-sm text-center">{info}</p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-wb-olive mb-2">Ad *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-wb-olive focus:border-transparent transition-all"
                    placeholder="Adınız"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-wb-olive mb-2">Soyad *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-wb-olive focus:border-transparent transition-all"
                    placeholder="Soyadınız"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-wb-olive mb-2">E-posta *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-wb-olive focus:border-transparent transition-all"
                  placeholder="ornek@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-wb-olive mb-2">Şifre *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-wb-olive focus:border-transparent transition-all pr-10"
                    placeholder="En az 6 karakter"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-wb-olive transition"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-wb-olive mb-2">Şifre Tekrar *</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-wb-olive focus:border-transparent transition-all pr-10"
                    placeholder="Şifrenizi tekrar girin"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-wb-olive transition"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNextStep}
                className="w-full bg-wb-olive text-white py-3 rounded-xl font-semibold hover:bg-wb-green transition"
              >
                Devam Et
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-wb-olive mb-2">
                  <Phone className="inline w-4 h-4 mr-1" />
                  Telefon (Opsiyonel)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-wb-olive focus:border-transparent transition-all"
                  placeholder="+90 5XX XXX XX XX"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-wb-olive mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Doğum Tarihi (Opsiyonel)
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-wb-olive focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-wb-olive mb-2">Cinsiyet (Opsiyonel)</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-wb-olive focus:border-transparent transition-all"
                >
                  <option value="">Seçiniz</option>
                  <option value="male">Erkek</option>
                  <option value="female">Kadın</option>
                  <option value="other">Diğer</option>
                  <option value="prefer_not_to_say">Belirtmek İstemiyorum</option>
                </select>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleInputChange}
                    className="mt-1 rounded border-gray-300 text-wb-olive focus:ring-wb-olive"
                    required
                  />
                  <span className="text-sm text-gray-700">
                    <a href="/terms" className="text-wb-olive hover:underline font-semibold">
                      Hizmet Şartları
                    </a>'nı ve{' '}
                    <a href="/privacy" className="text-wb-olive hover:underline font-semibold">
                      Gizlilik Politikası
                    </a>'nı okudum ve kabul ediyorum *
                  </span>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="marketingEmails"
                    checked={formData.marketingEmails}
                    onChange={handleInputChange}
                    className="mt-1 rounded border-gray-300 text-wb-olive focus:ring-wb-olive"
                  />
                  <span className="text-sm text-gray-700">
                    Kampanyalar ve yenilikler hakkında e-posta almak istiyorum
                  </span>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 border border-wb-olive text-wb-olive py-3 rounded-xl font-semibold hover:bg-wb-olive/10 transition"
                >
                  Geri
                </button>
                <button
                  type="submit"
                  disabled={loading || !formData.acceptTerms}
                  className="flex-1 flex items-center justify-center bg-wb-olive text-white py-3 rounded-xl font-semibold hover:bg-wb-green transition disabled:opacity-50 disabled:cursor-not-allowed"
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
              </div>
            </div>
          )}
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