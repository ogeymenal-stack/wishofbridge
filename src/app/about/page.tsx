import { Heart, Users, Shield, Target } from 'lucide-react'

export default function AboutPage() {
  const values = [
    {
      icon: Heart,
      title: 'Paylaşma Kültürü',
      description: 'İhtiyaç sahipleriyle elindeki fazlalıkları paylaşmak isteyenleri buluşturuyoruz.'
    },
    {
      icon: Users,
      title: 'Topluluk Ruhu',
      description: 'Komşuluk ilişkilerini güçlendiren, güven temelli bir topluluk oluşturuyoruz.'
    },
    {
      icon: Shield,
      title: 'Güvenlik',
      description: 'Tüm kullanıcılarımızın güvenliği için doğrulama sistemleri geliştiriyoruz.'
    },
    {
      icon: Target,
      title: 'Sürdürülebilirlik',
      description: 'İsrafı önleyerek çevreye duyarlı bir tüketim alışkanlığı teşvik ediyoruz.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-wb-cream to-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Başlık */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-wb-olive mb-4">Hakkımızda</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Wish Of Bridge, paylaşmanın gücüne inanan bir sosyal-ticaret platformudur. 
            Komşuluk ilişkilerini güçlendirerek toplumsal dayanışmayı artırmayı hedefliyoruz.
          </p>
        </div>

        {/* Misyon & Vizyon */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-wb-olive/10">
            <h3 className="text-xl font-semibold text-wb-olive mb-4">Misyonumuz</h3>
            <p className="text-slate-600">
              İnsanlar arasında anlamlı bağlar kurarak, paylaşım ekonomisini 
              yaygınlaştırmak ve toplumsal dayanışmayı güçlendirmek.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-wb-olive/10">
            <h3 className="text-xl font-semibold text-wb-olive mb-4">Vizyonumuz</h3>
            <p className="text-slate-600">
              Türkiye'nin en güvenilir sosyal-ticaret platformu olarak, 
              milyonlarca insanın hayatına dokunmak ve pozitif değişim yaratmak.
            </p>
          </div>
        </div>

        {/* Değerlerimiz */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-wb-olive text-center mb-12">Değerlerimiz</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-wb-olive/10">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-wb-olive/10 rounded-lg mr-4">
                      <Icon className="text-wb-olive" size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-wb-olive">{value.title}</h3>
                  </div>
                  <p className="text-slate-600">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Hikayemiz */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-wb-olive/10">
          <h2 className="text-2xl font-bold text-wb-olive mb-6">Hikayemiz</h2>
          <div className="space-y-4 text-slate-600">
            <p>
              Wish Of Bridge, 2024 yılında, modern hayatın getirdiği yalnızlık ve 
              tüketim çılgınlığına bir alternatif sunmak amacıyla kuruldu.
            </p>
            <p>
              Günümüzde birçok insan kullanmadığı eşyalarla dolu evlerde yaşıyor, 
              diğer yandan temel ihtiyaçlarını karşılayamayan komşularımız var. 
              Bu dengesizliği gidermek için bir köprü kurmaya karar verdik.
            </p>
            <p>
              Platformumuz, sadece bir alışveriş sitesi değil, bir dayanışma 
              ağıdır. Burada her paylaşım yeni bir bağ, her hediye yeni bir 
              gülümseme demektir.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}