'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import {
  Mail,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AdminContactPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState<boolean | null>(null)

  // 🔐 Yetki kontrolü
  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.auth.getUser()
      const user = data?.user
      if (!user) {
        window.location.href = '/'
        return
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      if (!profile || (profile.role !== 'admin' && profile.role !== 'moderator')) {
        alert('Bu sayfa yalnızca yöneticiler içindir.')
        window.location.href = '/'
        return
      }
      setAuthorized(true)
    })()
  }, [])

  useEffect(() => {
    if (authorized) {
      loadRequests()
      const channel = supabase
        .channel('contact-requests')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_requests' }, () =>
          loadRequests()
        )
        .subscribe()
      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [authorized])

  const loadRequests = async () => {
    const { data, error } = await supabase
      .from('contact_requests')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) console.error(error)
    setRequests(data || [])
    setLoading(false)
  }

  const updateStatus = async (id: string, newStatus: string) => {
    await supabase.from('contact_requests').update({ status: newStatus }).eq('id', id)
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    )
  }

  if (authorized === null)
    return (
      <div className="flex justify-center items-center h-96 text-wb-olive">
        <ShieldCheck className="animate-pulse mr-2" /> Yetki doğrulanıyor...
      </div>
    )

  if (loading)
    return (
      <div className="flex justify-center items-center h-96 text-wb-olive">
        <RefreshCw className="animate-spin mr-2" /> Talepler yükleniyor...
      </div>
    )

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-wb-olive flex items-center gap-2">
          <Mail size={20} /> İletişim Talepleri
        </h1>
        <button
          onClick={loadRequests}
          className="flex items-center gap-2 bg-wb-olive text-white px-4 py-2 rounded-lg hover:bg-wb-olive/90 text-sm"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Yenile
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b">
            <tr>
              <th className="py-2 px-4 text-left">Ad Soyad</th>
              <th className="py-2 px-4 text-left">E-posta</th>
              <th className="py-2 px-4 text-left">Konu</th>
              <th className="py-2 px-4 text-left">Durum</th>
              <th className="py-2 px-4 text-center">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <>
                <tr
                  key={req.id}
                  className="border-b hover:bg-gray-50 cursor-pointer transition"
                  onClick={() =>
                    setExpanded(expanded === req.id ? null : req.id)
                  }
                >
                  <td className="py-2 px-4">{req.name}</td>
                  <td className="py-2 px-4 text-wb-olive">{req.email}</td>
                  <td className="py-2 px-4">{req.subject}</td>
                  <td className="py-2 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        req.status === 'beklemede'
                          ? 'bg-yellow-100 text-yellow-700'
                          : req.status === 'çözüldü'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        updateStatus(req.id, 'çözüldü')
                      }}
                      className="text-green-600 hover:text-green-800"
                    >
                      <CheckCircle size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        updateStatus(req.id, 'beklemede')
                      }}
                      className="text-yellow-600 hover:text-yellow-800"
                    >
                      <Clock size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        updateStatus(req.id, 'gereksiz')
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <XCircle size={16} />
                    </button>
                    {expanded === req.id ? (
                      <ChevronUp size={16} className="inline ml-1 text-gray-500" />
                    ) : (
                      <ChevronDown
                        size={16}
                        className="inline ml-1 text-gray-400"
                      />
                    )}
                  </td>
                </tr>
                {expanded === req.id && (
                  <tr className="bg-gray-50 border-b">
                    <td colSpan={5} className="p-4 text-sm text-gray-700">
                      <strong>Mesaj:</strong>
                      <p className="mt-1 mb-2 text-gray-600 whitespace-pre-wrap">
                        {req.message}
                      </p>
                      {req.attachment_url && (
                        <a
                          href={req.attachment_url}
                          target="_blank"
                          className="text-wb-olive underline text-sm"
                        >
                          📎 Ek dosyayı görüntüle
                        </a>
                      )}
                      <div className="mt-2 text-xs text-gray-400">
                        {new Date(req.created_at).toLocaleString('tr-TR')}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-gray-400 py-8 italic">
                  Henüz iletişim talebi bulunmuyor.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
