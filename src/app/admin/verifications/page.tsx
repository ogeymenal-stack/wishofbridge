'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Loader2, CheckCircle, XCircle, ShieldCheck } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function VerificationsPage() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, username, email, verification_badges, status')
      setRows(data || [])
      setLoading(false)
    })()
  }, [])

  const verify = async (id: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ verification_badges: ['Doğrulanmış'] })
      .eq('id', id)
    if (error) alert(error.message)
    else setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, verification_badges: ['Doğrulanmış'] } : r))
    )
  }

  const unverify = async (id: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ verification_badges: [] })
      .eq('id', id)
    if (error) alert(error.message)
    else setRows((prev) => prev.map((r) => (r.id === id ? { ...r, verification_badges: [] } : r)))
  }

  if (loading)
    return (
      <div className="flex items-center justify-center h-96 text-wb-olive">
        <Loader2 className="animate-spin mr-2" /> Doğrulamalar yükleniyor...
      </div>
    )

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-wb-olive mb-6 flex items-center gap-2">
        <ShieldCheck /> Doğrulamalar
      </h1>

      <div className="overflow-x-auto border rounded-xl bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-wb-cream text-wb-olive uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Ad Soyad</th>
              <th className="px-4 py-3 text-left">E-posta</th>
              <th className="px-4 py-3 text-center">Durum</th>
              <th className="px-4 py-3 text-center">Doğrulama</th>
              <th className="px-4 py-3 text-center">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3">{r.full_name}</td>
                <td className="px-4 py-3">{r.email}</td>
                <td className="px-4 py-3 text-center">{r.status}</td>
                <td className="px-4 py-3 text-center">
                  {r.verification_badges?.includes('Doğrulanmış') ? '✔️' : '❌'}
                </td>
                <td className="px-4 py-3 text-center space-x-2">
                  {r.verification_badges?.includes('Doğrulanmış') ? (
                    <button
                      onClick={() => unverify(r.id)}
                      className="inline-flex items-center text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      <XCircle size={12} className="mr-1" /> Kaldır
                    </button>
                  ) : (
                    <button
                      onClick={() => verify(r.id)}
                      className="inline-flex items-center text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      <CheckCircle size={12} className="mr-1" /> Doğrula
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
