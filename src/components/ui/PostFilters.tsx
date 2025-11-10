'use client'

import { useEffect, useState } from 'react'
import { getCategories } from '@/lib/getCategories'

type CategoryRow = {
  id: number
  name: string
  slug?: string | null
}

interface Props {
  /** sayfa özel tür (örnek: "gift", "help", "sale") */
  categoryType?: 'gift' | 'help' | 'sale' | 'all'
  /** filtreler değiştiğinde çağrılır */
  onFilterChange?: (filters: any) => void
  /** satış sayfası dışında fiyat filtrelerini gizle */
  showPriceForSaleOnly?: boolean
}

export default function PostFilters({
  categoryType = 'all',
  onFilterChange,
  showPriceForSaleOnly = true,
}: Props) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest')
  const [mainId, setMainId] = useState<number | null>(null)
  const [subId, setSubId] = useState<number | null>(null)
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  // kategori verisini yükle
  useEffect(() => {
    const load = async () => {
      const cats: any[] = await getCategories()
      const normalized = (cats || []).map((c: any) => ({
        id: Number(c.id),
        name: String(c.name ?? ''),
        slug: c.slug ?? null,
      }))
      setCategories(normalized)
    }
    load()
  }, [])

  // filtre değişince üst bileşene bildir
  useEffect(() => {
    onFilterChange?.({
      search,
      sort,
      mainId,
      subId,
      minPrice,
      maxPrice,
    })
  }, [search, sort, mainId, subId, minPrice, maxPrice, onFilterChange])

  const showPrice = !showPriceForSaleOnly || categoryType === 'sale'

  return (
    <div className="flex flex-col md:flex-row flex-wrap gap-3 mb-4">
      {/* 🔍 Arama */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Ara..."
        className="w-full md:w-60 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-wb-olive/40"
      />

      {/* 📂 Kategori seçimi */}
      <select
        value={mainId ?? ''}
        onChange={(e) => setMainId(e.target.value ? Number(e.target.value) : null)}
        className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-wb-olive/40"
      >
        <option value="">Kategori</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {/* 💰 Fiyat filtreleri (sadece satışta göster) */}
      {showPrice && (
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min ₺"
            className="w-24 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-wb-olive/40"
          />
          <span className="text-slate-400">–</span>
          <input
            type="number"
            min={0}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max ₺"
            className="w-24 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-wb-olive/40"
          />
        </div>
      )}

      {/* 🔽 Sıralama */}
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value as 'newest' | 'oldest')}
        className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-wb-olive/40"
      >
        <option value="newest">Yeniden Eskiye</option>
        <option value="oldest">Eskiden Yeniye</option>
      </select>
    </div>
  )
}
