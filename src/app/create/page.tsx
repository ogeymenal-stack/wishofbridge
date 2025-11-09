'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Send, Loader2, ImagePlus } from 'lucide-react'

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Cat = {
  id: number
  name: string
  slug: string
  parent_id: number | null
  type: 'gift' | 'sale' | 'help'
}

export default function CreatePage() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // kategori seviyeleri
  const [level1, setLevel1] = useState<Cat[]>([])
  const [level2, setLevel2] = useState<Cat[]>([])
  const [level3, setLevel3] = useState<Cat[]>([])

  // seçimler
  const [sel1, setSel1] = useState<string>('')
  const [sel2, setSel2] = useState<string>('')
  const [sel3, setSel3] = useState<string>('')

  // form alanları
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')

  // 📍 Konum
  const [location, setLocation] = useState('')
  const [showLocation, setShowLocation] = useState(true)

  // 📷 Görseller (max 5)
  const [files, setFiles] = useState<File[]>([])
  const [preview, setPreview] = useState<string[]>([])

  // gift / help özel alanları
  const [giftIntent, setGiftIntent] = useState<'offer' | 'request' | ''>('')
  const [helpIntent, setHelpIntent] = useState<'offer' | 'request' | ''>('')
  const [helpType, setHelpType] = useState<'maddi' | 'ayni' | ''>('')

  // oturum kontrolü
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) router.push('/login')
      else setSession(data.session)
    })()
  }, [router])

  // 1. seviye kategoriler (parent_id IS NULL)
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id,name,slug,parent_id,type')
        .is('parent_id', null)
        .order('name')
      if (!error && data) setLevel1(data as Cat[])
    })()
  }, [])

  // 2. seviye
  useEffect(() => {
    if (!sel1) { setLevel2([]); setSel2(''); return }
    (async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id,name,slug,parent_id,type')
        .eq('parent_id', sel1)
        .order('name')
      if (!error) setLevel2((data || []) as Cat[])
    })()
  }, [sel1])

  // 3. seviye
  useEffect(() => {
    if (!sel2) { setLevel3([]); setSel3(''); return }
    (async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id,name,slug,parent_id,type')
        .eq('parent_id', sel2)
        .order('name')
      if (!error) setLevel3((data || []) as Cat[])
    })()
  }, [sel2])

  // seçilen en derin kategori
  const finalCategoryId = useMemo(() => sel3 || sel2 || sel1 || '', [sel1, sel2, sel3])

  // seçilen type (gift/sale/help) — en derindeki tip öncelikli
  const [currentType, setCurrentType] = useState<'gift' | 'sale' | 'help' | ''>('')

  useEffect(() => {
    (async () => {
      if (!finalCategoryId) { setCurrentType(''); return }
      const { data } = await supabase
        .from('categories')
        .select('type')
        .eq('id', finalCategoryId)
        .single()
      setCurrentType((data?.type as any) || '')
    })()
  }, [finalCategoryId])

  // 📸 Dosya seçimi (max 5)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])
    if (selected.length + files.length > 5) {
      alert('En fazla 5 görsel yükleyebilirsiniz.')
      return
    }
    setFiles((prev) => [...prev, ...selected])
    const newPreviews = selected.map((f) => URL.createObjectURL(f))
    setPreview((prev) => [...prev, ...newPreviews])
  }

  // 🔥 Form gönderimi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const user = session?.user
    if (!user) return alert('Oturum bulunamadı!')
    if (!finalCategoryId) return alert('Lütfen kategori seçin.')
    if (!title.trim()) return alert('Başlık gerekli.')

    // intent / yardım tipi
    let intent: 'offer' | 'request' | null = null
    let help_kind: 'maddi' | 'ayni' | null = null

    if (currentType === 'gift') {
      if (!giftIntent) return alert('Lütfen hediye türünü seçin.')
      intent = giftIntent
    }

    if (currentType === 'help') {
      if (!helpIntent) return alert('Lütfen yardım türünü seçin.')
      intent = helpIntent
      if (!helpType) return alert('Lütfen yardım tipini seçin.')
      help_kind = helpType
    }

    setLoading(true)

    // 📤 Görselleri Supabase Storage’a yükle
    const uploadedUrls: string[] = []
    if (files.length > 0) {
      for (const [idx, file] of files.entries()) {
        const safeName = file.name.replace(/[^\w.\-]/g, '_')
        const path = `${user.id}/${Date.now()}-${idx}-${safeName}`
        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(path, file, { upsert: false })
        if (uploadError) {
          console.error('upload error', uploadError)
          setLoading(false)
          return alert(`Görsel yüklenemedi: ${uploadError.message}`)
        }
        const { data: pub } = supabase.storage.from('post-images').getPublicUrl(path)
        uploadedUrls.push(pub.publicUrl)
      }
    }

    const { error } = await supabase
      .from('posts')
      .insert([
        {
          user_id: user.id,
          category_id: Number(finalCategoryId),
          title: title.trim(),
          description: description.trim() || null,
          price: currentType === 'sale' && price ? Number(price) : null,
          type: currentType || null,
          intent,
          help_type: help_kind,
          location: location.trim() || null,
          show_location: showLocation,
          images: uploadedUrls,
          status: 'pending',
        },
      ])

    setLoading(false)

    if (error) {
      console.error('Insert error:', error)
      alert(`Gönderi oluşturulamadı: ${error.message}`)
      return
    }

    alert('🎉 Gönderi başarıyla oluşturuldu!')
    router.push('/')
  }

  return (
    <section className="max-w-3xl mx-auto py-10">
      <h1 className="text-3xl font-bold text-center mb-8 text-wb-olive">
        Yeni İçerik Oluştur
      </h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-md space-y-6">
        {/* 1. seviye */}
        <div>
          <label className="block mb-2 font-medium">Ana Kategori</label>
          <select
            className="w-full border p-2 rounded-md"
            value={sel1}
            onChange={(e) => {
              setSel1(e.target.value)
              setSel2('')
              setSel3('')
            }}
          >
            <option value="">Seçiniz</option>
            {level1.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* 2. seviye */}
        {level2.length > 0 && (
          <div>
            <label className="block mb-2 font-medium">Kategori</label>
            <select
              className="w-full border p-2 rounded-md"
              value={sel2}
              onChange={(e) => {
                setSel2(e.target.value)
                setSel3('')
              }}
            >
              <option value="">Seçiniz</option>
              {level2.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 3. seviye */}
        {level3.length > 0 && (
          <div>
            <label className="block mb-2 font-medium">Alt Kategori</label>
            <select
              className="w-full border p-2 rounded-md"
              value={sel3}
              onChange={(e) => setSel3(e.target.value)}
            >
              <option value="">Seçiniz</option>
              {level3.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Hediye özel alanı */}
        {currentType === 'gift' && (
          <div>
            <label className="block mb-2 font-medium">Hediye Türü</label>
            <div className="flex gap-4 flex-wrap">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="giftIntent"
                  value="offer"
                  checked={giftIntent === 'offer'}
                  onChange={() => setGiftIntent('offer')}
                />
                <span>Hediye veriyorum</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="giftIntent"
                  value="request"
                  checked={giftIntent === 'request'}
                  onChange={() => setGiftIntent('request')}
                />
                <span>Hediye istiyorum</span>
              </label>
            </div>
          </div>
        )}

        {/* Yardım özel alanı */}
        {currentType === 'help' && (
          <>
            <div>
              <label className="block mb-2 font-medium">Yardım Türü</label>
              <div className="flex gap-4 flex-wrap">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="helpIntent"
                    value="offer"
                    checked={helpIntent === 'offer'}
                    onChange={() => setHelpIntent('offer')}
                  />
                  <span>Yardım ediyorum</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="helpIntent"
                    value="request"
                    checked={helpIntent === 'request'}
                    onChange={() => setHelpIntent('request')}
                  />
                  <span>Yardım istiyorum</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block mb-2 font-medium">Yardım Tipi</label>
              <div className="flex gap-4 flex-wrap">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="helpType"
                    value="maddi"
                    checked={helpType === 'maddi'}
                    onChange={() => setHelpType('maddi')}
                  />
                  <span>Maddi Yardım</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="helpType"
                    value="ayni"
                    checked={helpType === 'ayni'}
                    onChange={() => setHelpType('ayni')}
                  />
                  <span>Ayni Yardım</span>
                </label>
              </div>
            </div>
          </>
        )}

        {/* Başlık */}
        <div>
          <label className="block mb-2 font-medium">Başlık</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Başlık girin..."
            className="w-full border p-2 rounded-md"
            required
          />
        </div>

        {/* Açıklama */}
        <div>
          <label className="block mb-2 font-medium">Açıklama</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Açıklama..."
            rows={4}
            className="w-full border p-2 rounded-md"
          />
        </div>

        {/* 📍 Konum */}
        <div>
          <label className="block mb-2 font-medium">Konum</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="İl / İlçe"
            className="w-full border p-2 rounded-md"
          />
          <label className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              checked={showLocation}
              onChange={() => setShowLocation(!showLocation)}
            />
            <span>Konum bilgisini göster</span>
          </label>
        </div>

        {/* 📷 Görsel yükleme (max 5) */}
        <div>
          <label className="block mb-2 font-medium flex items-center gap-2">
            <ImagePlus size={18} /> Görseller (max 5)
          </label>
          <input type="file" accept="image/*" multiple onChange={handleFileChange} />
          {preview.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-2">
              {preview.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`preview-${i}`}
                  className="w-20 h-20 object-cover rounded-md border"
                />
              ))}
            </div>
          )}
        </div>

        {/* Fiyat sadece satışta */}
        {currentType === 'sale' && (
          <div>
            <label className="block mb-2 font-medium">Fiyat</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="₺"
              className="w-full border p-2 rounded-md"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-md font-semibold flex items-center justify-center gap-2 ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-wb-olive hover:opacity-90 text-white'
          }`}
        >
          {loading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
          {loading ? 'Gönderiliyor...' : 'Gönder'}
        </button>

        {currentType && (
          <p className="text-xs text-slate-500 text-center mt-4">
            Seçilen tür:{' '}
            <strong>
              {currentType === 'gift' ? 'Hediye' : currentType === 'sale' ? 'Satış' : 'Yardımlaşma'}
            </strong>
          </p>
        )}
      </form>
    </section>
  )
}
