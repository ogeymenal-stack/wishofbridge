'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Clock, Loader2, Check, XCircle } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function PendingPage() {
  const [pending, setPending] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPending()
  }, [])

  const loadPending = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, status, created_at')
      .eq('status', 'pending')
    if (!error && data) setPending(data)
    setLoading(false)
  }

  const handleApprove = async (id: string) => {
    await supabase.from('posts').update({ status: 'active' }).eq('id', id)
    setPending((prev) => prev.filter((p) => p.id !== id))
  }

  const handleReject = async (id: string) => {
    await supabase.from('posts').update({ status: 'rejected' }).eq('id', id)
    setPending((prev) => prev.filter((p) => p.id !== id))
  }

  if (loading)
    return (
      <div className="flex items-center justify-center h-96 text-wb-olive">
        <Loader2 className="animate-spin mr-2" /> Bekleyen içerikler yükleniyor...
      </div>
    )

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-wb-olive mb-6 flex items-center gap-2">
        <Clock size={20} /> Bekleyen İçerikler
      </h1>

      {pending.length === 0 ? (
        <p className="text-gray-500 text-sm">Bekleyen içerik bulunmuyor.</p>
      ) : (
        <div className="overflow-x-auto bg-white border rounded-xl shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-wb-cream text-wb-olive uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Başlık</th>
                <th className="px-4 py-3 text-center">Tarih</th>
                <th className="px-4 py-3 text-center">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pending.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3">{p.title}</td>
                  <td className="px-4 py-3 text-center">
                    {new Date(p.created_at).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-4 py-3 text-center space-x-2">
                    <button
                      onClick={() => handleApprove(p.id)}
                      className="inline-flex items-center text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      <Check size={12} className="mr-1" /> Onayla
                    </button>
                    <button
                      onClick={() => handleReject(p.id)}
                      className="inline-flex items-center text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      <XCircle size={12} className="mr-1" /> Reddet
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
