'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import {
  Users,
  Package,
  Gift,
  HeartHandshake,
  TrendingUp,
  Loader2,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<any[]>([])
  const [pieData, setPieData] = useState<any[]>([])

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      const { data: posts } = await supabase.from('posts').select('type, created_at')
      const { data: users } = await supabase.from('profiles').select('created_at')

      const months = [...Array(12).keys()].map((m) => ({
        name: new Date(2025, m).toLocaleString('tr-TR', { month: 'short' }),
        posts: 0,
        users: 0,
      }))

      posts?.forEach((p) => {
        const m = new Date(p.created_at).getMonth()
        months[m].posts++
      })
      users?.forEach((u) => {
        const m = new Date(u.created_at).getMonth()
        months[m].users++
      })

      setChartData(months)

      const gifts = posts?.filter((p) => p.type === 'gift').length || 0
      const sales = posts?.filter((p) => p.type === 'sale').length || 0
      const helps = posts?.filter((p) => p.type === 'help').length || 0

      setPieData([
        { name: 'Hediye', value: gifts },
        { name: 'Satış', value: sales },
        { name: 'Yardım', value: helps },
      ])
      setLoading(false)
    })()
  }, [])

  if (loading)
    return (
      <div className="flex justify-center items-center h-96 text-wb-olive">
        <Loader2 className="animate-spin mr-2" /> Veriler yükleniyor...
      </div>
    )

  const COLORS = ['#4CAF50', '#2196F3', '#FFC107']

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-wb-olive mb-6 flex items-center gap-2">
        <TrendingUp /> Analitik
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <h2 className="font-semibold text-wb-olive mb-4">Aylık Aktivite</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="posts" fill="#6b8e23" name="İlanlar" />
              <Bar dataKey="users" fill="#c2b280" name="Yeni Kullanıcılar" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <h2 className="font-semibold text-wb-olive mb-4">İlan Dağılımı</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={120}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
