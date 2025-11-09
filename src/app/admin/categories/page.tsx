'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Loader2, Plus, Save, Trash2 } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Cat = { id: number; name: string; type: string; parent_id: number | null; slug: string; is_active?: boolean }

export default function CategoriesPage() {
  const [cats, setCats] = useState<Cat[]>([])
  const [loading, setLoading] = useState(true)
  const [newCat, setNewCat] = useState({ name: '', type: 'sale', parent_id: '' as any })

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      const { data } = await supabase
        .from('categories')
        .select('id,name,type,parent_id,slug,is_active')
        .order('type', { ascending: true })
        .order('parent_id', { ascending: true })
        .order('name', { ascending: true })
      setCats((data || []) as any)
      setLoading(false)
    })()
  }, [])

  const byParent = useMemo(() => {
    const map: Record<string, Cat[]> = {}
    cats.forEach((c) => {
      const key = String(c.parent_id ?? 'root')
      map[key] = map[key] || []
      map[key].push(c)
    })
    return map
  }, [cats])

  const toggleActive = async (id: number, val: boolean) => {
    const { error } = await supabase.from('categories').update({ is_active: val }).eq('id', id)
    if (error) alert(error.message)
    else setCats((prev) => prev.map((c) => (c.id === id ? { ...c, is_active: val } : c)))
  }

  const remove = async (id: number) => {
    if (!confirm('Silmek istiyor musun?')) return
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) alert(error.message)
    else setCats((prev) => prev.filter((c) => c.id !== id))
  }

  const create = async () => {
    if (!newCat.name) return alert('Ad gerekli')
    const payload: any = {
      name: newCat.name,
      type: newCat.type,
      parent_id: newCat.parent_id ? Number(newCat.parent_id) : null,
      slug: newCat.name.toLowerCase().replace(/\s+/g, '-'),
      is_active: true,
    }
    const { data, error } = await supabase.from('categories').insert(payload).select('id,name,type,parent_id,slug,is_active').single()
    if (error) alert(error.message)
    else {
      setCats((prev) => [...prev, data as any])
      setNewCat({ name: '', type: 'sale', parent_id: '' as any })
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center h-96 text-wb-olive">
        <Loader2 className="animate-spin mr-2" /> Kategoriler yükleniyor...
      </div>
    )

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-wb-olive mb-6">🗂️ Kategoriler</h1>

      {/* Yeni kategori */}
      <div className="bg-white p-4 rounded-xl border shadow-sm mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="text-xs text-gray-500">Ad</label>
          <input
            className="block border rounded-xl px-3 py-2"
            value={newCat.name}
            onChange={(e) => setNewCat((s) => ({ ...s, name: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">Tür</label>
          <select
            className="block border rounded-xl px-3 py-2"
            value={newCat.type}
            onChange={(e) => setNewCat((s) => ({ ...s, type: e.target.value }))}
          >
            <option value="sale">Satış</option>
            <option value="gift">Hediye</option>
            <option value="help">Yardım</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">Üst Kategori</label>
          <select
            className="block border rounded-xl px-3 py-2 min-w-60"
            value={newCat.parent_id}
            onChange={(e) => setNewCat((s) => ({ ...s, parent_id: e.target.value }))}
          >
            <option value="">(Kök)</option>
            {cats
              .filter((c) => c.parent_id === null)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type})
                </option>
              ))}
          </select>
        </div>
        <button
          onClick={create}
          className="inline-flex items-center gap-2 bg-wb-olive text-white px-4 py-2 rounded-xl hover:bg-wb-green"
        >
          <Plus size={16} /> Ekle
        </button>
      </div>

      {/* Ağaç */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {['sale', 'gift', 'help'].map((t) => (
          <div key={t} className="bg-white p-4 rounded-xl border shadow-sm">
            <h2 className="font-semibold text-wb-olive mb-3 uppercase">{t}</h2>
            <Tree type={t} byParent={byParent} onToggle={toggleActive} onRemove={remove} />
          </div>
        ))}
      </div>
    </div>
  )
}

function Tree({
  type,
  byParent,
  onToggle,
  onRemove,
}: {
  type: string
  byParent: Record<string, any[]>
  onToggle: (id: number, val: boolean) => void
  onRemove: (id: number) => void
}) {
  const roots = (byParent['root'] || []).filter((c) => c.type === type)
  return (
    <ul className="space-y-2">
      {roots.map((root) => (
        <li key={root.id}>
          <Row node={root} onToggle={onToggle} onRemove={onRemove} />
          <Children parentId={root.id} byParent={byParent} onToggle={onToggle} onRemove={onRemove} />
        </li>
      ))}
    </ul>
  )
}

function Children({ parentId, byParent, onToggle, onRemove }: any) {
  const kids = byParent[String(parentId)] || []
  if (kids.length === 0) return null
  return (
    <ul className="ml-4 mt-1 border-l pl-3 space-y-1">
      {kids.map((n: any) => (
        <li key={n.id}>
          <Row node={n} onToggle={onToggle} onRemove={onRemove} />
          <Children parentId={n.id} byParent={byParent} onToggle={onToggle} onRemove={onRemove} />
        </li>
      ))}
    </ul>
  )
}

function Row({ node, onToggle, onRemove }: any) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <span className="font-medium">{node.name}</span>{' '}
        <span className="text-xs text-gray-400">/{node.slug}</span>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-600">
          <input
            type="checkbox"
            checked={node.is_active ?? true}
            onChange={(e) => onToggle(node.id, e.target.checked)}
            className="mr-1"
          />
          aktif
        </label>
        <button
          onClick={() => onRemove(node.id)}
          className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  )
}
