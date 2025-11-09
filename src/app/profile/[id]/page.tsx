'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import {
  Loader2,
  Mail,
  MapPin,
  Globe,
  Shield,
  Star,
  Users,
  Gift,
  HeartHandshake,
  ShoppingCart,
  MessageCircle,
} from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ProfilePage() {
  const { id } = useParams()
  const [profile, setProfile] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('posts')
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tabLoading, setTabLoading] = useState(false)
  const [ratingInfo, setRatingInfo] = useState<{ avg: number; count: number }>({
    avg: 0,
    count: 0,
  })

  // Profil ve değerlendirme verilerini çek
  useEffect(() => {
    if (!id) return
    ;(async () => {
      const [{ data: profileData }, { data: reviewData }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', id).single(),
        supabase
          .from('user_reviews')
          .select('rating')
          .eq('reviewed_user_id', id),
      ])

      if (reviewData?.length) {
        const avg =
          reviewData.reduce((a, b) => a + b.rating, 0) / reviewData.length
        setRatingInfo({ avg, count: reviewData.length })
      }

      setProfile(profileData)
      setLoading(false)
    })()
  }, [id])

  // Sekme değişimiyle gönderileri çek
  const loadTabData = async (tab: string) => {
    setActiveTab(tab)
    setTabLoading(true)

    let query = supabase.from('posts').select('*').eq('user_id', id)
    if (tab === 'gifts') query = query.eq('type', 'gift')
    if (tab === 'help') query = query.eq('type', 'help')
    if (tab === 'sale') query = query.eq('type', 'sale')

    const { data } = await query.order('created_at', { ascending: false })
    setPosts(data || [])
    setTabLoading(false)
  }

  useEffect(() => {
    if (id) loadTabData('posts')
  }, [id])

  if (loading)
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin text-wb-olive" size={40} />
      </div>
    )

  if (!profile)
    return (
      <p className="text-center text-gray-500 py-10">
        Kullanıcı profili bulunamadı.
      </p>
    )

  return (
    <section className="max-w-6xl mx-auto my-10 px-4">
      {/* 📸 Kapak Fotoğrafı */}
      <div className="relative w-full h-48 bg-wb-cream rounded-xl overflow-hidden shadow-sm">
        {profile.cover_photo && (
          <img
            src={profile.cover_photo}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute -bottom-12 left-6 flex items-end gap-4">
          <img
            src={profile.profile_photo || '/default-avatar.png'}
            alt="Avatar"
            className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover"
          />
          <div>
            <h2 className="text-2xl font-semibold text-wb-olive flex items-center gap-2">
              {profile.full_name}
              {profile.verification_badges?.includes('Doğrulanmış') && (
                <Shield size={18} className="text-green-500" />
              )}
            </h2>
            <p className="text-gray-500">@{profile.username}</p>

            {/* ⭐ Ortalama Puan Kartı */}
            {ratingInfo.count > 0 ? (
              <div className="mt-2 flex items-center gap-2 bg-wb-green/10 text-wb-green px-3 py-1.5 rounded-full text-sm font-medium">
                <Star size={14} className="text-yellow-400" />
                <span>{ratingInfo.avg.toFixed(1)} / 5</span>
                <span className="text-gray-500 text-xs">
                  ({ratingInfo.count} değerlendirme)
                </span>
              </div>
            ) : (
              <div className="mt-2 text-xs text-gray-400 italic">
                Henüz değerlendirme yok
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🧾 Bilgiler */}
      <div className="bg-white mt-16 p-6 rounded-xl shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="flex items-center gap-2 text-gray-700">
              <Mail size={16} /> {profile.email || '—'}
            </p>
            {profile.location && (
              <p className="flex items-center gap-2 text-gray-700">
                <MapPin size={16} /> {profile.location}
              </p>
            )}
            {profile.website && (
              <p className="flex items-center gap-2 text-gray-700">
                <Globe size={16} />{' '}
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {profile.website}
                </a>
              </p>
            )}
          </div>
          {profile.bio && (
            <div>
              <p className="text-gray-600">
                <strong>Hakkımda:</strong> {profile.bio}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 🧭 Sekmeler */}
      <div className="bg-white mt-6 p-4 rounded-xl shadow-sm flex flex-wrap gap-3 justify-center text-sm font-medium">
        {[
          { id: 'posts', name: 'Tüm Gönderiler', icon: Users },
          { id: 'sale', name: 'Satışlarım', icon: ShoppingCart },
          { id: 'gifts', name: 'Hediyelerim', icon: Gift },
          { id: 'help', name: 'Yardımlarım', icon: HeartHandshake },
          { id: 'reviews', name: 'Değerlendirmeler', icon: Star },
          { id: 'messages', name: 'Mesajlar', icon: MessageCircle },
        ].map((tab) => {
          const Icon = tab.icon
          const active = tab.id === activeTab
          return (
            <button
              key={tab.id}
              onClick={() => loadTabData(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
                active
                  ? 'bg-wb-olive text-white shadow-sm'
                  : 'bg-wb-cream text-wb-olive hover:bg-wb-green/20'
              }`}
            >
              <Icon size={15} />
              {tab.name}
            </button>
          )
        })}
      </div>

      {/* 📋 Sekme İçeriği */}
      <div className="bg-white mt-6 p-6 rounded-xl shadow-sm">
        {tabLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin text-wb-olive" size={30} />
          </div>
        ) : activeTab === 'reviews' ? (
          <UserReviewsSection
            reviewedUserId={id as string}
            onReviewAdded={() => {
              // yeni yorum eklenirse ortalama güncellensin
              supabase
                .from('user_reviews')
                .select('rating')
                .eq('reviewed_user_id', id)
                .then(({ data }) => {
                  if (data?.length) {
                    const avg =
                      data.reduce((a, b) => a + b.rating, 0) / data.length
                    setRatingInfo({ avg, count: data.length })
                  }
                })
            }}
          />
        ) : activeTab === 'messages' ? (
          <div className="text-gray-500 text-center">
            Mesajlara gitmek için üst menüyü kullan.
          </div>
        ) : posts.length === 0 ? (
          <div className="text-gray-500 text-center">
            Bu sekmede hiç içerik yok.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="border border-wb-olive/20 rounded-xl overflow-hidden hover:shadow-md transition"
              >
                {post.image_urls && post.image_urls.length > 0 && (
                  <img
                    src={post.image_urls[0]}
                    alt={post.title}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-4">
                  <h4 className="font-semibold text-wb-olive text-lg mb-1">
                    {post.title}
                  </h4>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                    {post.description}
                  </p>
                  {post.price && (
                    <p className="text-wb-green font-bold text-sm">
                      {post.price} ₺
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(post.created_at).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

/* ---------------------------------------------
   🟩 Değerlendirme Bileşeni
--------------------------------------------- */
function UserReviewsSection({
  reviewedUserId,
  onReviewAdded,
}: {
  reviewedUserId: string
  onReviewAdded: () => void
}) {
  const [reviews, setReviews] = useState<any[]>([])
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' })
  const [user, setUser] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const { data: auth } = await supabase.auth.getUser()
      setUser(auth?.user)

      const { data } = await supabase
        .from('user_reviews')
        .select('*, reviewer:reviewer_id(full_name, profile_photo)')
        .eq('reviewed_user_id', reviewedUserId)
        .order('created_at', { ascending: false })
      setReviews(data || [])
      setLoading(false)
    })()
  }, [reviewedUserId])

  const handleSubmit = async () => {
    if (!user) return alert('Yorum yapabilmek için giriş yapmalısın.')
    if (!newReview.comment.trim()) return alert('Yorum metni boş olamaz.')

    setSubmitting(true)
    const { error } = await supabase.from('user_reviews').insert([
      {
        reviewer_id: user.id,
        reviewed_user_id: reviewedUserId,
        rating: newReview.rating,
        comment: newReview.comment,
      },
    ])
    setSubmitting(false)

    if (error) return alert('Yorum eklenemedi: ' + error.message)

    setReviews([
      {
        reviewer: { full_name: user.user_metadata.full_name || 'Anonim' },
        rating: newReview.rating,
        comment: newReview.comment,
        created_at: new Date(),
      },
      ...reviews,
    ])
    setNewReview({ rating: 5, comment: '' })
    onReviewAdded()
  }

  if (loading)
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="animate-spin text-wb-olive" size={30} />
      </div>
    )

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1)
      : null

  return (
    <div>
      <h3 className="text-lg font-semibold text-wb-olive mb-4">
        Kullanıcı Değerlendirmeleri
      </h3>

      {avgRating ? (
        <div className="mb-6">
          <p className="text-2xl font-bold text-wb-green">{avgRating} / 5</p>
          <p className="text-gray-500 text-sm">
            {reviews.length} değerlendirme
          </p>
        </div>
      ) : (
        <p className="text-gray-500 mb-6">
          Henüz değerlendirme yapılmamış.
        </p>
      )}

      {/* Yeni yorum formu */}
      <div className="border border-wb-olive/20 rounded-xl p-4 mb-6">
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Puan:
        </label>
        <select
          value={newReview.rating}
          onChange={(e) =>
            setNewReview({ ...newReview, rating: Number(e.target.value) })
          }
          className="border rounded-lg px-2 py-1 mb-3"
        >
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {r} Yıldız
            </option>
          ))}
        </select>

        <textarea
          rows={3}
          value={newReview.comment}
          onChange={(e) =>
            setNewReview({ ...newReview, comment: e.target.value })
          }
          placeholder="Deneyimini paylaş..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3 focus:ring-wb-olive focus:border-wb-olive"
        />
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-wb-olive text-white px-4 py-2 rounded-lg hover:bg-wb-green transition"
        >
          {submitting ? 'Gönderiliyor...' : 'Yorumu Gönder'}
        </button>
      </div>

      {/* Yorum listesi */}
      <div className="space-y-4">
        {reviews.map((r) => (
          <div
            key={r.id}
            className="border border-wb-olive/10 rounded-xl p-4 bg-wb-cream/30"
          >
            <div className="flex items-center gap-3 mb-2">
              <img
                src={r.reviewer?.profile_photo || '/default-avatar.png'}
                alt={r.reviewer?.full_name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-medium text-wb-olive">
                  {r.reviewer?.full_name || 'Anonim'}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(r.created_at).toLocaleDateString('tr-TR')}
                </p>
              </div>
            </div>
            <p className="text-yellow-500 mb-1">{'⭐'.repeat(r.rating)}</p>
            <p className="text-gray-700 text-sm">{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
