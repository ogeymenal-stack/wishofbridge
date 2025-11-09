export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-wb-cream to-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-wb-olive mb-8 text-center">Gizlilik Politikası</h1>
        
        <div className="bg-white p-8 rounded-xl shadow-sm border border-wb-olive/10 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-wb-olive mb-4">1. Giriş</h2>
            <p className="text-slate-600">
              Wish Of Bridge olarak, gizliliğinize önem veriyoruz. Bu politika, 
              kişisel verilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu açıklar.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-wb-olive mb-4">2. Toplanan Bilgiler</h2>
            <ul className="list-disc list-inside space-y-2 text-slate-600">
              <li>Ad, soyad, e-posta adresi</li>
              <li>Profil bilgileri ve tercihler</li>
              <li>İlan ve etkileşim geçmişi</li>
              <li>Teknik veriler (IP adresi, tarayıcı bilgileri)</li>
              <li>Konum verileri (izin verildiğinde)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-wb-olive mb-4">3. Veri Kullanımı</h2>
            <p className="text-slate-600 mb-4">Topladığımız verileri şu amaçlarla kullanıyoruz:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-600">
              <li>Hizmetlerimizi sağlamak ve iyileştirmek</li>
              <li>Hesap güvenliğini sağlamak</li>
              <li>Müşteri desteği sunmak</li>
              <li>Yasal yükümlülükleri yerine getirmek</li>
              <li>Kişiselleştirilmiş deneyim sunmak</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-wb-olive mb-4">4. Veri Paylaşımı</h2>
            <p className="text-slate-600">
              Kişisel verilerinizi üçüncü taraflarla yalnızca aşağıdaki durumlarda paylaşıyoruz:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 mt-2">
              <li>Yasal zorunluluklar gereği</li>
              <li>Hizmet sağlayıcılarımızla (sınırlı erişimle)</li>
              <li>Kullanıcı onayı ile</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-wb-olive mb-4">5. Veri Güvenliği</h2>
            <p className="text-slate-600">
              Verilerinizi korumak için endüstri standartlarında güvenlik önlemleri 
              alıyoruz. SSL şifreleme, düzenli güvenlik denetimleri ve sınırlı 
              erişim politikaları uyguluyoruz.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-wb-olive mb-4">6. Çerezler</h2>
            <p className="text-slate-600">
              Web sitemiz, kullanıcı deneyimini iyileştirmek için çerezler 
              kullanmaktadır. Tarayıcı ayarlarınızdan çerezleri kontrol edebilirsiniz.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-wb-olive mb-4">7. Haklarınız</h2>
            <p className="text-slate-600 mb-4">Aşağıdaki haklara sahipsiniz:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-600">
              <li>Verilerinize erişim hakkı</li>
              <li>Düzeltme hakkı</li>
              <li>Silinme hakkı ("Unutulma hakkı")</li>
              <li>İşleme itiraz hakkı</li>
              <li>Veri taşınabilirliği hakkı</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-wb-olive mb-4">8. İletişim</h2>
            <p className="text-slate-600">
              Gizlilik politikamızla ilgili sorularınız için: 
              <a href="mailto:privacy@wishofbridge.com" className="text-wb-olive ml-1">
                privacy@wishofbridge.com
              </a>
            </p>
          </section>

          <div className="text-sm text-slate-500 mt-8 pt-6 border-t">
            Son güncelleme: {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </div>
  )
}