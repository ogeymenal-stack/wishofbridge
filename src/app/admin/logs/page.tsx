'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Loader2, Activity, RefreshCw, Clock } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLogs()
  }, [])

  const loadLogs = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('admin_logs')
      .select(`
        id,
        action,
        details,
        created_at,
        performed_by:profiles!admin_logs_performed_by_fkey(full_name, email),
        target_user:profiles!admin_logs_target_user_id_fkey(full_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(100)

    if (!error && data) setLogs(data)
    setLoading(false)
  }

  if (loading)
    return (
      <div className="flex justify-center items-center h-96 text-wb-olive">
        <Loader2 className="animate-spin mr-2" /> Loglar yükleniyor...
      </div>
    )

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-wb-olive mb-6 flex items-center gap-2">
        <Activity size={22} /> Sistem Logları
      </h1>

      <div className="flex justify-end mb-4">
        <button
          onClick={loadLogs}
          className="flex items-center gap-2 border border-wb-olive text-wb-olive px-4 py-2 rounded-lg text-sm hover:bg-wb-cream transition"
        >
          <RefreshCw size={14} /> Yenile
        </button>
      </div>

      {logs.length === 0 ? (
        <p className="text-center text-gray-500">Kayıtlı işlem bulunamadı.</p>
      ) : (
        <div className="overflow-x-auto border rounded-xl bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-wb-cream text-wb-olive uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">İşlem</th>
                <th className="px-4 py-3 text-left">Yapan</th>
                <th className="px-4 py-3 text-left">Hedef</th>
                <th className="px-4 py-3 text-left">Detay</th>
                <th className="px-4 py-3 text-center">Tarih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-wb-olive">{log.action}</td>
                  <td className="px-4 py-3">
                    {log.performed_by?.full_name || '—'}
                    <span className="block text-xs text-gray-500">{log.performed_by?.email}</span>
                  </td>
                  <td className="px-4 py-3">
                    {log.target_user?.full_name || '—'}
                    <span className="block text-xs text-gray-500">{log.target_user?.email}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{log.details || '—'}</td>
                  <td className="px-4 py-3 text-center text-gray-500 flex items-center justify-center gap-1">
                    <Clock size={12} />
                    {new Date(log.created_at).toLocaleString('tr-TR')}
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
