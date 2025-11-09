'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Mail, Loader2, Trash } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ModeratorContactPage() {
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    const { data, error } = await supabase.from('contact_requests').select('*').order('created_at', { ascending: false })
    if (!error && data) setContacts(data)
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    await supabase.from('contact_requests').delete().eq('id', id)
    setContacts((prev) => prev.filter((c) => c.id !== id))
  }

  if (loading)
    return (
      <div className="flex justify-center items-center h-96 text-wb-olive">
        <Loader2 className="animate-spin mr-2" /> İletişim talepleri yükleniyor...
      </div>
    )

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-wb-olive mb-6 flex items-center gap-2">
        <Mail size={20} /> İletişim Talepleri
      </h1>

      {contacts.length === 0 ? (
        <p className="text-gray-500 text-sm">Hiç iletişim talebi bulunmuyor.</p>
      ) : (
        <div className="overflow-x-auto bg-white border rounded-xl shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-wb-cream text-wb-olive uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Ad Soyad</th>
                <th className="px-4 py-3 text-left">E-posta</th>
                <th className="px-4 py-3 text-left">Mesaj</th>
                <th className="px-4 py-3 text-center">Tarih</th>
                <th className="px-4 py-3 text-center">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {contacts.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3">{c.name}</td>
                  <td className="px-4 py-3">{c.email}</td>
                  <td className="px-4 py-3">{c.message}</td>
                  <td className="px-4 py-3 text-center">
                    {new Date(c.created_at).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="inline-flex items-center text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      <Trash size={12} className="mr-1" /> Sil
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
