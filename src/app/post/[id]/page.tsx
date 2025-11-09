'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/context/AuthContext'

export default function PostDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [post, setPost] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const fetchPost = async () => {
      const { data, error } = await supabase.from('posts').select('*').eq('id', id).single()
      if (!error) setPost(data)
      setLoading(false)
    }

    const fetchComments = async () => {
      const { data } = await supabase
        .from('comments')
        .select('*, profiles: user_id (email)')
        .eq('post_id', id)
        .order('created_at', { ascending: false })
      setComments(data || [])
    }

    fetchPost()
    fetchComments()
  }, [id])

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    if (!user) return alert('Yorum yapmak için giriş yapmalısınız!')

    const { error } = await supabase.from('comments').insert({
      post_id: id,
      user_id: user.id,
      content: newComment,
    })

    if (!error) {
      setNewComment('')
      const { data } = await supabase
        .from('comments')
        .select('*, profiles: user_id (email)')
        .eq('post_id', id)
        .order('created_at', { ascending: false })
      setComments(data || [])
    }
  }

  if (loading) return <p className="text-center mt-10 text-slate-500">Yükleniyor...</p>
  if (!post) return <p className="text-center mt-10 text-slate-500">İçerik bulunamadı.</p>

  return (
    <section className="max-w-3xl mx-auto pastel-card p-6 mt-6">
      <h1 className="text-2xl font-semibold text-wb-olive mb-2">{post.title}</h1>
      {post.price && <p className="text-lg font-medium text-slate-700 mb-2">{post.price} ₺</p>}
      <p className="text-slate-700 mb-4">{post.description}</p>
      <p className="text-xs text-slate-500">
        {new Date(post.created_at).toLocaleDateString('tr-TR')}
      </p>

      {/* Yorumlar */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">💬 Yorumlar</h2>

        {comments.length === 0 ? (
          <p className="text-slate-500 text-sm italic mb-4">Henüz yorum yapılmamış.</p>
        ) : (
          <div className="space-y-3">
            {comments.map((c) => (
              <div
                key={c.id}
                className="border border-wb-olive/30 rounded-xl bg-white/70 p-3 text-sm"
              >
                <p className="font-medium text-slate-800">
                  {c.profiles?.email || 'Anonim Kullanıcı'}
                </p>
                <p className="text-slate-700">{c.content}</p>
                <p className="text-xs text-slate-400">
                  {new Date(c.created_at).toLocaleString('tr-TR')}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Yorum formu */}
        {user ? (
          <form onSubmit={handleAddComment} className="mt-6 flex space-x-2">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Yorumunuzu yazın..."
              className="flex-1 border border-wb-olive/30 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-wb-olive/40"
            />
            <button
              type="submit"
              className="bg-wb-olive text-white rounded-xl px-4 py-2 hover:bg-wb-olive/90"
            >
              Gönder
            </button>
          </form>
        ) : (
          <p className="text-sm text-slate-500 mt-4">
            Yorum yapmak için giriş yapmanız gerekir.
          </p>
        )}
      </div>
    </section>
  )
}
