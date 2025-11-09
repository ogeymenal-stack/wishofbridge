import { Search, BookOpen, MessageCircle, Shield, FileText, ArrowRight } from 'lucide-react'

export default function SupportPage() {
  const helpCategories = [
    {
      icon: BookOpen,
      title: 'Başlangıç Rehberi',
      description: 'Platformu nasıl kullanacağınızı öğrenin',
      link: '/support/getting-started'
    },
    {
      icon: MessageCircle,
      title: 'İlan Yönetimi',
      description: 'İlan oluşturma ve yönetme rehberi',
      link: '/support/listings'
    },
    {
      icon: Shield,
      title: 'Güvenlik & Gizlilik',
      description: 'Hesap güvenliği ve gizlilik ayarları',
      link: '/security'
    },
    {
      icon: FileText,
      title: 'SSS',
      description: 'Sıkça sorulan sorular ve cevapları',
      link: '/faq'
    }
  ]

  const popularArticles = [
    {
      title: 'Hesap Doğrulama Nasıl Yapılır?',
      category: 'Hesap Yönetimi',
      readTime: '3 dk',
      link: '/faq'
    },
    {
      title: 'İlan Onay Süreci Nasıl İşler?',
      category: 'İlan Yönetimi',
      readTime: '5 dk',
      link: '/support/listings'
    },
    {
      title: 'Güvenli Ödeme Yöntemleri',
      category: 'Finansal',
      readTime: '4 dk',
      link: '/security'
    },
    {
      title: 'Teslimat Seçenekleri',
      category: 'İşlemler',
      readTime: '3 dk',
      link: '/support/listings'
    },
    {
      title: 'Anlaşmazlık Çözümü',
      category: 'Güvenlik',
      readTime: '6 dk',
      link: '/security'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-wb-cream to-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Başlık ve Arama */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-wb-olive mb-4">Yardım Merkezi</h1>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            Size nasıl yardımcı olabiliriz? Sorularınızın cevaplarını burada bulabilir 
            veya doğrudan destek ekibimizle iletişime geçebilirsiniz.
          </p>
          
          {/* Arama Kutusu */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Yardım konusu ara... (örn: hesap, ödeme, ilan)"
              className="w-full pl-12 pr-4 py-4 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-wb-olive/50 focus:border-wb-olive"
            />
          </div>
        </div>

        {/* Yardım Kategorileri */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-wb-olive mb-8 text-center">Yardım Kategorileri</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {helpCategories.map((category, index) => {
              const Icon = category.icon
              return (
                <a
                  key={index}
                  href={category.link}
                  className="bg-white p-6 rounded-xl shadow-sm border border-wb-olive/10 hover:shadow-md transition group"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="p-3 bg-wb-olive/10 rounded-lg mb-4 group-hover:bg-wb-olive/20 transition">
                      <Icon className="text-wb-olive" size={32} />
                    </div>
                    <h3 className="font-semibold text-wb-olive mb-2">{category.title}</h3>
                    <p className="text-slate-600 text-sm">{category.description}</p>
                    <div className="mt-3 flex items-center gap-1 text-wb-olive text-sm font-medium">
                      <span>Detaylı bilgi</span>
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </a>
              )
            })}
          </div>
        </div>

        {/* Popüler Makaleler */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-wb-olive mb-8 text-center">Popüler Makaleler</h2>
          <div className="bg-white rounded-xl shadow-sm border border-wb-olive/10 overflow-hidden">
            {popularArticles.map((article, index) => (
              <a
                key={index}
                href={article.link}
                className="block p-6 border-b border-wb-olive/10 last:border-b-0 hover:bg-wb-cream/30 transition group"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-wb-olive mb-2 group-hover:text-wb-green transition">
                      {article.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="bg-wb-cream px-2 py-1 rounded">{article.category}</span>
                      <span>{article.readTime} okuma</span>
                    </div>
                  </div>
                  <FileText className="text-wb-olive/60 group-hover:text-wb-olive transition" size={20} />
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Canlı Destek */}
        <div className="bg-wb-olive text-white rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Hala Yardıma İhtiyacınız Var mı?</h2>
          <p className="mb-6 opacity-90">
            Canlı destek ekibimiz sorularınızı yanıtlamak için burada
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="bg-white text-wb-olive px-6 py-3 rounded-lg hover:bg-wb-cream transition font-semibold"
            >
              İletişim Formu
            </a>
            <a
              href="mailto:destek@wishofbridge.com"
              className="border border-white text-white px-6 py-3 rounded-lg hover:bg-white/10 transition font-semibold"
            >
              E-posta Gönder
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}