'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { LayoutDashboard, Users, Flag, Clock, Mail } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ModeratorDashboardPage() {
  const [stats, setStats] = useState<any>({})

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const { data: posts } = await supabase.from('posts').select('*')
    const { data: contacts } = await supabase.from('contact_requests').select('*')

    setStats({
      pending: posts?.filter((p) => p.status === 'pending').length || 0,
      reported: posts?.filter((p) => p.status === 'reported').length || 0,
      contact: contacts?.length || 0,
    })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-wb-olive mb-6 flex items-center gap-2">
        <LayoutDashboard size={22} /> Genel Bakış
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card icon={Clock} label="Bekleyen İçerikler" value={stats.pending} />
        <Card icon={Flag} label="Raporlananlar" value={stats.reported} />
        <Card icon={Mail} label="İletişim Talepleri" value={stats.contact} />
      </div>
    </div>
  )
}

function Card({ icon: Icon, label, value }: any) {
  return (
    <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <h2 className="text-2xl font-bold text-wb-olive">{value}</h2>
      </div>
      <Icon className="text-wb-green" size={26} />
    </div>
  )
}
