'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Loader2, Send, CheckCircle, XCircle, Upload } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'Genel',
  })
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // ✅ Basit form doğrulama
      if (!form.name || !form.email || !form.subject || !form.message)
        throw new Error('Lütfen tüm gerekli alanları doldurun.')

      let attachmentUrl: string | null = null

      // 1️⃣ Dosya yükleme (varsa)
      if (file) {
        const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        const path = `contact/${Date.now()}_${safeFileName}`

        const { data: upload, error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(path, file)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('attachments')
          .getPublicUrl(upload.path)

        attachmentUrl = urlData?.publicUrl || null
      }

      // 2️⃣ Veritabanına kaydet
      const { error: insertError } = await supabase.from('contact_requests').insert([
        {
          name: form.name,
          email: form.email,
          subject: form.subject,
          message: form.message,
          category: form.category,
          attachment_url: attachmentUrl,
          status: 'beklemede',
        },
      ])

      if (insertError) throw insertError

      // 3️⃣ E-posta gönderimi (isteğe bağlı)
      try {
        await fetch('/api/send-contact-mail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: 'info@wishofbridge.com',
            subject: `Yeni İletişim Talebi: ${form.subject}`,
            text: `
Ad Soyad: ${form.name}
E-posta: ${form.email}
Kategori: ${form.category}
Konu: ${form.subject}

Mesaj:
${form.message}

Ek: ${attachmentUrl || 'Yok'}
            `,
          }),
        })
      } catch (mailErr) {
        console.warn('E-posta gönderim hatası:', mailErr)
      }

      // 4️⃣ Başarılı gönderim
      setSuccess(true)
      setForm({ name: '', email: '', subject: '', message: '', category: 'Genel' })
      setFile(null)
    } catch (err: any) {
      setError('Bir hata oluştu: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-wb-olive mb-4">İletişim</h1>
      <p className="text-slate-600 mb-8 text-sm leading-relaxed">
        Bizimle iletişime geçmek için aşağıdaki formu doldurabilirsiniz. 
        Geri dönüşler genellikle <strong>24 saat</strong> içerisinde yapılmaktadır.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        {/* 🧍 Ad Soyad / Eposta */}
        <div className="grid md:grid-cols-2 gap-4">
          <input
            required
            type="text"
            placeholder="Ad Soyad"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border p-3 rounded-xl w-full focus:ring-wb-olive focus:border-wb-olive text-sm"
          />
          <input
            required
            type="email"
            placeholder="E-posta"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border p-3 rounded-xl w-full focus:ring-wb-olive focus:border-wb-olive text-sm"
          />
        </div>

        {/* 🧾 Konu */}
        <input
          required
          type="text"
          placeholder="Konu"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          className="border p-3 rounded-xl w-full focus:ring-wb-olive focus:border-wb-olive text-sm"
        />

        {/* 📂 Kategori */}
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="border p-3 rounded-xl w-full text-sm focus:ring-wb-olive focus:border-wb-olive"
        >
          <option>Genel</option>
          <option>Destek</option>
          <option>Teknik Sorun</option>
          <option>İşbirliği</option>
          <option>Geri Bildirim</option>
        </select>

        {/* 📝 Mesaj */}
        <textarea
          required
          rows={6}
          placeholder="Mesajınız..."
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="border p-3 rounded-xl w-full focus:ring-wb-olive focus:border-wb-olive text-sm"
        />

        {/* 📎 Dosya ekleme */}
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <label className="flex items-center gap-2 cursor-pointer hover:text-wb-olive transition">
            <Upload size={16} />
            <span>{file ? file.name : 'Dosya ekle (isteğe bağlı)'}</span>
            <input
              type="file"
              accept="image/*,application/pdf,text/plain"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>
          {file && (
            <button
              type="button"
              onClick={() => setFile(null)}
              className="text-red-500 hover:text-red-700 transition"
            >
              <XCircle size={16} />
            </button>
          )}
        </div>

        {/* 📨 Gönder Butonu */}
        <button
          type="submit"
          disabled={loading}
          className="bg-wb-olive text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-wb-green transition disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin w-4 h-4" /> Gönderiliyor...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" /> Gönder
            </>
          )}
        </button>
      </form>

      {/* ✅ / ❌ Durum Mesajları */}
      {success && (
        <p className="flex items-center gap-2 text-green-600 mt-4 text-sm font-medium">
          <CheckCircle size={16} /> Mesajınız başarıyla gönderildi.
        </p>
      )}
      {error && (
        <p className="flex items-center gap-2 text-red-600 mt-4 text-sm font-medium">
          <XCircle size={16} /> {error}
        </p>
      )}
    </div>
  )
}
