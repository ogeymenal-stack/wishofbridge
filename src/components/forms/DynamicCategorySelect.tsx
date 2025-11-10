'use client'

import { useEffect, useState } from 'react'
import { getCategories, getMainCategories, getSubCategories } from '@/lib/getCategories'

type CategoryRow = {
  id: number
  name: string
  slug?: string | null
}

interface Props {
  defaultCategorySlug: 'sale' | 'help' | 'gift'
}

export default function DynamicCategorySelect({ defaultCategorySlug }: Props) {
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [mainCategories, setMainCategories] = useState<CategoryRow[]>([])
  const [subCategories, setSubCategories] = useState<CategoryRow[]>([])

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [selectedMain, setSelectedMain] = useState<number | null>(null)
  const [selectedSub, setSelectedSub] = useState<number | null>(null)

  // İlk yükleme: kategoriyi default sluga göre bul (slug yoksa name'e fallback)
  useEffect(() => {
    const load = async () => {
      const cats: any[] = await getCategories()
      // cats elemanlarını güvenli tipe çevir
      const normalized: CategoryRow[] = (cats || []).map((c: any) => ({
        id: Number(c.id),
        name: String(c.name ?? ''),
        slug: c.slug ?? null,
      }))
      setCategories(normalized)

      const found =
        normalized.find((c) => (c.slug ?? '').toLowerCase() === defaultCategorySlug) ||
        normalized.find((c) => c.name?.toLowerCase() === defaultCategorySlug)

      if (found) {
        setSelectedCategory(found.id)
        const mains: any[] = await getMainCategories(found.id)
        const normalizedMains: CategoryRow[] = (mains || []).map((m: any) => ({
          id: Number(m.id),
          name: String(m.name ?? ''),
          slug: m.slug ?? null,
        }))
        setMainCategories(normalizedMains)
      }
    }

    load()
  }, [defaultCategorySlug])

  // Ana kategori değişince alt kategorileri getir
  useEffect(() => {
    if (!selectedMain) {
      setSubCategories([])
      setSelectedSub(null)
      return
    }

    const loadSubs = async () => {
      const subs: any[] = await getSubCategories(selectedMain)
      const normalizedSubs: CategoryRow[] = (subs || []).map((s: any) => ({
        id: Number(s.id),
        name: String(s.name ?? ''),
        slug: s.slug ?? null,
      }))
      setSubCategories(normalizedSubs)
    }

    loadSubs()
  }, [selectedMain])

  return (
    <div className="space-y-3">
      {/* Ana kategori listesi */}
      {mainCategories.length > 0 ? (
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700">Ana Kategori</label>
          <select
            value={selectedMain ?? ''}
            onChange={(e) => setSelectedMain(e.target.value ? Number(e.target.value) : null)}
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
      ) : (
        <p className="text-slate-500 text-sm italic">Yükleniyor...</p>
      )}

      {/* Alt kategori listesi */}
      {subCategories.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700">Alt Kategori</label>
          <select
            value={selectedSub ?? ''}
            onChange={(e) => setSelectedSub(e.target.value ? Number(e.target.value) : null)}
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
    </div>
  )
}
