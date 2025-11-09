'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Database, Loader2, Download, Upload, CheckCircle, XCircle } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function BackupPage() {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedTable, setSelectedTable] = useState<string>('profiles')
  const [message, setMessage] = useState<string>('')

  const tables = ['profiles', 'posts', 'notifications', 'admin_logs', 'site_settings', 'contact_requests']


  // 📦 JSON export
  const exportData = async (table: string) => {
    setLoading(true)
    setMessage('')
    const { data, error } = await supabase.from(table).select('*')
    if (error) {
      setMessage('❌ Hata: ' + error.message)
      setLoading(false)
      return
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${table}-backup-${new Date().toISOString()}.json`
    link.click()
    setMessage(`✅ ${table} tablosu başarıyla yedeklendi.`)
    setLoading(false)
  }

  // 📤 JSON import (upload)
  const handleUpload = async (e: any) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!selectedTable) {
      alert('Lütfen önce hedef tabloyu seçin.')
      return
    }

    setUploading(true)
    setMessage('')

    try {
      const text = await file.text()
      const json = JSON.parse(text)
      if (!Array.isArray(json)) throw new Error('JSON formatı geçersiz.')

      const { error } = await supabase.from(selectedTable).insert(json)
      if (error) throw error

      setMessage(`✅ ${selectedTable} tablosuna ${json.length} kayıt yüklendi.`)
    } catch (err: any) {
      console.error(err)
      setMessage(`❌ Yükleme hatası: ${err.message}`)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-wb-olive mb-6 flex items-center gap-2">
        <Database size={22} /> Yedekleme & Geri Yükleme
      </h1>

      {/* 📁 Yedekleme Seçenekleri */}
      <div className="space-y-4 mb-8">
        {tables.map((table) => (
          <button
            key={table}
            disabled={loading}
            onClick={() => exportData(table)}
            className="w-full flex justify-between items-center bg-white border rounded-xl px-4 py-3 hover:bg-wb-cream transition"
          >
            <span className="font-medium text-wb-olive capitalize">{table}</span>
            {loading ? (
              <Loader2 className="animate-spin text-wb-olive" size={18} />
            ) : (
              <Download className="text-wb-green" size={18} />
            )}
          </button>
        ))}
      </div>

      {/* ⬆️ Upload Bölümü */}
      <div className="bg-white border rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-wb-olive mb-3 flex items-center gap-2">
          <Upload size={18} /> JSON Yükle
        </h2>
        <p className="text-sm text-gray-600 mb-3">
          Daha önce alınan bir JSON yedeğini seçip geri yükleyebilirsiniz.  
          ⚠️ <b>Yalnızca güvenilir dosyaları</b> yükleyin. Veritabanına doğrudan insert işlemi yapılır.
        </p>

        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <select
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            className="border px-3 py-2 rounded-lg text-sm focus:ring-wb-olive focus:border-wb-olive"
          >
            {tables.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 cursor-pointer border rounded-lg px-4 py-2 bg-wb-cream text-wb-olive hover:bg-wb-olive hover:text-white transition text-sm">
            <Upload size={14} /> {uploading ? 'Yükleniyor...' : 'Dosya Seç'}
            <input
              type="file"
              accept=".json"
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {/* 💬 Mesaj */}
      {message && (
        <p
          className={`mt-4 flex items-center gap-2 text-sm font-medium ${
            message.startsWith('✅') ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {message.startsWith('✅') ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {message}
        </p>
      )}
    </div>
  )
}
