'use client'

import { Gift, Heart, ShoppingCart } from 'lucide-react'

type PostType = 'gift' | 'help' | 'sale'

interface PostCardProps {
  type: PostType
  title: string
  description: string
  user?: string
  date?: string
}

const iconMap = {
  gift: Gift,
  help: Heart,
  sale: ShoppingCart,
}

const colorMap = {
  gift: 'bg-wb-lavender',
  help: 'bg-wb-green',
  sale: 'bg-wb-olive',
}

export default function PostCard({ type, title, description, user, date }: PostCardProps) {
  const Icon = iconMap[type]
  const color = colorMap[type]

  return (
    <div className="pastel-card p-5 border border-wb-olive/30 hover:shadow-md transition">
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="text-white w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          <p className="text-sm text-slate-600 mt-1">{description}</p>
          <div className="text-xs text-slate-500 mt-3">
            {user ? `Gönderen: ${user}` : 'Anonim'} • {date || 'Az önce'}
          </div>
        </div>
      </div>
    </div>
  )
}
