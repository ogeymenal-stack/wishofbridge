'use client'

import { useState } from 'react'

export default function ModeratorSettingsPage() {
  const [theme, setTheme] = useState('light')

  return (
    <div>
      <h2 className="text-xl font-semibold text-wb-olive mb-3">🎨 Tema Ayarları</h2>
      <p className="text-slate-600 mb-4">Kendi görünüm tercihlerinizi buradan belirleyebilirsiniz.</p>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="theme"
            value="light"
            checked={theme === 'light'}
            onChange={() => setTheme('light')}
          />
          Açık Tema
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="theme"
            value="dark"
            checked={theme === 'dark'}
            onChange={() => setTheme('dark')}
          />
          Koyu Tema
        </label>
      </div>
    </div>
  )
}
