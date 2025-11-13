'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { X, Loader2, Save } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Props = {
  userId: string | null
  onClose: () => void
}

export default function UserDetailModal({ userId, onClose }: Props) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [recentPosts, setRecentPosts] = useState<any[]>([])
  const [adminUser, setAdminUser] = useState<any>(null)

  useEffect(() => {
    if (!userId) return
    ;(async () => {
      const { data: session } = await supabase.auth.getUser()
      setAdminUser(session?.user)

      setLoading(true)
      const { data: p } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      const { data: posts } = await supabase
        .from('posts')
        .select('id,title,type,status,created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)

      setProfile(p)
      setRecentPosts(posts || [])
      setLoading(false)
    })()
  }, [userId])

  const saveProfile = async () => {
    if (!profile) return
    setSaving(true)

    try {
      const updates = {
        full_name: profile.full_name?.trim() || null,
        email: profile.email?.trim() || null,
        role: profile.role || 'user',
        status: profile.status || 'active',
        updated_at: new Date().toISOString(),
      }

      console.log('📤 Gönderilen updates:', updates)

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id)
        .select()

      if (error || !data || data.length === 0) {
        console.error('❌ Güncelleme başarısız:', error)
        alert('Profil güncellenemedi. Yetki veya policy sorunu olabilir.')
        setSaving(false)
        return
      }

      await supabase.from('admin_activity_log').insert([
        {
          admin_id: adminUser?.id,
          action: 'update_profile',
          target_type: 'user',
          target_id: profile.id,
          details: updates,
          created_at: new Date().toISOString(),
        },
      ])

      alert('✅ Profil başarıyla güncellendi!')
    } catch (err: any) {
      console.error('💥 Hata:', err)
      alert('Beklenmeyen hata: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!userId) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h3 className="text-lg font-semibold text-wb-olive">Kullanıcı Detayı</h3>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-60">
            <Loader2 className="animate-spin text-wb-olive" />
          </div>
        ) : (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500">Ad Soyad</label>
                <input
                  className="w-full border rounded-xl px-3 py-2"
                  value={profile.full_name || ''}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">E-posta</label>
                <input
                  className="w-full border rounded-xl px-3 py-2"
                  value={profile.email || ''}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Rol</label>
                <select
                  className="w-full border rounded-xl px-3 py-2"
                  value={profile.role || 'user'}
                  onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                >
                  <option value="user">Kullanıcı</option>
                  <option value="moderator">Moderatör</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">Durum</label>
                <select
                  className="w-full border rounded-xl px-3 py-2"
                  value={profile.status || 'active'}
                  onChange={(e) => setProfile({ ...profile, status: e.target.value })}
                >
                  <option value="active">Aktif</option>
                  <option value="suspended">Askıya</option>
                  <option value="pending">Beklemede</option>
                </select>
              </div>
            </div>

            <button
              disabled={saving}
              onClick={saveProfile}
              className="inline-flex items-center gap-2 bg-wb-olive text-white px-4 py-2 rounded-xl hover:bg-wb-green disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              Kaydet
            </button>

            <div>
              <h4 className="font-semibold text-wb-olive mb-2">Son 5 İlan</h4>
              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Başlık</th>
                      <th className="px-3 py-2 text-center">Tür</th>
                      <th className="px-3 py-2 text-center">Durum</th>
                      <th className="px-3 py-2 text-center">Tarih</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {recentPosts.map((p) => (
                      <tr key={p.id}>
                        <td className="px-3 py-2">{p.title}</td>
                        <td className="px-3 py-2 text-center">{p.type}</td>
                        <td className="px-3 py-2 text-center">{p.status}</td>
                        <td className="px-3 py-2 text-center">
                          {new Date(p.created_at).toLocaleDateString('tr-TR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
