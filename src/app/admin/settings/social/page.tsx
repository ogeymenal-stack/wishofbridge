'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import {
  Loader2,
  Globe2,
  Save,
  RefreshCw,
  ShieldCheck,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Music2,
  Linkedin,
} from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type SocialSetting = {
  id: string
  key: string
  value: string
  is_active: boolean
}

const platformIcons: Record<string, any> = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  tiktok: Music2,
  youtube: Youtube,
  linkedin: Linkedin,
}

export default function AdminSocialSettingsPage() {
  const [links, setLinks] = useState<SocialSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const [message, setMessage] = useState('')

  // 🔐 Admin kontrolü
  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.auth.getUser()
      const user = data?.user
      if (!user) {
        window.location.href = '/'
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || (profile.role !== 'admin' && profile.role !== 'moderator')) {
        alert('Bu sayfa sadece admin veya moderatör içindir.')
        window.location.href = '/'
        return
      }

      setAuthorized(true)
    })()
  }, [])

  useEffect(() => {
    if (authorized) loadLinks()
  }, [authorized])

  const loadLinks = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('site_settings')
      .select('id, key, value, is_active')
      .in('key', ['facebook', 'instagram', 'twitter', 'tiktok', 'youtube', 'linkedin'])
      .order('key')

    if (!error && data) setLinks(data)
    setLoading(false)
  }

  const handleToggle = (id: string) => {
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, is_active: !l.is_active } : l)))
  }

  const handleChange = (id: string, value: string) => {
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, value } : l)))
  }

  const handleSave = async () => {
  setSaving(true)
  setMessage('')
  try {
    // 🔧 key alanını da gönderiyoruz
    const updates = links.map((l) => ({
      id: l.id,
      key: l.key, // 👈 EKLENDİ
      value: l.value,
      is_active: l.is_active,
      updated_at: new Date().toISOString(),
    }))

    const { error } = await supabase.from('site_settings').upsert(updates, {
      onConflict: 'id', // id üzerinden güncelle
    })

    if (error) throw error
    setMessage('✅ Sosyal medya bağlantıları başarıyla güncellendi.')
  } catch (err: any) {
    console.error('Hata:', err)
    setMessage('❌ Kaydetme sırasında hata oluştu: ' + (err.message || 'Bilinmeyen hata'))
  } finally {
    setSaving(false)
  }
}

  if (authorized === null)
    return (
      <div className="flex justify-center items-center h-96 text-wb-olive">
        <ShieldCheck className="animate-pulse mr-2" /> Yetki doğrulanıyor...
      </div>
    )

  if (loading)
    return (
      <div className="flex justify-center items-center h-96 text-wb-olive">
        <Loader2 className="animate-spin mr-2" /> Bağlantılar yükleniyor...
      </div>
    )

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-wb-olive mb-6 flex items-center gap-2">
        <Globe2 size={20} /> Sosyal Medya Bağlantıları
      </h1>

      <div className="bg-white border rounded-xl shadow-sm divide-y">
        {links.map((link) => {
          const Icon = platformIcons[link.key] || Globe2
          return (
            <div
              key={link.id}
              className="flex flex-col md:flex-row items-center justify-between p-4 gap-3"
            >
              <div className="flex items-center gap-3 flex-1">
                <Icon className="text-wb-olive" size={20} />
                <div className="flex-1">
                  <p className="font-medium text-wb-olive capitalize">{link.key}</p>
                  <input
                    type="url"
                    value={link.value || ''}
                    onChange={(e) => handleChange(link.id, e.target.value)}
                    placeholder={`https://${link.key}.com/`}
                    className="w-full mt-1 border rounded-lg p-2 text-sm focus:ring-wb-olive focus:border-wb-olive"
                  />
                </div>
              </div>
              <label className="flex items-center gap-1 text-sm text-gray-600 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={link.is_active}
                  onChange={() => handleToggle(link.id)}
                />
                Aktif
              </label>
            </div>
          )
        })}
      </div>

      <div className="flex justify-end mt-6 gap-3">
        <button
          onClick={loadLinks}
          className="flex items-center gap-2 border border-wb-olive text-wb-olive px-4 py-2 rounded-xl text-sm hover:bg-wb-cream transition"
        >
          <RefreshCw size={14} /> Yenile
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-wb-olive text-white px-5 py-2 rounded-xl text-sm hover:bg-wb-green disabled:opacity-70 transition"
        >
          {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save size={14} />}
          Kaydet
        </button>
      </div>

      {message && (
        <p
          className={`mt-4 text-sm font-medium ${
            message.startsWith('✅') ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  )
}
