import { FileText, Image, CheckCircle, AlertTriangle, Edit, Trash2, Eye } from 'lucide-react'

export default function ListingsGuidePage() {
  const listingTypes = [
    {
      type: "gift",
      title: "Hediye İlanı",
      description: "Ücretsiz olarak paylaşmak istediğiniz eşyalar",
      color: "bg-wb-lavender",
      requirements: [
        "Net ve anlaşılır başlık",
        "Detaylı açıklama",
        "Eşyanın durumu",
        "Teslimat/toplantı bilgisi"
      ],
      tips: [
        "Eşyanın gerçek durumunu açıkça belirtin",
        "Fotoğraf eklemek güven oluşturur",
        "Yerel paylaşım için konumunuzu belirtin"
      ]
    },
    {
      type: "help",
      title: "Yardım İlanı",
      description: "İhtiyaç duyduğunuz yardım veya destek talepleri",
      color: "bg-wb-green",
      requirements: [
        "Yardım türünü belirtin",
        "Acil durum seviyesi",
        "İletişim bilgileri",
        "Beklentileriniz"
      ],
      tips: [
        "Talep ettiğiniz yardımı net ifade edin",
        "Gerçekçi beklentiler oluşturun",
        "Güvenli iletişim yöntemleri kullanın"
      ]
    },
    {
      type: "sale",
      title: "Satış İlanı",
      description: "Satmak istediğiniz ikinci el ürünler",
      color: "bg-wb-olive",
      requirements: [
        "Ürün adı ve markası",
        "Gerçekçi fiyat",
        "Detaylı açıklama",
        "Ürün durumu ve kusurlar"
      ],
      tips: [
        "Piyasa araştırması yaparak fiyat belirleyin",
        "Tüm kusurları açıkça belirtin",
        "Yüksek kaliteli fotoğraflar kullanın"
      ]
    }
  ]

  const bestPractices = [
    {
      title: "Kaliteli Fotoğraflar",
      description: "İyi aydınlatılmış, net ve birden fazla açıdan çekilmiş fotoğraflar kullanın",
      icon: Image
    },
    {
      title: "Doğru Bilgiler",
      description: "Eşyanın durumu, ölçüleri, markası gibi tüm bilgileri doğru şekilde paylaşın",
      icon: CheckCircle
    },
    {
      title: "Hızlı Yanıt",
      description: "Gelen mesajlara en geç 24 saat içinde yanıt verin",
      icon: Eye
    },
    {
      title: "Güvenli İletişim",
      description: "Kişisel bilgilerinizi platform dışında paylaşmaktan kaçının",
      icon: AlertTriangle
    }
  ]

  const commonMistakes = [
    "Belirsiz veya yanıltıcı başlıklar kullanmak",
    "Eksik veya yetersiz açıklama yazmak",
    "Kalitesiz veya yetersiz fotoğraf paylaşmak",
    "Gerçekçi olmayan fiyatlar belirlemek",
    "İletişim bilgilerini geç güncellemek"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-wb-cream to-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Başlık */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-wb-olive mb-4">İlan Yönetimi Rehberi</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Etkili ve güvenli ilan oluşturma, yönetme ve takip etme rehberi. 
            Başarılı paylaşımlar için en iyi uygulamalar.
          </p>
        </div>

        {/* İlan Türleri */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-wb-olive text-center mb-8">İlan Türleri ve Gereksinimler</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {listingTypes.map((listing) => (
              <div key={listing.type} className="bg-white rounded-xl shadow-sm border border-wb-olive/10 p-6">
                <div className={`${listing.color} text-white p-3 rounded-lg mb-4`}>
                  <h3 className="text-lg font-semibold">{listing.title}</h3>
                  <p className="text-sm opacity-90">{listing.description}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-wb-olive mb-2 flex items-center gap-2">
                      <FileText size={16} />
                      Zorunlu Bilgiler
                    </h4>
                    <ul className="space-y-1 text-sm text-slate-600">
                      {listing.requirements.map((req, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle size={14} className="text-wb-green mt-0.5 flex-shrink-0" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-wb-olive mb-2">💡 İpuçları</h4>
                    <ul className="space-y-1 text-sm text-slate-600">
                      {listing.tips.map((tip, idx) => (
                        <li key={idx}>• {tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* En İyi Uygulamalar */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-wb-olive text-center mb-8">En İyi Uygulamalar</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {bestPractices.map((practice, index) => {
              const Icon = practice.icon
              return (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-wb-olive/10 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-wb-olive/10 rounded-full flex items-center justify-center">
                        <Icon className="text-wb-olive" size={24} />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-wb-olive mb-2">{practice.title}</h3>
                      <p className="text-slate-600">{practice.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Sık Yapılan Hatalar */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-wb-olive text-center mb-8">Kaçınılması Gereken Hatalar</h2>
          <div className="bg-white rounded-xl shadow-sm border border-wb-olive/10 p-6">
            <div className="grid md:grid-cols-2 gap-4">
              {commonMistakes.map((mistake, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                  <AlertTriangle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-red-700 text-sm">{mistake}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* İlan Yönetimi Araçları */}
        <div className="bg-wb-olive text-white rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">İlan Yönetimi Araçları</h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="p-4">
              <Edit size={32} className="mx-auto mb-3 opacity-90" />
              <h3 className="font-semibold mb-2">Düzenleme</h3>
              <p className="text-sm opacity-80">İlanınızı istediğiniz zaman güncelleyin</p>
            </div>
            <div className="p-4">
              <Eye size={32} className="mx-auto mb-3 opacity-90" />
              <h3 className="font-semibold mb-2">Görünürlük</h3>
              <p className="text-sm opacity-80">İlan durumunu aktif/pasif yapın</p>
            </div>
            <div className="p-4">
              <Trash2 size={32} className="mx-auto mb-3 opacity-90" />
              <h3 className="font-semibold mb-2">Silme</h3>
              <p className="text-sm opacity-80">Artık ihtiyaç duymadığınız ilanları kaldırın</p>
            </div>
          </div>
        </div>

        {/* Sonraki Adımlar */}
        <div className="text-center mt-12">
          <p className="text-slate-600 mb-4">
            İlanınızı oluşturmaya hazır mısınız?
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="/create/gift" 
              className="bg-wb-lavender text-white px-6 py-3 rounded-lg hover:bg-wb-lavender/90 transition font-semibold"
            >
              Hediye Oluştur
            </a>
            <a 
              href="/create/help" 
              className="bg-wb-green text-white px-6 py-3 rounded-lg hover:bg-wb-green/90 transition font-semibold"
            >
              Yardım Oluştur
            </a>
            <a 
              href="/create/sale" 
              className="bg-wb-olive text-white px-6 py-3 rounded-lg hover:bg-wb-olive/90 transition font-semibold"
            >
              Satış Oluştur
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}