'use client'

import { useEffect, useState } from 'react'
import { getCategories, getMainCategories, getSubCategories } from '@/lib/getCategories'

// ✅ Type tanımlamaları
interface Category {
  id: number
  name: string
  slug?: string  // ✅ Optional yapıldı
}

interface Props {
  defaultCategorySlug: 'sale' | 'help' | 'gift'
}

export default function DynamicCategorySelect({ defaultCategorySlug }: Props) {
  const [categories, setCategories] = useState<Category[]>([])
  const [mainCategories, setMainCategories] = useState<Category[]>([])
  const [subCategories, setSubCategories] = useState<Category[]>([])

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [selectedMain, setSelectedMain] = useState<number | null>(null)
  const [selectedSub, setSelectedSub] = useState<number | null>(null)

  // 🔹 İlk yüklemede kategoriyi otomatik seç
  useEffect(() => {
    const load = async () => {
      const cats = await getCategories()
      setCategories(cats)

      // ✅ Slug kontrolünü güvenli hale getir
      const found = cats.find((c) => 
        c.slug === defaultCategorySlug || 
        c.name?.toLowerCase() === defaultCategorySlug?.toLowerCase()
      )
      if (found) {
        setSelectedCategory(found.id)
        // Kategori bulunur bulunmaz ana kategorileri getir
        const mains = await getMainCategories(found.id)
        setMainCategories(mains)
      }
    }

    load()
  }, [defaultCategorySlug])

  // 🔹 Ana kategori seçildiğinde alt kategorileri yükle
  useEffect(() => {
    if (!selectedMain) {
      setSubCategories([])
      return
    }

    const loadSubs = async () => {
      const subs = await getSubCategories(selectedMain)
      setSubCategories(subs)
    }

    loadSubs()
  }, [selectedMain])

  return (
    <div className="space-y-3">
      {/* Ana kategori */}
      {mainCategories.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700">Ana Kategori</label>
          <select
            value={selectedMain ?? ''}
            onChange={(e) => setSelectedMain(Number(e.target.value))}
            className="w-full rounded-xl border border-wb-olive/40 bg-white/70 px-3 py-2 outline-none focus:ring-2 focus:ring-wb-olive/40"
          >
            <option value="">Seçiniz</option>
            {mainCategories.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Alt kategori */}
      {subCategories.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700">Alt Kategori</label>
          <select
            value={selectedSub ?? ''}
            onChange={(e) => setSelectedSub(Number(e.target.value))}
            className="w-full rounded-xl border border-wb-olive/40 bg-white/70 px-3 py-2 outline-none focus:ring-2 focus:ring-wb-olive/40"
          >
            <option value="">Seçiniz</option>
            {subCategories.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Eğer hiç ana kategori yoksa bilgi mesajı */}
      {mainCategories.length === 0 && (
        <p className="text-slate-500 text-sm italic">Yükleniyor...</p>
      )}
    </div>
  )
}