'use client'

import { useEffect, useState } from 'react'
import { getCategories, getMainCategories, getSubCategories } from '@/lib/getCategories'

interface Props {
  categoryType: 'gift' | 'help' | 'sale'
  onFilterChange: (filters: {
    mainId?: number | null
    subId?: number | null
    search?: string
    sort?: string
  }) => void
}

export default function PostFilters({ categoryType, onFilterChange }: Props) {
  const [mainCategories, setMainCategories] = useState<any[]>([])
  const [subCategories, setSubCategories] = useState<any[]>([])
  const [selectedMain, setSelectedMain] = useState<number | null>(null)
  const [selectedSub, setSelectedSub] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')

  // kategori ve alt kategorileri yükle
  useEffect(() => {
    async function load() {
      const cats = await getCategories()
      const found = cats.find((c) => c.slug === categoryType)
      if (!found) return
      const mains = await getMainCategories(found.id)
      setMainCategories(mains)
    }
    load()
  }, [categoryType])

  useEffect(() => {
    async function loadSubs() {
      if (!selectedMain) {
        setSubCategories([])
        return
      }
      const subs = await getSubCategories(selectedMain)
      setSubCategories(subs)
    }
    loadSubs()
  }, [selectedMain])

  // filtre değişikliklerini parent’a bildir
  useEffect(() => {
    onFilterChange({ mainId: selectedMain, subId: selectedSub, search, sort })
  }, [selectedMain, selectedSub, search, sort, onFilterChange])

  return (
    <div className="bg-white/60 border border-wb-olive/30 rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-center">
      {/* Arama */}
      <input
        type="text"
        placeholder="Ara..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-1 border border-wb-olive/30 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-wb-olive/40"
      />

      {/* Ana kategori */}
      {mainCategories.length > 0 && (
        <select
          value={selectedMain ?? ''}
          onChange={(e) => {
            setSelectedMain(Number(e.target.value) || null)
            setSelectedSub(null)
          }}
          className="border border-wb-olive/30 rounded-xl px-3 py-2 bg-white"
        >
          <option value="">Ana kategori</option>
          {mainCategories.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      )}

      {/* Alt kategori */}
      {subCategories.length > 0 && (
        <select
          value={selectedSub ?? ''}
          onChange={(e) => setSelectedSub(Number(e.target.value) || null)}
          className="border border-wb-olive/30 rounded-xl px-3 py-2 bg-white"
        >
          <option value="">Alt kategori</option>
          {subCategories.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      )}

      {/* Sıralama */}
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        className="border border-wb-olive/30 rounded-xl px-3 py-2 bg-white"
      >
        <option value="newest">Yeni → Eski</option>
        <option value="oldest">Eski → Yeni</option>
        <option value="price_asc">Fiyat Artan</option>
        <option value="price_desc">Fiyat Azalan</option>
      </select>
    </div>
  )
}
