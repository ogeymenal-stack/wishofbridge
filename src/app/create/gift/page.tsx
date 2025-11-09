'use client'

import { useState } from 'react'

export default function CreateGiftPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTitle('')
    setDescription('')
  }

  return (
    <section className="max-w-2xl mx-auto pastel-card p-6">
      <h1 className="text-2xl font-semibold text-slate-800 mb-4">🎁 Hediye Oluştur</h1>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Başlık</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-wb-olive/40 bg-white/70 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-wb-olive/50"
              placeholder="Ne hediye etmek istiyorsunuz?"
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
              placeholder="Hediye hakkında detaylı bilgi..."
              required
            />
          </div>
          <button
            type="submit"
            className="bg-wb-lavender text-white hover:bg-wb-lavender/90 rounded-xl px-4 py-2 transition"
          >
            Gönder
          </button>
        </form>
      ) : (
        <div className="text-center text-slate-700">
          🎉 Hediye paylaşımınız oluşturuldu!
          <button
            onClick={() => setSubmitted(false)}
            className="block mx-auto mt-4 bg-wb-olive text-white rounded-xl px-4 py-2"
          >
            Yeni Hediye Oluştur
          </button>
        </div>
      )}
    </section>
  )
}
