'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import PostFilters from '@/components/ui/PostFilters'
import Link from 'next/link'

export default function GiftsPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<any>({})

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)
      let query = supabase.from('posts').select('*').eq('type', 'gift')

      if (filters.search) {
        query = query.ilike('title', `%${filters.search}%`)
      }

      if (filters.subId) {
        query = query.eq('sub_category_id', filters.subId)
      } else if (filters.mainId) {
        query = query.eq('main_category_id', filters.mainId)
      }

      if (filters.sort === 'oldest') {
        query = query.order('created_at', { ascending: true })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      const { data, error } = await query
      if (!error) setPosts(data || [])
      setLoading(false)
    }

    fetchPosts()
  }, [filters])

  return (
    <section className="max-w-5xl mx-auto pastel-card p-6">
      <h1 className="text-2xl font-semibold text-slate-800 mb-4">🎁 Hediyeleşme</h1>

      <PostFilters categoryType="gift" onFilterChange={setFilters} />

      {loading ? (
        <p className="text-slate-500">Yükleniyor...</p>
      ) : posts.length === 0 ? (
        <p className="text-slate-500 italic">Filtrenize uygun sonuç bulunamadı.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link key={post.id} href={`/post/${post.id}`}>
              <div className="border border-wb-olive/30 rounded-xl bg-white/60 p-4 hover:shadow-md transition cursor-pointer">
                <h2 className="text-lg font-semibold text-wb-olive mb-1">{post.title}</h2>
                <p className="text-sm text-slate-700 line-clamp-3">{post.description}</p>
                <p className="text-xs text-slate-500 mt-2">
                  {new Date(post.created_at).toLocaleDateString('tr-TR')}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
