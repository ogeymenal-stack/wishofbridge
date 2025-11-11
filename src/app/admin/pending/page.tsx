'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function AdminPendingPage() {
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

  if (loading) return (
    <div className="flex justify-center items-center h-32">
      <p className="text-wb-olive">Yükleniyor...</p>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-wb-olive">⏳ Onay Bekleyen Gönderiler</h1>
        <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          Toplam: {posts.length} gönderi
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow">
          <p className="text-slate-500 italic text-lg">🎉 Şu anda bekleyen gönderi yok!</p>
          <p className="text-sm text-slate-400 mt-2">Tüm gönderiler onaylanmış.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl shadow border border-gray-200 p-6">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{post.title}</h3>
                  <p className="text-gray-600 mb-3 line-clamp-2">{post.description}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    {post.category && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Kategori: {post.category}
                      </span>
                    )}
                    {post.user_id && (
                      <span>Kullanıcı ID: {post.user_id}</span>
                    )}
                    {post.created_at && (
                      <span>Oluşturulma: {new Date(post.created_at).toLocaleDateString('tr-TR')}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleApprove(post.id)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2"
                  >
                    <span>✓</span>
                    Onayla
                  </button>
                  <button
                    onClick={() => handleReject(post.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2"
                  >
                    <span>✗</span>
                    Reddet
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}