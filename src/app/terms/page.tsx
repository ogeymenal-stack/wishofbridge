export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-wb-cream to-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-wb-olive mb-8 text-center">Kullanım Şartları</h1>
        
        <div className="bg-white p-8 rounded-xl shadow-sm border border-wb-olive/10 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-wb-olive mb-4">1. Kabul ve Değişiklikler</h2>
            <p className="text-slate-600">
              Wish Of Bridge platformunu kullanarak bu şartları kabul etmiş sayılırsınız. 
              Şartları zaman zaman güncelleyebiliriz. Değişiklikler sitede yayınlandığında yürürlüğe girer.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-wb-olive mb-4">2. Hesap Sorumlulukları</h2>
            <ul className="list-disc list-inside space-y-2 text-slate-600">
              <li>18 yaşından büyük olmalısınız</li>
              <li>Doğru ve güncel bilgiler sağlamalısınız</li>
              <li>Hesap güvenliğinden siz sorumlusunuz</li>
              <li>Bir hesabı yalnızca bir kişi kullanabilir</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-wb-olive mb-4">3. İlan Kuralları</h2>
            <p className="text-slate-600 mb-4">Yasaklanmış içerikler:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-600">
              <li>Yasadışı ürünler ve hizmetler</li>
              <li>Tehlikeli maddeler</li>
              <li>Sahte ürünler</li>
              <li>Nefret söylemi içeren içerikler</li>
              <li>Telif hakkı ihlali yapan materyaller</li>
              <li>Yetişkinlere yönelik içerikler</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-wb-olive mb-4">4. İşlem Kuralları</h2>
            <ul className="list-disc list-inside space-y-2 text-slate-600">
              <li>Ürün/hizmet açıklaması doğru olmalı</li>
              <li>Teslimat sürelerine uyulmalı</li>
              <li>Ödemeler güvenli yollarla yapılmalı</li>
              <li>Anlaşmazlıklarda platform arabuluculuk yapabilir</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-wb-olive mb-4">5. Fikri Mülkiyet</h2>
            <p className="text-slate-600">
              Platform içeriği, logo, tasarım ve yazılım Wish Of Bridge'e aittir. 
              İzin almadan kopyalanamaz, dağıtılamaz veya ticari amaçla kullanılamaz.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-wb-olive mb-4">6. Sorumluluk Reddi</h2>
            <p className="text-slate-600">
              Platform "olduğu gibi" sunulmaktadır. Kullanıcılar arasındaki işlemlerden 
              doğrudan sorumlu değiliz. Kullanıcılar kendi işlemlerinden sorumludur.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-wb-olive mb-4">7. Hesap Askıya Alma</h2>
            <p className="text-slate-600">
              Aşağıdaki durumlarda hesabınızı askıya alabilir veya sonlandırabiliriz:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 mt-2">
              <li>Şartları ihlal ettiğinizde</li>
              <li>Yasadışı faaliyetlerde bulunduğunuzda</li>
              <li>Diğer kullanıcılara zarar verdiğinizde</li>
              <li>Platform güvenliğini tehdit ettiğinizde</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-wb-olive mb-4">8. Uygulanacak Hukuk</h2>
            <p className="text-slate-600">
              Bu şartlar Türkiye Cumhuriyeti yasalarına tabidir. 
              Anlaşmazlıklarda İstanbul Mahkemeleri yetkilidir.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-wb-olive mb-4">9. İletişim</h2>
            <p className="text-slate-600">
              Şartlarla ilgili sorularınız için: 
              <a href="mailto:legal@wishofbridge.com" className="text-wb-olive ml-1">
                legal@wishofbridge.com
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