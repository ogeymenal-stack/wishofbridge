'use client'

import ModeratorGuard from '@/components/moderator/ModeratorGuard'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function PendingPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPending = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
      if (!error) setPosts(data || [])
      setLoading(false)
    }
    fetchPending()
  }, [])

  const handleApprove = async (id: number) => {
    await supabase.from('posts').update({ status: 'approved' }).eq('id', id)
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }

  const handleReject = async (id: number) => {
    await supabase.from('posts').update({ status: 'rejected' }).eq('id', id)
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }

  if (loading) return <p>Yükleniyor...</p>

  return (
    <ModeratorGuard>
      <h1 className="text-xl font-semibold mb-4 text-wb-olive">⏳ Onay Bekleyen Gönderiler</h1>
      {posts.length === 0 ? (
        <p className="text-slate-500 italic">Şu anda bekleyen gönderi yok.</p>
      ) : (
        <ul className="space-y-4">
          {posts.map((p) => (
            <li key={p.id} className="p-4 bg-white rounded-xl shadow flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{p.title}</h3>
                <p className="text-sm text-slate-600 line-clamp-2">{p.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(p.id)}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md"
                >
                  Onayla
                </button>
                <button
                  onClick={() => handleReject(p.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md"
                >
                  Reddet
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </ModeratorGuard>
  )
}
