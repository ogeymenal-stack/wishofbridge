'use client'

import ModeratorGuard from '@/components/moderator/ModeratorGuard'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function ContactPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error) setMessages(data || [])
      setLoading(false)
    }
    fetchMessages()
  }, [])

  if (loading) return <p>Yükleniyor...</p>

  return (
    <ModeratorGuard>
      <h1 className="text-xl font-semibold mb-4 text-wb-olive">📬 İletişim Talepleri</h1>
      {messages.length === 0 ? (
        <p className="text-slate-500 italic">Yeni iletişim mesajı yok.</p>
      ) : (
        <div className="space-y-4">
          {messages.map((m) => (
            <div key={m.id} className="p-4 bg-white rounded-xl shadow">
              <h3 className="font-semibold">{m.name}</h3>
              <p className="text-sm text-slate-600">{m.message}</p>
              <p className="text-xs text-slate-400 mt-1">{m.email}</p>
            </div>
          ))}
        </div>
      )}
    </ModeratorGuard>
  )
}
