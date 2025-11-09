'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import PostFilters from '@/components/ui/PostFilters'
import Link from 'next/link'

export default function MarketPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<any>({})

  useEffect(() => {
    const fetchMarket = async () => {
      setLoading(true)
      let query = supabase.from('posts').select('*').eq('type', 'sale')

      // 🔍 Arama filtresi
      if (filters.search) {
        query = query.ilike('title', `%${filters.search}%`)
      }

      // 🗂️ Kategori filtreleri
      if (filters.subId) {
        query = query.eq('sub_category_id', filters.subId)
      } else if (filters.mainId) {
        query = query.eq('main_category_id', filters.mainId)
      }

      // 🔄 Sıralama
      if (filters.sort === 'oldest') {
        query = query.order('created_at', { ascending: true })
      } else if (filters.sort === 'price_asc') {
        query = query.order('price', { ascending: true })
      } else if (filters.sort === 'price_desc') {
        query = query.order('price', { ascending: false })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      const { data, error } = await query
      if (!error) setPosts(data || [])
      setLoading(false)
    }

    fetchMarket()
  }, [filters])

  return (
    <section className="max-w-6xl mx-auto pastel-card p-6">
      <h1 className="text-2xl font-semibold text-slate-800 mb-4">🛒 Satışlar</h1>

      {/* 🔎 Filtreler */}
      <PostFilters categoryType="sale" onFilterChange={setFilters} />

      {/* 📦 Liste */}
      {loading ? (
        <p className="text-slate-500 text-center py-10">Yükleniyor...</p>
      ) : posts.length === 0 ? (
        <p className="text-slate-500 italic text-center py-10">
          Filtrenize uygun satış ilanı bulunamadı.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link key={post.id} href={`/post/${post.id}`} className="group">
              <div className="relative border border-wb-olive/30 rounded-2xl bg-white/70 overflow-hidden shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer">
                {/* Ürün Resmi (varsa ileride eklenecek) */}
                <div className="h-40 bg-gradient-to-r from-wb-olive/10 to-wb-olive/20 flex items-center justify-center text-wb-olive text-sm italic">
                  Görsel Yok
                </div>

                {/* İçerik */}
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-wb-olive mb-1 line-clamp-1 group-hover:underline">
                    {post.title}
                  </h2>
                  <p className="text-sm text-slate-700 line-clamp-2 mb-2">
                    {post.description}
                  </p>

                  {post.price && (
                    <p className="text-base font-semibold text-wb-olive">
                      {Number(post.price).toLocaleString('tr-TR')} ₺
                    </p>
                  )}

                  <p className="text-xs text-slate-500 mt-2">
                    {new Date(post.created_at).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
