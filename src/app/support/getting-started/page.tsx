'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { CheckCircle, User, Mail, Key, Gift, HeartHandshake, ShoppingCart, ArrowRight, LogIn, UserPlus } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function GettingStartedPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [])

  const steps = [
    {
      step: 1,
      icon: User,
      title: "Hesap Oluşturma",
      description: "Wish Of Bridge'e katılarak topluluğumuza dahil olun",
      details: [
        "Ana sayfadan 'Giriş Yap' butonuna tıklayın",
        "E-posta adresiniz ve güçlü bir şifre ile kayıt olun",
        "E-posta doğrulama linkini kontrol edin (gerekirse spam klasörüne bakın)",
        "Doğrulama sonrası giriş yapabilirsiniz"
      ],
      tips: ["Şifrenizi güvenli bir yerde saklayın", "Gerçek e-posta adresinizi kullanın"]
    },
    {
      step: 2,
      icon: CheckCircle,
      title: "Profilinizi Tamamlayın",
      description: "Güvenilir bir profil oluşturarak toplulukta yerinizi alın",
      details: [
        "Profil fotoğrafı ekleyin",
        "Konum bilginizi paylaşın",
        "Hakkımda bölümünü doldurun",
        "İletişim bilgilerinizi güncelleyin"
      ],
      tips: ["Eksiksiz profiller daha güvenilir görünür", "Doğru bilgiler paylaşımı kolaylaştırır"]
    },
    {
      step: 3,
      icon: Gift,
      title: "İlk İlanınızı Oluşturun",
      description: "Hediye, yardım veya satış ilanı oluşturarak paylaşıma başlayın",
      details: [
        "Üst menüden 'Oluştur' butonuna tıklayın",
        "Paylaşım türünü seçin (Hediye/Yardım/Satış)",
        "Açıklayıcı başlık ve detaylı açıklama yazın",
        "Gerekli bilgileri doldurup paylaşın"
      ],
      tips: ["Net ve anlaşılır başlıklar kullanın", "Gerçekçi beklentiler oluşturun"]
    }
  ]

  const platformTypes = [
    {
      type: "gift",
      icon: Gift,
      title: "Hediyeleşme",
      description: "Kullanmadığınız eşyaları ihtiyacı olanlarla paylaşın",
      color: "bg-wb-lavender",
      examples: ["Kitap", "Ev eşyası", "Giyim", "Elektronik"]
    },
    {
      type: "help",
      icon: HeartHandshake,
      title: "Yardımlaşma",
      description: "Yardıma ihtiyacı olanlara destek olun",
      color: "bg-wb-green",
      examples: ["Nakdi yardım", "Gıda desteği", "Eşya tamiri", "Nakliye yardımı"]
    },
    {
      type: "sale",
      icon: ShoppingCart,
      title: "Satış",
      description: "İkinci el eşyalarınızı uygun fiyata satın",
      color: "bg-wb-olive",
      examples: ["Mobilya", "Elektronik", "Spor ekipmanı", "Koleksiyon ürünleri"]
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-wb-cream to-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wb-olive mx-auto"></div>
            <p className="text-slate-600 mt-4">Yükleniyor...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-wb-cream to-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Başlık */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-wb-olive mb-4">Başlangıç Rehberi</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Wish Of Bridge platformunu etkili kullanmak için adım adım rehber. 
            Topluluğumuzun güvenli ve verimli bir üyesi olun.
          </p>
        </div>

        {/* Adımlar */}
        <div className="space-y-8 mb-16">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={step.step} className="bg-white rounded-xl shadow-sm border border-wb-olive/10 overflow-hidden">
                <div className="p-6 border-b border-wb-olive/10">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-wb-olive/10 rounded-full flex items-center justify-center">
                        <Icon className="text-wb-olive" size={24} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-semibold text-wb-olive bg-wb-olive/10 px-3 py-1 rounded-full">
                          Adım {step.step}
                        </span>
                        <h3 className="text-xl font-semibold text-wb-olive">{step.title}</h3>
                      </div>
                      <p className="text-slate-600 mb-4">{step.description}</p>
                      
                      <div className="space-y-2">
                        {step.details.map((detail, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                            <CheckCircle size={16} className="text-wb-green mt-0.5 flex-shrink-0" />
                            <span>{detail}</span>
                          </div>
                        ))}
                      </div>

                      {step.tips && (
                        <div className="mt-4 p-3 bg-wb-cream rounded-lg">
                          <p className="text-sm font-semibold text-wb-olive mb-2">💡 İpuçları:</p>
                          <ul className="text-sm text-slate-600 space-y-1">
                            {step.tips.map((tip, idx) => (
                              <li key={idx}>• {tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Platform Türleri */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-wb-olive text-center mb-8">Platform Özellikleri</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {platformTypes.map((platform) => {
              const Icon = platform.icon
              return (
                <div key={platform.type} className="bg-white rounded-xl shadow-sm border border-wb-olive/10 p-6">
                  <div className={`${platform.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="text-white" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-wb-olive mb-2">{platform.title}</h3>
                  <p className="text-slate-600 text-sm mb-4">{platform.description}</p>
                  
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-500">ÖRNEKLER:</p>
                    <div className="flex flex-wrap gap-1">
                      {platform.examples.map((example, idx) => (
                        <span key={idx} className="text-xs bg-wb-cream text-slate-600 px-2 py-1 rounded">
                          {example}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Kullanıcı Durumuna Göre İçerik */}
        {user ? (
          /* Üye girişi yapmış kullanıcılar için */
          <div className="bg-wb-olive text-white rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Hemen Başlayın!</h2>
            <p className="mb-6 opacity-90">
              Artık Wish Of Bridge topluluğunun bir parçasısınız. İlk ilanınızı oluşturarak paylaşıma başlayın.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/create/gift"
                className="bg-white text-wb-olive px-6 py-3 rounded-lg hover:bg-wb-cream transition font-semibold flex items-center justify-center gap-2"
              >
                <Gift size={18} />
                Hediye Oluştur
              </a>
              <a
                href="/create/help"
                className="bg-white text-wb-olive px-6 py-3 rounded-lg hover:bg-wb-cream transition font-semibold flex items-center justify-center gap-2"
              >
                <HeartHandshake size={18} />
                Yardım Oluştur
              </a>
              <a
                href="/create/sale"
                className="bg-white text-wb-olive px-6 py-3 rounded-lg hover:bg-wb-cream transition font-semibold flex items-center justify-center gap-2"
              >
                <ShoppingCart size={18} />
                Satış Oluştur
              </a>
            </div>
          </div>
        ) : (
          /* Üye girişi yapmamış kullanıcılar için */
          <div className="bg-wb-olive text-white rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Topluluğumuza Katılın!</h2>
            <p className="mb-6 opacity-90">
              Wish Of Bridge'in avantajlarından yararlanmak için hesabınızı oluşturun veya giriş yapın.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/login"
                className="bg-white text-wb-olive px-6 py-3 rounded-lg hover:bg-wb-cream transition font-semibold flex items-center justify-center gap-2"
              >
                <LogIn size={18} />
                Giriş Yap
              </a>
              <a
                href="/login"
                className="border border-white text-white px-6 py-3 rounded-lg hover:bg-white/10 transition font-semibold flex items-center justify-center gap-2"
              >
                <UserPlus size={18} />
                Kayıt Ol
              </a>
            </div>
          </div>
        )}

        {/* Ek Kaynaklar */}
        <div className="text-center mt-12">
          <p className="text-slate-600 mb-4">
            Daha fazla bilgi için diğer yardım kaynaklarımız:
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/support/listings" className="text-wb-olive hover:underline font-semibold flex items-center gap-1">
              İlan Yönetimi <ArrowRight size={16} />
            </a>
            <a href="/faq" className="text-wb-olive hover:underline font-semibold flex items-center gap-1">
              Sıkça Sorulan Sorular <ArrowRight size={16} />
            </a>
            <a href="/contact" className="text-wb-olive hover:underline font-semibold flex items-center gap-1">
              İletişim <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}