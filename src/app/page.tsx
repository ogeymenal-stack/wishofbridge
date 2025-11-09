'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import {
  Search,
  Gift,
  HeartHandshake,
  ShoppingCart,
  Users,
  Package,
  Star,
  ArrowRight,
  Shield,
} from 'lucide-react'
import Link from 'next/link'

type Category = {
  id: number
  name: string
  slug: string | null
  description: string | null
  icon?: string | null
}

type Listing = {
  id: string
  title: string
  description: string | null
  type: 'gift' | 'help' | 'sale'
  price?: number | null
  image_urls?: string[] | null
  created_at: string
  profiles?: {
    full_name?: string | null
    profile_photo?: string | null
  } | null
}

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [filtered, setFiltered] = useState<Listing[]>([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  const [stats, setStats] = useState({
    users: 0,
    completed: 0,
    totalPosts: 0,
    helpRequests: 0,
    satisfaction: 4.8,
  })

  const [animatedStats, setAnimatedStats] = useState({
    users: 0,
    completed: 0,
    helpRequests: 0,
  })

  // 📊 Animasyonlu istatistik artışı
  useEffect(() => {
    const duration = 1500
    const start = performance.now()

    const animate = (time: number) => {
      const progress = Math.min((time - start) / duration, 1)
      setAnimatedStats({
        users: Math.floor(progress * stats.users),
        completed: Math.floor(progress * stats.completed),
        helpRequests: Math.floor(progress * stats.helpRequests),
      })
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [stats])

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [categoriesRes, listingsRes, profilesCount, completedCount, totalPosts, helpCount, reviewAvg] =
          await Promise.all([
            supabase.from('categories').select('id,name,slug,description,icon').order('name', { ascending: true }),
            supabase
              .from('posts')
              .select('id,title,description,type,price,image_urls,created_at,profiles(full_name,profile_photo)')
              .order('created_at', { ascending: false })
              .limit(8),
            supabase.from('profiles').select('*', { count: 'exact', head: true }),
            supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
            supabase.from('posts').select('*', { count: 'exact', head: true }),
            supabase.from('posts').select('*', { count: 'exact', head: true }).eq('type', 'help'),
            supabase.rpc('avg_user_review_rating').single(),
          ])

        setCategories(categoriesRes.data || [])
                const listings =
          listingsRes.data?.map((item: any) => ({
            ...item,
            profiles: item.profiles?.[0] || null,
          })) || []

        setFeaturedListings(listings)

        const satisfaction =
          reviewAvg.data && typeof reviewAvg.data === 'number'
            ? Math.round(reviewAvg.data * 10) / 10
            : 4.8

        setStats({
          users: profilesCount.count || 0,
          completed: completedCount.count || 0,
          totalPosts: totalPosts.count || 1,
          helpRequests: helpCount.count || 0,
          satisfaction,
        })
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // 🔍 Filtreleme
  useEffect(() => {
    let filteredData = featuredListings.filter(
      (item) =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase()) ||
        item.type.toLowerCase().includes(search.toLowerCase())
    )

    if (selectedCategory !== 'Tümü') {
      filteredData = filteredData.filter((x) => x.type === selectedCategory.toLowerCase())
    }

    if (selectedCategory === 'sale' && (minPrice || maxPrice)) {
      filteredData = filteredData.filter((x) => {
        const price = x.price || 0
        return (
          (!minPrice || price >= Number(minPrice)) &&
          (!maxPrice || price <= Number(maxPrice))
        )
      })
    }

    setFiltered(filteredData)
  }, [search, selectedCategory, minPrice, maxPrice, featuredListings])

  // Progress bar oranları
  const shareRate = Math.min((stats.completed / stats.totalPosts) * 100, 100)
  const helpRate = Math.min((stats.helpRequests / stats.users) * 100, 100)

  // Platform özellikleri
  const platformFeatures = [
    {
      icon: Gift,
      title: 'Hediyeleşme',
      description: 'Kullanmadığın eşyalarını ihtiyacı olanlarla paylaş',
      color: 'bg-wb-lavender',
      link: '/create/gift'
    },
    {
      icon: HeartHandshake,
      title: 'Yardımlaşma',
      description: 'Yardıma ihtiyacı olanlara destek ol',
      color: 'bg-wb-green',
      link: '/create/help'
    },
    {
      icon: ShoppingCart,
      title: 'Satış',
      description: 'İkinci el eşyalarını değerinde sat',
      color: 'bg-wb-olive',
      link: '/create/sale'
    },
    {
      icon: Shield,
      title: 'Güvenli Alışveriş',
      description: 'Doğrulanmış kullanıcılar ve güvenli ödeme',
      color: 'bg-wb-blue',
      link: '/security'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-wb-cream to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wb-olive mx-auto"></div>
          <p className="text-slate-600 mt-4">Wish Of Bridge yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-wb-cream to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-wb-olive to-wb-green text-white py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Paylaşmanın 
              <span className="block text-wb-lavender">Yeni Köprüsü</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-2xl mx-auto">
              Wish Of Bridge ile komşuluk ilişkilerini güçlendir, 
              ihtiyaç sahiplerine ulaş, fazlalıklarını değerlendir.
            </p>
            
            {/* Arama & Filtreler */}
            <div className="max-w-4xl mx-auto mb-8">
              <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    type="text"
                    placeholder="Ne aramak istiyorsunuz? (kitap, mobilya, elektronik...)"
                    className="w-full pl-10 pr-4 py-3 rounded-lg text-slate-800 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-wb-lavender"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full md:w-auto border border-gray-200 rounded-lg px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-wb-lavender"
                >
                  <option>Tümü</option>
                  <option value="gift">Hediye</option>
                  <option value="help">Yardım</option>
                  <option value="sale">Satış</option>
                </select>
                {selectedCategory === 'sale' && (
                  <div className="flex gap-2 w-full md:w-auto">
                    <input
                      type="number"
                      placeholder="Min ₺"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="flex-1 md:w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-wb-lavender"
                    />
                    <input
                      type="number"
                      placeholder="Max ₺"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="flex-1 md:w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-wb-lavender"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Hızlı Aksiyon Butonları */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/create/gift" className="bg-wb-lavender hover:bg-wb-lavender/90 text-white px-8 py-4 rounded-xl font-semibold transition flex items-center gap-2">
                <Gift size={20} />
                Hediyeleş
              </a>
              <a href="/create/help" className="bg-white text-wb-olive hover:bg-wb-cream px-8 py-4 rounded-xl font-semibold transition flex items-center gap-2">
                <HeartHandshake size={20} />
                Yardımlaş
              </a>
              <a href="/create/sale" className="border-2 border-white hover:bg-white/10 px-8 py-4 rounded-xl font-semibold transition flex items-center gap-2">
                <ShoppingCart size={20} />
                Satış Yap
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* İstatistikler */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <StatBox icon={Users} value={formatK(animatedStats.users)} label="Aktif Kullanıcı" />
            <StatBox icon={Package} value={formatK(animatedStats.completed)} label="Başarılı Paylaşım" />
            <StatBox icon={HeartHandshake} value={formatK(animatedStats.helpRequests)} label="Yardım Talebi" />
            <StatBox icon={Star} value={`${stats.satisfaction}/5`} label="Memnuniyet" />
          </div>

          {/* Progress Bars */}
          <div className="max-w-2xl mx-auto space-y-6">
            <Progress label="Paylaşım Başarı Oranı" value={shareRate} color="bg-wb-olive" />
            <Progress label="Yardımlaşma Katılım Oranı" value={helpRate} color="bg-wb-green" />
          </div>
        </div>
      </section>

      {/* Kategoriler */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-wb-olive mb-4">
              Keşfetmeye Başla
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              İlgi alanlarına göre kategorileri keşfet ve topluluğumuzdaki paylaşımları gör
            </p>
          </div>

          {categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug || category.id}`}
                  className="bg-white rounded-xl shadow-sm border border-wb-olive/10 p-6 hover:shadow-md transition group"
                >
                  <div className="flex items-center gap-4">
                    {category.icon && (
                      <div className="w-12 h-12 bg-wb-olive/10 rounded-lg flex items-center justify-center group-hover:bg-wb-olive/20 transition">
                        <span className="text-2xl">{category.icon}</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-wb-olive group-hover:text-wb-green transition mb-1">
                        {category.name}
                      </h3>
                      <p className="text-slate-600 text-sm">{category.description}</p>
                    </div>
                    <ArrowRight className="text-wb-olive/60 group-hover:text-wb-olive transition" size={20} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="mx-auto text-slate-400 mb-4" size={48} />
              <p className="text-slate-500 text-lg">Henüz kategori bulunamadı.</p>
              <p className="text-slate-400">Yakında yeni kategoriler eklenecek!</p>
            </div>
          )}
        </div>
      </section>

      {/* Öne Çıkan İlanlar */}
      {filtered.length > 0 && (
        <section className="py-16 bg-wb-cream/50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-wb-olive mb-4">
                Yeni Paylaşımlar
              </h2>
              <p className="text-xl text-slate-600">
                Topluluğumuzdaki en yeni paylaşımları keşfet
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filtered.slice(0, 8).map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>

            {filtered.length > 8 && (
              <div className="text-center mt-8">
                <a href="/discover" className="inline-flex items-center gap-2 bg-wb-olive text-white px-6 py-3 rounded-xl hover:bg-wb-olive/90 transition font-semibold">
                  Tümünü Gör
                  <ArrowRight size={20} />
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Platform Özellikleri */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-wb-olive mb-4">
              Neden Wish Of Bridge?
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Topluluk odaklı platformumuzun benzersiz avantajlarından yararlanın
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {platformFeatures.map((feature, index) => {
              const Icon = feature.icon
              return (
                <a
                  key={index}
                  href={feature.link}
                  className="bg-white rounded-xl shadow-sm border border-wb-olive/10 p-6 text-center hover:shadow-md transition group"
                >
                  <div className={`${feature.color} w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition`}>
                    <Icon className="text-white" size={32} />
                  </div>
                  <h3 className="font-semibold text-wb-olive mb-2">{feature.title}</h3>
                  <p className="text-slate-600 text-sm">{feature.description}</p>
                </a>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-wb-olive text-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Topluluğumuza Katılmaya Hazır mısın?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Binlerce kullanıcının arasına katıl ve paylaşımın gücünü keşfet
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/login" className="bg-white text-wb-olive px-8 py-4 rounded-xl font-semibold hover:bg-wb-cream transition">
              Hemen Başla
            </a>
            <a href="/about" className="border-2 border-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition">
              Daha Fazla Bilgi
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

/* --- COMPONENTS --- */

function StatBox({ icon: Icon, value, label }: any) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-wb-olive/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="text-wb-olive" size={32} />
      </div>
      <div className="text-2xl font-bold text-wb-olive mb-1">{value}</div>
      <div className="text-slate-600">{label}</div>
    </div>
  )
}

function ListingCard({ listing }: { listing: Listing }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-wb-olive/10 overflow-hidden hover:shadow-md transition">
      {listing.image_urls && listing.image_urls.length > 0 ? (
        <img
          src={listing.image_urls[0]}
          alt={listing.title}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-wb-cream flex items-center justify-center">
          <Package className="text-wb-olive/40" size={48} />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className={`px-2 py-1 rounded text-xs font-semibold ${
            listing.type === 'gift' ? 'bg-wb-lavender text-white' :
            listing.type === 'help' ? 'bg-wb-green text-white' :
            'bg-wb-olive text-white'
          }`}>
            {listing.type === 'gift' ? '🎁 Hediye' : 
             listing.type === 'help' ? '💞 Yardım' : '🛒 Satış'}
          </div>
        </div>
        <h3 className="font-semibold text-wb-olive mb-2 line-clamp-2">
          {listing.title}
        </h3>
        <p className="text-slate-600 text-sm line-clamp-2 mb-3">
          {listing.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={listing.profiles?.profile_photo || '/default-avatar.png'}
              alt={listing.profiles?.full_name}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="text-xs text-slate-500">
              {listing.profiles?.full_name || 'Kullanıcı'}
            </span>
          </div>
          {listing.price && (
            <span className="text-wb-green font-bold text-sm">
              {listing.price} ₺
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function Progress({ label, value, color }: any) {
  return (
    <div>
      <p className="text-sm text-slate-600 mb-2">{label}</p>
      <div className="w-full h-3 bg-wb-olive/10 rounded-full overflow-hidden">
        <div
          className={`${color} h-full transition-all duration-700`}
          style={{ width: `${value.toFixed(1)}%` }}
        ></div>
      </div>
      <p className="text-xs text-slate-500 mt-1 text-right">{value.toFixed(1)}%</p>
    </div>
  )
}

function formatK(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M+`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K+`
  return `${n}`
}