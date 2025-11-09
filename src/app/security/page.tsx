import { Shield, Lock, Eye, Bell, Users, AlertTriangle } from 'lucide-react'

export default function SecurityPage() {
  const securityFeatures = [
    {
      icon: Shield,
      title: 'Hesap Doğrulama',
      description: 'Tüm kullanıcılarımız çok aşamalı doğrulama sisteminden geçer'
    },
    {
      icon: Lock,
      title: 'SSL Şifreleme',
      description: '256-bit SSL şifreleme ile verileriniz güvende'
    },
    {
      icon: Eye,
      title: 'Gizlilik Kontrolü',
      description: 'Hangi bilgilerinizin görülebileceğini siz kontrol edersiniz'
    },
    {
      icon: Bell,
      title: 'Anlık Bildirimler',
      description: 'Şüpheli etkinliklerde anında uyarı alırsınız'
    },
    {
      icon: Users,
      title: '7/24 Moderasyon',
      description: 'Deneyimli moderatör ekibimiz platformu sürekli denetler'
    },
    {
      icon: AlertTriangle,
      title: 'Anlaşmazlık Çözümü',
      description: 'İşlem sorunlarında uzman arabuluculuk hizmeti'
    }
  ]

  const safetyTips = [
    {
      title: 'Kişisel Bilgilerinizi Koruyun',
      tips: [
        'Şifrenizi kimseyle paylaşmayın',
        'İki faktörlü doğrulamayı açın',
        'Düzenli olarak şifrenizi değiştirin'
      ]
    },
    {
      title: 'Güvenli İletişim',
      tips: [
        'Resmi platform mesajlaşma sistemini kullanın',
        'Kişisel iletişim bilgilerini paylaşmayın',
        'Şüpheli mesajları bize bildirin'
      ]
    },
    {
      title: 'Güvenli Teslimat',
      tips: [
        'Herkese açık yerlerde buluşun',
        'Teslimat öncesi ürünü kontrol edin',
        'Nakit ödemelerde dikkatli olun'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-wb-cream to-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Başlık */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-wb-olive/10 rounded-full">
              <Shield className="text-wb-olive" size={48} />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-wb-olive mb-4">Güvenlik</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Wish Of Bridge olarak güvenliğiniz bizim için önceliklidir. 
            Platformumuzda alınan güvenlik önlemlerini ve güvenli kullanım ipuçlarını öğrenin.
          </p>
        </div>

        {/* Güvenlik Özellikleri */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-wb-olive text-center mb-12">Güvenlik Özelliklerimiz</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityFeatures.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-wb-olive/10">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-wb-olive/10 rounded-lg mr-4">
                      <Icon className="text-wb-olive" size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-wb-olive">{feature.title}</h3>
                  </div>
                  <p className="text-slate-600">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Güvenlik İpuçları */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-wb-olive text-center mb-12">Güvenlik İpuçları</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {safetyTips.map((section, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-wb-olive/10">
                <h3 className="text-xl font-semibold text-wb-olive mb-4">{section.title}</h3>
                <ul className="space-y-2">
                  {section.tips.map((tip, tipIndex) => (
                    <li key={tipIndex} className="flex items-start text-slate-600">
                      <span className="text-wb-olive mr-2">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Acil Durum */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-8">
          <div className="flex items-start mb-4">
            <AlertTriangle className="text-red-600 mr-4 mt-1" size={24} />
            <div>
              <h3 className="text-xl font-semibold text-red-800 mb-2">Acil Durumlar</h3>
              <p className="text-red-700 mb-4">
                Aşağıdaki durumlarda derhal bize ulaşın ve gerekirse yerel yetkilileri arayın:
              </p>
              <ul className="list-disc list-inside space-y-1 text-red-700">
                <li>Tehdit veya taciz durumunda</li>
                <li>Dolandırıcılık girişimlerinde</li>
                <li>Kişisel güvenliğiniz tehlikedeyse</li>
                <li>Yasadışı faaliyet şüphesinde</li>
              </ul>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            <a
              href="/contact"
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-semibold text-sm"
            >
              Acil Bildirim
            </a>
            <a
              href="tel:155"
              className="border border-red-600 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition font-semibold text-sm"
            >
              Polis (155)
            </a>
          </div>
        </div>

        {/* Güvenlik Kaynakları */}
        <div className="text-center mt-12">
          <p className="text-slate-600 mb-4">
            Daha fazla güvenlik kaynağı için:
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/privacy" className="text-wb-olive hover:underline font-semibold">
              Gizlilik Politikası
            </a>
            <a href="/terms" className="text-wb-olive hover:underline font-semibold">
              Kullanım Şartları
            </a>
            <a href="/faq" className="text-wb-olive hover:underline font-semibold">
              Sıkça Sorulan Sorular
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}