'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Save, Loader2, Palette } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AdminThemeSettings() {
  const [colors, setColors] = useState({ primary: '#C3A4FF', secondary: '#F4E9D8' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadTheme()
  }, [])

  const loadTheme = async () => {
    const { data } = await supabase.from('site_settings').select('key,value').in('key', ['theme_primary', 'theme_secondary'])
    const map: any = {}
    data?.forEach((s) => (map[s.key] = s.value))
    setColors({
      primary: map.theme_primary || '#C3A4FF',
      secondary: map.theme_secondary || '#F4E9D8',
    })
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    await supabase.from('site_settings').upsert([
      { key: 'theme_primary', value: colors.primary },
      { key: 'theme_secondary', value: colors.secondary },
    ])
    setSaving(false)
    alert('🎨 Tema başarıyla güncellendi!')
  }

  if (loading)
    return (
      <div className="flex justify-center items-center h-96 text-wb-olive">
        <Loader2 className="animate-spin mr-2" /> Yükleniyor...
      </div>
    )

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-wb-olive mb-6 flex items-center gap-2">
        <Palette size={20} /> Tema Ayarları
      </h1>
      <div className="space-y-4 bg-white p-6 rounded-xl border shadow-sm">
        <div>
          <label className="block text-sm text-wb-olive mb-1">Birincil Renk</label>
          <input type="color" value={colors.primary} onChange={(e) => setColors({ ...colors, primary: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-wb-olive mb-1">İkincil Renk</label>
          <input type="color" value={colors.secondary} onChange={(e) => setColors({ ...colors, secondary: e.target.value })} />
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-wb-olive text-white px-6 py-2 rounded-xl flex items-center gap-2 hover:bg-wb-green"
        >
          {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save size={14} />}
          Kaydet
        </button>
      </div>
    </div>
  )
}
