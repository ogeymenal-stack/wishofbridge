'use client'

import ModeratorGuard from '@/components/moderator/ModeratorGuard'
import { useState } from 'react'

export default function ModeratorSettingsPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  return (
    <ModeratorGuard>
      <h1 className="text-xl font-semibold text-wb-olive mb-4">🎨 Tema & Görünüm Ayarları</h1>

      <div className="bg-white p-4 rounded-xl shadow space-y-3 max-w-md">
        <label className="flex items-center justify-between">
          <span className="font-medium">Tema</span>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
            className="border rounded-md p-1"
          >
            <option value="light">Açık Tema</option>
            <option value="dark">Koyu Tema</option>
          </select>
        </label>

        <p className="text-sm text-slate-500">
          Tema tercihi yalnızca bu cihazda geçerlidir.
        </p>
      </div>
    </ModeratorGuard>
  )
}
