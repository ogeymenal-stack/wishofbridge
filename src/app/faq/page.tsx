'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index)
        ? prev.filter(item => item !== index)
        : [...prev, index]
    )
  }

  const faqItems = [
    {
      question: "Wish Of Bridge nedir?",
      answer: "Wish Of Bridge, komşuluk ilişkilerini güçlendiren bir sosyal-ticaret platformudur. Kullanıcılar fazla eşyalarını hediyeleşme, yardımlaşma veya satış yoluyla paylaşabilirler."
    },
    {
      question: "Platform ücretsiz mi?",
      answer: "Evet, temel kullanım tamamen ücretsizdir. Hediyeleşme ve yardımlaşma özelliklerinden hiçbir ücret ödemeden faydalanabilirsiniz. Satış işlemlerinde küçük bir komisyon alınmaktadır."
    },
    {
      question: "Nasıl hesap oluşturabilirim?",
      answer: "Ana sayfadan 'Kayıt Ol' butonuna tıklayarak e-posta adresinizle veya sosyal medya hesaplarınızla hızlıca hesap oluşturabilirsiniz."
    },
    {
      question: "Güvenlik nasıl sağlanıyor?",
      answer: "Kullanıcı doğrulama sistemi, SSL şifreleme, güvenli ödeme sistemleri ve 7/24 moderasyon ekibimizle platform güvenliğini sağlıyoruz."
    },
    {
      question: "İlanım neden onaylanmadı?",
      answer: "İlanlarımız topluluk kurallarına uygunluk açısından kontrol edilir. Yasaklı ürünler, uygunsuz içerik veya eksik bilgi içeren ilanlar onaylanmaz."
    },
    {
      question: "Teslimat nasıl yapılıyor?",
      answer: "Teslimat yöntemi taraflar arasında belirlenir. Yüz yüze teslim, kargo veya anlaşmalı kurye hizmetlerini kullanabilirsiniz. Platform olarak teslimat sürecinde rehberlik sağlıyoruz."
    },
    {
      question: "Ödemeler nasıl yapılıyor?",
      answer: "Satış işlemlerinde güvenli ödeme sistemleri kullanıyoruz. Ödemeler alıcı ürünü teslim aldıktan sonra satıcıya aktarılır, böylece her iki taraf da korunur."
    },
    {
      question: "Bir sorun yaşarsam ne yapmalıyım?",
      answer: 'Destek sayfamızdan bize ulaşabilir veya "destek@wishofbridge.com" adresine e-posta gönderebilirsiniz. Müşteri hizmetleri ekibimiz 48 saat içinde yanıt verecektir.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-wb-cream to-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-wb-olive mb-4">Sıkça Sorulan Sorular</h1>
          <p className="text-lg text-slate-600">
            Aklınıza takılan soruların cevaplarını burada bulabilirsiniz.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-wb-olive/10 overflow-hidden">
          {faqItems.map((item, index) => (
            <div key={index} className="border-b border-wb-olive/10 last:border-b-0">
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-wb-cream/50 transition"
              >
                <span className="font-semibold text-wb-olive text-lg">
                  {item.question}
                </span>
                {openItems.includes(index) ? (
                  <ChevronUp className="text-wb-olive" size={20} />
                ) : (
                  <ChevronDown className="text-wb-olive" size={20} />
                )}
              </button>
              
              {openItems.includes(index) && (
                <div className="px-6 pb-4">
                  <p className="text-slate-600 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Ek Yardım */}
        <div className="text-center mt-8">
          <p className="text-slate-600 mb-4">
            Cevabını bulamadığınız sorular için bize ulaşın
          </p>
          <a
            href="/contact"
            className="inline-block bg-wb-olive text-white px-6 py-3 rounded-lg hover:bg-wb-olive/90 transition font-semibold"
          >
            İletişime Geç
          </a>
        </div>
      </div>
    </div>
  )
}