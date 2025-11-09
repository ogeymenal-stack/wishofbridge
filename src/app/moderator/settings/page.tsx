'use client'

import { useState, useEffect } from 'react'
import { Palette, Save } from 'lucide-react'

export default function ModeratorSettingsPage() {
  const [theme, setTheme] = useState('lavender')

  useEffect(() => {
    const saved = localStorage.getItem('mod-theme')
    if (saved) setTheme(saved)
  }, [])

  const handleSave = () => {
    localStorage.setItem('mod-theme', theme)
    alert('Tema tercihiniz kaydedildi.')
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-wb-olive mb-6 flex items-center gap-2">
        <Palette size={20} /> Tema Tercihi
      </h1>

      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <p className="text-sm text-gray-600 mb-4">Panel renk temasını seçin:</p>
        <div className="flex gap-3 mb-5">
          {['lavender', 'green', 'cream', 'olive'].map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`w-10 h-10 rounded-full border-2 ${
                theme === t ? 'border-wb-olive scale-110' : 'border-gray-300'
              }`}
              style={{
                backgroundColor:
                  t === 'lavender'
                    ? '#C3A4FF'
                    : t === 'green'
                    ? '#A6BBA6'
                    : t === 'cream'
                    ? '#F4E9D8'
                    : '#7A8B6E',
              }}
            ></button>
          ))}
        </div>

        <button
          onClick={handleSave}
          className="bg-wb-olive text-white px-5 py-2 rounded-xl flex items-center gap-2 hover:bg-wb-green transition"
        >
          <Save size={14} /> Kaydet
        </button>
      </div>
    </div>
  )
}
