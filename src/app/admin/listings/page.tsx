'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Loader2, Search, RefreshCw, CheckCircle, XCircle, Trash2 } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const PAGE_SIZE = 20

export default function ListingsPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      const { data } = await supabase
        .from('posts')
        .select('id,title,type,status,price,created_at, user_id, categories(name)')
        .order('created_at', { ascending: false })
      setItems(data || [])
      setLoading(false)
    })()
  }, [])

  const filtered = useMemo(() => {
    let f = [...items]
    if (searchTerm) {
      f = f.filter((i) => i.title?.toLowerCase().includes(searchTerm.toLowerCase()))
    }
    if (typeFilter !== 'all') f = f.filter((i) => i.type === typeFilter)
    if (statusFilter !== 'all') f = f.filter((i) => i.status === statusFilter)
    return f
  }, [items, searchTerm, typeFilter, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => setPage(1), [searchTerm, typeFilter, statusFilter])

  const setStatus = async (id: string, status: string) => {
    setActionLoading(true)
    const { error } = await supabase.from('posts').update({ status }).eq('id', id)
    if (error) alert(error.message)
    else setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)))
    setActionLoading(false)
  }

  const remove = async (id: string) => {
    if (!confirm('Silmek istediğine emin misin?')) return
    setActionLoading(true)
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (error) alert(error.message)
    else setItems((prev) => prev.filter((i) => i.id !== id))
    setActionLoading(false)
  }

  if (loading)
    return (
      <div className="flex items-center justify-center h-96 text-wb-olive">
        <Loader2 className="animate-spin mr-2" /> İlanlar yükleniyor...
      </div>
    )

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-wb-olive mb-6">📦 Tüm İlanlar</h1>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="pl-8 pr-3 py-2 border rounded-xl text-sm focus:ring-wb-olive focus:border-wb-olive"
            placeholder="Başlık ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border rounded-xl px-3 py-2 text-sm"
        >
          <option value="all">Tüm Türler</option>
          <option value="gift">Hediye</option>
          <option value="sale">Satış</option>
          <option value="help">Yardım</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-xl px-3 py-2 text-sm"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="active">Aktif</option>
          <option value="pending">Beklemede</option>
          <option value="rejected">Reddedildi</option>
          <option value="sold">Satıldı/Tamamlandı</option>
        </select>

        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-1 bg-wb-olive text-white px-3 py-2 rounded-xl text-sm hover:bg-wb-green transition"
        >
          <RefreshCw size={14} /> Yenile
        </button>
      </div>

      {pageData.length === 0 ? (
        <p className="text-gray-500">Kayıt bulunamadı.</p>
      ) : (
        <div className="overflow-x-auto border rounded-xl bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-wb-cream text-wb-olive uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Başlık</th>
                <th className="px-4 py-3 text-center">Tür</th>
                <th className="px-4 py-3 text-center">Durum</th>
                <th className="px-4 py-3 text-center">Fiyat</th>
                <th className="px-4 py-3 text-center">Tarih</th>
                <th className="px-4 py-3 text-center">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pageData.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{p.title}</td>
                  <td className="px-4 py-3 text-center">{p.type}</td>
                  <td className="px-4 py-3 text-center">{p.status}</td>
                  <td className="px-4 py-3 text-center">{p.price ?? '—'}</td>
                  <td className="px-4 py-3 text-center">
                    {new Date(p.created_at).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-4 py-3 text-center space-x-2">
                    <button
                      onClick={() => setStatus(p.id, 'active')}
                      className="inline-flex items-center text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      <CheckCircle size={12} className="mr-1" />
                      Onayla
                    </button>
                    <button
                      onClick={() => setStatus(p.id, 'rejected')}
                      className="inline-flex items-center text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                    >
                      <XCircle size={12} className="mr-1" />
                      Reddet
                    </button>
                    <button
                      onClick={() => remove(p.id)}
                      className="inline-flex items-center text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      <Trash2 size={12} className="mr-1" />
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Paginator page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  )
}

function Paginator({ page, totalPages, onChange }: any) {
  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-xs text-gray-500">Sayfa {page} / {totalPages}</p>
      <div className="flex items-center gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="px-3 py-1.5 rounded border text-sm disabled:opacity-50"
        >
          Önceki
        </button>
        <button
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          className="px-3 py-1.5 rounded border text-sm disabled:opacity-50"
        >
          Sonraki
        </button>
      </div>
    </div>
  )
}
