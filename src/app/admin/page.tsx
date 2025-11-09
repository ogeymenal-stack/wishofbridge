'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import {
  LayoutDashboard,
  Users,
  Package,
  CreditCard,
  HeartHandshake,
} from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const COLORS = ['#10B981', '#3B82F6', '#F59E0B']

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>({})
  const [chartData, setChartData] = useState<any[]>([])
  const [trendData, setTrendData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    const { data: users } = await supabase.from('profiles').select('id')
    const { data: posts } = await supabase.from('posts').select('*')

    const totalUsers = users?.length || 0
    const activeListings = posts?.filter((p) => p.status === 'active').length || 0
    const totalSales = posts?.filter((p) => p.type === 'sale').length || 0
    const totalGifts = posts?.filter((p) => p.type === 'gift').length || 0
    const totalHelp = posts?.filter((p) => p.type === 'help').length || 0

    setStats({
      totalUsers,
      activeListings,
      totalSales,
      totalGifts,
      totalHelp,
      growth: '+8%',
      revenueToday: '₺8.452',
    })

    setChartData([
      { name: 'Hediye', value: totalGifts },
      { name: 'Satış', value: totalSales },
      { name: 'Yardım', value: totalHelp },
    ])

    const now = new Date()
    const fakeTrend = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(now)
      d.setDate(now.getDate() - (6 - i))
      return {
        date: d.toLocaleDateString('tr-TR', { weekday: 'short' }),
        users: Math.floor(Math.random() * 50 + 100),
        posts: Math.floor(Math.random() * 40 + 80),
      }
    })
    setTrendData(fakeTrend)
    setLoading(false)
  }

  if (loading)
    return (
      <div className="flex justify-center items-center h-96 text-wb-olive">
        Yükleniyor...
      </div>
    )

  const widgets = [
    { title: 'Toplam Kullanıcı', value: stats.totalUsers, trend: stats.growth, icon: Users },
    { title: 'Aktif İlanlar', value: stats.activeListings, trend: '+5%', icon: Package },
    { title: 'Bugünkü Gelir', value: stats.revenueToday, trend: '+18%', icon: CreditCard },
    { title: 'Yardım Talepleri', value: stats.totalHelp, trend: '-3%', icon: HeartHandshake },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-wb-olive mb-6 flex items-center gap-2">
        <LayoutDashboard size={20} /> Genel Bakış
      </h1>

      {/* Stat kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {widgets.map((w) => {
          const Icon = w.icon
          return (
            <div
              key={w.title}
              className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between"
            >
              <div>
                <p className="text-sm text-gray-500">{w.title}</p>
                <h2 className="text-2xl font-bold text-wb-olive">{w.value}</h2>
                <p className="text-xs text-green-600">{w.trend}</p>
              </div>
              <Icon className="text-wb-green" size={26} />
            </div>
          )
        })}
      </div>

      {/* Grafik alanı */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border h-80">
          <h2 className="text-lg font-semibold text-wb-olive mb-4">İş Modeli Dağılımı</h2>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" outerRadius={80} label dataKey="value">
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border h-80">
          <h2 className="text-lg font-semibold text-wb-olive mb-4">
            Haftalık Kullanıcı & İlan Trendleri
          </h2>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#10B981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="posts" stroke="#3B82F6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
