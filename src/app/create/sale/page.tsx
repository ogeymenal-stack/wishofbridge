'use client'

import { useState } from 'react'
import DynamicCategorySelect from '@/components/forms/DynamicCategorySelect'

export default function CreateSalePage() {
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((res) => setTimeout(res, 1000))
    setLoading(false)
    setSubmitted(true)
    setTitle('')
    setPrice('')
    setDescription('')
  }

  return (
    <section className="max-w-2xl mx-auto pastel-card p-6">
      <h1 className="text-2xl font-semibold text-slate-800 mb-4">🛒 Satış Oluştur</h1>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 🔹 Otomatik sabit kategori: Satış */}
          <DynamicCategorySelect defaultCategorySlug="sale" />

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Ürün Adı</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-wb-olive/40 bg-white/70 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-wb-olive/50"
              placeholder="Ne satıyorsunuz?"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Fiyat (₺)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border border-wb-olive/40 bg-white/70 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-wb-olive/50"
              placeholder="Fiyat girin"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Açıklama</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full border border-wb-olive/40 bg-white/70 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-wb-olive/50 resize-none"
              placeholder="Ürün hakkında detaylı bilgi..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-wb-olive text-white hover:bg-wb-olive/90 rounded-xl px-5 py-2 transition disabled:opacity-60"
          >
            {loading ? 'Kaydediliyor…' : 'Gönder'}
          </button>
        </form>
      ) : (
        <div className="text-center text-slate-700">
          ✅ Satış ilanınız başarıyla oluşturuldu!
          <button
            onClick={() => setSubmitted(false)}
            className="block mx-auto mt-4 bg-wb-olive text-white rounded-xl px-4 py-2"
          >
            Yeni Satış Oluştur
          </button>
        </div>
      )}
    </section>
  )
}
