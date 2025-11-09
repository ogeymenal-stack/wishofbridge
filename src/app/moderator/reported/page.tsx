'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Flag, Loader2, EyeOff, CheckCircle } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ReportedPage() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, status, report_reason, created_at')
      .eq('status', 'reported')
    if (!error && data) setReports(data)
    setLoading(false)
  }

  const handleResolve = async (id: string) => {
    await supabase.from('posts').update({ status: 'active' }).eq('id', id)
    setReports((prev) => prev.filter((r) => r.id !== id))
  }

  const handleHide = async (id: string) => {
    await supabase.from('posts').update({ status: 'hidden' }).eq('id', id)
    setReports((prev) => prev.filter((r) => r.id !== id))
  }

  if (loading)
    return (
      <div className="flex items-center justify-center h-96 text-wb-olive">
        <Loader2 className="animate-spin mr-2" /> Raporlar yükleniyor...
      </div>
    )

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-wb-olive mb-6 flex items-center gap-2">
        <Flag size={20} /> Raporlanan İçerikler
      </h1>

      {reports.length === 0 ? (
        <p className="text-gray-500 text-sm">Raporlanan içerik yok.</p>
      ) : (
        <div className="overflow-x-auto bg-white border rounded-xl shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-wb-cream text-wb-olive uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Başlık</th>
                <th className="px-4 py-3 text-left">Sebep</th>
                <th className="px-4 py-3 text-center">Tarih</th>
                <th className="px-4 py-3 text-center">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {reports.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3">{r.title}</td>
                  <td className="px-4 py-3">{r.report_reason || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    {new Date(r.created_at).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-4 py-3 text-center space-x-2">
                    <button
                      onClick={() => handleResolve(r.id)}
                      className="inline-flex items-center text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      <CheckCircle size={12} className="mr-1" /> Onayla
                    </button>
                    <button
                      onClick={() => handleHide(r.id)}
                      className="inline-flex items-center text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      <EyeOff size={12} className="mr-1" /> Gizle
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
