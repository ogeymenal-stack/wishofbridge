'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Bell, Loader2, Send, Trash2 } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newMsg, setNewMsg] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
    setNotifications(data || [])
    setLoading(false)
  }

  const sendNotification = async () => {
    if (!newMsg.trim()) return
    setSaving(true)
    await supabase.from('notifications').insert({
      message: newMsg,
      created_at: new Date().toISOString(),
    })
    setNewMsg('')
    setSaving(false)
    loadNotifications()
  }

  const deleteNotification = async (id: string) => {
    if (!confirm('Bu bildirimi silmek istediğine emin misin?')) return
    await supabase.from('notifications').delete().eq('id', id)
    loadNotifications()
  }

  if (loading)
    return (
      <div className="flex justify-center items-center h-96 text-wb-olive">
        <Loader2 className="animate-spin mr-2" /> Bildirimler yükleniyor...
      </div>
    )

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-wb-olive mb-6 flex items-center gap-2">
        <Bell size={20} /> Bildirimler
      </h1>

      <div className="mb-6 flex gap-3">
        <input
          type="text"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          placeholder="Yeni bildirim mesajı..."
          className="flex-1 border rounded-lg p-2 focus:ring-wb-olive focus:border-wb-olive text-sm"
        />
        <button
          onClick={sendNotification}
          disabled={saving}
          className="bg-wb-olive text-white px-4 py-2 rounded-lg text-sm hover:bg-wb-green transition flex items-center gap-2"
        >
          {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Send size={14} />}
          Gönder
        </button>
      </div>

      {notifications.length === 0 ? (
        <p className="text-gray-500 text-center">Henüz bildirim bulunmuyor.</p>
      ) : (
        <div className="bg-white rounded-xl border divide-y shadow-sm">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="p-4 flex items-center justify-between hover:bg-gray-50 transition"
            >
              <div>
                <p className="text-wb-olive">{n.message}</p>
                <p className="text-xs text-gray-500">
                  {new Date(n.created_at).toLocaleString('tr-TR')}
                </p>
              </div>
              <button
                onClick={() => deleteNotification(n.id)}
                className="text-gray-400 hover:text-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
