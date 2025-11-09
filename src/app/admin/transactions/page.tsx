'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Loader2 } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function TransactionsPage() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
      setRows(data || [])
      setLoading(false)
    })()
  }, [])

  if (loading)
    return (
      <div className="flex items-center justify-center h-96 text-wb-olive">
        <Loader2 className="animate-spin mr-2" /> İşlemler yükleniyor...
      </div>
    )

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-wb-olive mb-6">💳 İşlemler</h1>
      {rows.length === 0 ? (
        <p className="text-gray-500">Kayıt yok.</p>
      ) : (
        <div className="overflow-x-auto border rounded-xl bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-wb-cream text-wb-olive uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-center">Kullanıcı</th>
                <th className="px-4 py-3 text-center">Tutar</th>
                <th className="px-4 py-3 text-center">Tür</th>
                <th className="px-4 py-3 text-center">Durum</th>
                <th className="px-4 py-3 text-center">Tarih</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3">{r.id}</td>
                  <td className="px-4 py-3 text-center">{r.user_id}</td>
                  <td className="px-4 py-3 text-center">{r.amount}</td>
                  <td className="px-4 py-3 text-center">{r.type}</td>
                  <td className="px-4 py-3 text-center">{r.status}</td>
                  <td className="px-4 py-3 text-center">
                    {new Date(r.created_at).toLocaleDateString('tr-TR')}
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
