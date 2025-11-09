'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ReportedPage() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      const { data } = await supabase
        .from('reports')
        .select('id, reporter_id, reported_item_id, reported_item_type, report_reason, status, created_at')
        .order('created_at', { ascending: false })
      setRows(data || [])
      setLoading(false)
    })()
  }, [])

  const setStatus = async (id: string, status: 'reviewed' | 'resolved') => {
    const { error } = await supabase.from('reports').update({ status }).eq('id', id)
    if (error) alert(error.message)
    else setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
  }

  if (loading)
    return (
      <div className="flex items-center justify-center h-96 text-wb-olive">
        <Loader2 className="animate-spin mr-2" /> Raporlar yükleniyor...
      </div>
    )

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-wb-olive mb-6">🚨 Raporlanan İçerik</h1>

      {rows.length === 0 ? (
        <p className="text-gray-500">Kayıt yok.</p>
      ) : (
        <div className="overflow-x-auto border rounded-xl bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-wb-cream text-wb-olive uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Öğe</th>
                <th className="px-4 py-3 text-center">Tür</th>
                <th className="px-4 py-3 text-center">Sebep</th>
                <th className="px-4 py-3 text-center">Durum</th>
                <th className="px-4 py-3 text-center">Tarih</th>
                <th className="px-4 py-3 text-center">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3">{r.reported_item_id}</td>
                  <td className="px-4 py-3 text-center">{r.reported_item_type}</td>
                  <td className="px-4 py-3 text-center">{r.report_reason}</td>
                  <td className="px-4 py-3 text-center">{r.status}</td>
                  <td className="px-4 py-3 text-center">
                    {new Date(r.created_at).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-4 py-3 text-center space-x-2">
                    <button
                      onClick={() => setStatus(r.id, 'reviewed')}
                      className="inline-flex items-center text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                    >
                      <XCircle size={12} className="mr-1" />
                      İncelendi
                    </button>
                    <button
                      onClick={() => setStatus(r.id, 'resolved')}
                      className="inline-flex items-center text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      <CheckCircle size={12} className="mr-1" />
                      Çözüldü
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
