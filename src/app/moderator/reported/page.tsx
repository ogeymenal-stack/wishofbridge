'use client'

import ModeratorGuard from '@/components/moderator/ModeratorGuard'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function ReportedPage() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReports = async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('*, posts(title)')
        .order('created_at', { ascending: false })
      if (!error) setReports(data || [])
      setLoading(false)
    }
    fetchReports()
  }, [])

  if (loading) return <p>Yükleniyor...</p>

  return (
    <ModeratorGuard>
      <h1 className="text-xl font-semibold mb-4 text-wb-olive">🚨 Raporlanan Gönderiler</h1>
      {reports.length === 0 ? (
        <p className="text-slate-500 italic">Rapor bulunamadı.</p>
      ) : (
        <ul className="space-y-4">
          {reports.map((r) => (
            <li key={r.id} className="p-4 bg-white rounded-xl shadow">
              <h3 className="font-semibold">{r.posts?.title || 'Gönderi Silinmiş'}</h3>
              <p className="text-sm text-slate-600 mt-1">{r.reason}</p>
              <p className="text-xs text-slate-400 mt-1">{new Date(r.created_at).toLocaleString('tr-TR')}</p>
            </li>
          ))}
        </ul>
      )}
    </ModeratorGuard>
  )
}
