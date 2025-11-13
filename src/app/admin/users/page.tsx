'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import {
  Loader2,
  Search,
  ShieldCheck,
  RefreshCw,
  Download,
  Users,
  Ban,
  Clock,
  UserPlus,
  UserX,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Shield,
  Trash2,
} from 'lucide-react'
import UserDetailModal from '@/components/admin/UserDetailModal'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const PAGE_SIZE = 20

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
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

  // 📥 Kullanıcıları yükle
  useEffect(() => {
    if (!authorized) return

    const loadUsers = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })

        if (!error && data) {
          setUsers(data)
        }
      } catch (err) {
        console.error('Kullanıcı yükleme hatası:', err)
      } finally {
        setLoading(false)
      }
    }

    loadUsers()

    // 🔄 Real-time listener
    const channel = supabase
      .channel('profiles-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, (payload) => {
        setUsers((prev) => [payload.new, ...prev])
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, (payload) => {
        setUsers((prev) =>
          prev.map((user) => (user.id === payload.old.id ? { ...user, ...payload.new } : user))
        )
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'profiles' }, (payload) => {
        setUsers((prev) => prev.filter((user) => user.id !== payload.old.id))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [authorized])

  // 🧮 İstatistikler
  const stats = useMemo(() => {
    const total = users.length
    const active = users.filter((u) => (u.status === 'active' || !u.status) && !u.is_banned).length
    const suspended = users.filter((u) => u.status === 'suspended').length
    const pending = users.filter((u) => u.status === 'pending').length
    const admins = users.filter((u) => u.role === 'admin').length
    const moderators = users.filter((u) => u.role === 'moderator').length
    const banned = users.filter((u) => u.is_banned).length

    return { total, active, suspended, pending, admins, moderators, banned }
  }, [users])

  // 🔍 Filtreleme
  const filtered = useMemo(() => {
    let f = [...users]
    if (searchTerm) {
      f = f.filter(
        (u) =>
          u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.username?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    if (statusFilter !== 'all') f = f.filter((u) => u.status === statusFilter)
    if (roleFilter !== 'all') f = f.filter((u) => u.role === roleFilter)
    return f
  }, [users, searchTerm, statusFilter, roleFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => setPage(1), [searchTerm, statusFilter, roleFilter])

  // ⚙️ ROL DEĞİŞTİRME (güvenli .select ile)
  const handleRoleChange = async (userId: string, newRole: string) => {
    setActionLoading(userId)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)
        .select()

      if (error || !data?.length) {
        alert('Rol değiştirilemedi: ' + (error?.message || 'Bilinmeyen hata'))
        return
      }

      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))
    } catch (err: any) {
      alert('Rol değiştirme hatası: ' + err.message)
    } finally {
      setActionLoading(null)
    }
  }

  // ⛔ BAN İŞLEMİ (güvenli)
  const handleBan = async (userId: string, currentBanStatus: boolean) => {
    setActionLoading(userId)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ is_banned: !currentBanStatus })
        .eq('id', userId)
        .select()

      if (error || !data?.length) {
        alert('Ban işlemi başarısız: ' + (error?.message || 'Policy hatası olabilir.'))
        return
      }

      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, is_banned: !currentBanStatus } : user))
      )
    } catch (err: any) {
      alert('Ban hatası: ' + err.message)
    } finally {
      setActionLoading(null)
    }
  }

  // 🧩 ASKIYA ALMA (güvenli)
  const handleSuspend = async (userId: string, currentStatus: string) => {
    setActionLoading(userId)
    try {
      const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended'

      const { data, error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', userId)
        .select()

      if (error || !data?.length) {
        alert('Askıya alma başarısız: ' + (error?.message || 'Policy hatası olabilir.'))
        return
      }

      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, status: newStatus } : user))
      )
    } catch (err: any) {
      alert('Askıya alma hatası: ' + err.message)
    } finally {
      setActionLoading(null)
    }
  }

  // ✅ DOĞRULAMA (güvenli)
  const handleVerify = async (userId: string) => {
    setActionLoading(userId)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ verification_badges: ['Doğrulanmış'] })
        .eq('id', userId)
        .select()

      if (error || !data?.length) {
        alert('Doğrulama hatası: ' + (error?.message || 'Policy hatası olabilir.'))
        return
      }

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, verification_badges: ['Doğrulanmış'] } : user
        )
      )
    } catch (err: any) {
      alert('Doğrulama hatası: ' + err.message)
    } finally {
      setActionLoading(null)
    }
  }

  // 🗑️ KULLANICI SİLME (güvenli)
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) return

    setActionLoading(userId)
    try {
      await supabase.from('posts').delete().eq('user_id', userId)

      const { data, error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)
        .select()

      if (error || !data?.length) {
        alert('Kullanıcı silinemedi: ' + (error?.message || 'Policy veya yetki hatası.'))
        return
      }

      setUsers((prev) => prev.filter((u) => u.id !== userId))
      alert('✅ Kullanıcı başarıyla silindi!')
    } catch (err: any) {
      alert('Silme hatası: ' + err.message)
    } finally {
      setActionLoading(null)
    }
  }

  // 📥 Manuel yenileme
  const handleRefresh = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (!error && data) setUsers(data)
    setLoading(false)
  }

  // 📊 CSV Export
  const exportCSV = () => {
    if (filtered.length === 0) return alert('Aktarılacak veri yok.')
    const headers = ['ID', 'Ad Soyad', 'E-posta', 'Kullanıcı Adı', 'Durum', 'Rol', 'Ban', 'Kayıt']
    const rows = filtered.map((u) => [
      u.id,
      u.full_name,
      u.email,
      u.username,
      u.status,
      u.role,
      u.is_banned ? 'Evet' : 'Hayır',
      new Date(u.created_at).toLocaleDateString('tr-TR'),
    ])
    const csv =
      'data:text/csv;charset=utf-8,' + [headers, ...rows].map((r) => r.join(',')).join('\n')
    const link = document.createElement('a')
    link.setAttribute('href', encodeURI(csv))
    link.setAttribute('download', 'kullanicilar.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 🧱 Loading & yetki
  if (authorized === null)
    return (
      <div className="flex justify-center items-center h-96 text-wb-olive">
        <ShieldAlert className="animate-pulse mr-2" size={32} /> Yetki kontrolü yapılıyor...
      </div>
    )

  if (loading)
    return (
      <div className="flex justify-center items-center h-96 text-wb-olive">
        <Loader2 className="animate-spin mr-2" /> Kullanıcılar yükleniyor...
      </div>
    )

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-wb-olive mb-6 flex items-center gap-2">
        <Users size={22} /> Tüm Kullanıcılar
      </h1>

      {/* Sayaçlar */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        <StatCard icon={Users} label="Aktif" value={stats.active} color="text-green-600" />
        <StatCard icon={Ban} label="Askıya" value={stats.suspended} color="text-red-600" />
        <StatCard icon={Clock} label="Beklemede" value={stats.pending} color="text-yellow-600" />
        <StatCard icon={Shield} label="Admin" value={stats.admins} color="text-blue-600" />
        <StatCard icon={ShieldCheck} label="Moderatör" value={stats.moderators} color="text-purple-600" />
        <StatCard icon={UserX} label="Banlı" value={stats.banned} color="text-red-600" />
        <StatCard icon={UserPlus} label="Toplam" value={stats.total} color="text-wb-olive" />
      </div>

      {/* Filtreler */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Kullanıcı ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-2 border rounded-xl text-sm focus:ring-wb-olive focus:border-wb-olive"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-xl px-3 py-2 text-sm focus:ring-wb-olive focus:border-wb-olive"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="active">Aktif</option>
            <option value="suspended">Askıya Alınmış</option>
            <option value="pending">Beklemede</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border rounded-xl px-3 py-2 text-sm focus:ring-wb-olive focus:border-wb-olive"
          >
            <option value="all">Tüm Roller</option>
            <option value="user">Kullanıcı</option>
            <option value="moderator">Moderatör</option>
            <option value="admin">Admin</option>
          </select>

          <button
            onClick={handleRefresh}
            className="flex items-center gap-1 bg-wb-olive text-white px-3 py-2 rounded-xl text-sm hover:bg-wb-green transition"
          >
            <RefreshCw size={14} /> Yenile
          </button>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-1 bg-wb-green text-white px-3 py-2 rounded-xl text-sm hover:bg-wb-olive transition"
        >
          <Download size={14} /> CSV Aktar
        </button>
      </div>

      {/* Tablo */}
      {pageData.length === 0 ? (
        <p className="text-gray-500 text-center mt-10">Kullanıcı bulunamadı.</p>
      ) : (
        <>
          <div className="overflow-x-auto border rounded-xl bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-wb-cream text-wb-olive uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Ad Soyad</th>
                  <th className="px-4 py-3 text-left">E-posta</th>
                  <th className="px-4 py-3 text-left">Kullanıcı Adı</th>
                  <th className="px-4 py-3 text-center">Durum</th>
                  <th className="px-4 py-3 text-center">Rol</th>
                  <th className="px-4 py-3 text-center">Ban</th>
                  <th className="px-4 py-3 text-center">Kayıt</th>
                  <th className="px-4 py-3 text-center">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageData.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedUserId(user.id)}
                        className="text-wb-olive hover:underline"
                      >
                        {user.full_name || '—'}
                      </button>
                    </td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">@{user.username || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-4 py-3 text-center capitalize">{user.role || 'user'}</td>
                    <td className="px-4 py-3 text-center">
                      {user.is_banned ? (
                        <span className="text-red-600 font-semibold">⛔</span>
                      ) : (
                        <span className="text-green-600 font-semibold">✔</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {new Date(user.created_at).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-4 py-3 text-center space-x-2">
                      {actionLoading === user.id ? (
                        <Loader2 className="animate-spin inline text-wb-olive" size={14} />
                      ) : (
                        <>
                          <button
                            onClick={() => handleSuspend(user.id, user.status)}
                            className="inline-flex items-center text-xs px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                          >
                            <UserX size={12} className="mr-1" />
                            {user.status === 'suspended' ? 'Aktif Et' : 'Askıya Al'}
                          </button>

                          <button
                            onClick={() => handleBan(user.id, user.is_banned)}
                            className="inline-flex items-center text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                          >
                            <Ban size={12} className="mr-1" />
                            {user.is_banned ? 'Ban Kaldır' : 'Banla'}
                          </button>

                          <button
                            onClick={() => {
                              const newRole =
                                user.role === 'user'
                                  ? 'moderator'
                                  : user.role === 'moderator'
                                  ? 'admin'
                                  : 'user'
                              handleRoleChange(user.id, newRole)
                            }}
                            className="inline-flex items-center text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                          >
                            <ShieldCheck size={12} className="mr-1" />
                            Rol Değiştir
                          </button>

                          {!user.verification_badges?.includes('Doğrulanmış') && (
                            <button
                              onClick={() => handleVerify(user.id)}
                              className="inline-flex items-center text-xs px-2 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                            >
                              <UserCheck size={12} className="mr-1" />
                              Doğrula
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="inline-flex items-center text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                            title="Kullanıcıyı Sil"
                          >
                            <Trash2 size={12} className="mr-1" />
                            Sil
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sayfalama */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-gray-500">
              {filtered.length} kayıttan {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, filtered.length)} arası gösteriliyor
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded border text-sm disabled:opacity-50 flex items-center gap-1"
              >
                <ChevronLeft size={14} /> Geri
              </button>
              <span className="text-sm">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded border text-sm disabled:opacity-50 flex items-center gap-1"
              >
                İleri <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Detay Modal */}
      {selectedUserId && (
        <UserDetailModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <h2 className="text-xl font-bold text-wb-olive">{value}</h2>
      </div>
      <Icon className={`${color}`} size={24} />
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: any = {
    active: 'bg-green-100 text-green-700',
    suspended: 'bg-red-100 text-red-700',
    pending: 'bg-yellow-100 text-yellow-700',
  }
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs ${map[status] || 'bg-gray-100 text-gray-600'}`}
    >
      {status || 'active'}
    </span>
  )
}
