'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Image from 'next/image'
import { Send, Loader2, Trash2, Archive, Plus, Upload } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Conversation = {
  id: string
  user1: string
  user2: string
  created_at: string
  last_message?: string | null
  last_message_at?: string | null
}

type Message = {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
  is_read: boolean
  read_at: string | null
  attachments?: string[] | null
}

export default function MessagesPage() {
  const [user, setUser] = useState<any>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConv, setActiveConv] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [profilesMap, setProfilesMap] = useState<Record<string, any>>({})
  const [messageText, setMessageText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchUser, setSearchUser] = useState('')
  const [foundUsers, setFoundUsers] = useState<any[]>([])
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set())
  const bottomRef = useRef<HTMLDivElement>(null)

  const myId = user?.id
  const otherUserId = useMemo(() => {
    if (!activeConv || !myId) return null
    return activeConv.user1 === myId ? activeConv.user2 : activeConv.user1
  }, [activeConv, myId])

  const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })

  // basit ping
  const ping = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.connect(g); g.connect(ctx.destination)
      o.type = 'sine'; o.frequency.value = 880
      g.gain.setValueAtTime(0.001, ctx.currentTime)
      g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)
      o.start(); o.stop(ctx.currentTime + 0.25)
    } catch {}
  }

  // 1) kullanıcı + konuşmalar + profiller
  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.auth.getUser()
      const currentUser = data?.user
      if (!currentUser) return setLoading(false)
      setUser(currentUser)

      const { data: convs } = await supabase
        .from('conversations')
        .select('*')
        .or(`user1.eq.${currentUser.id},user2.eq.${currentUser.id}`)
        .order('last_message_at', { ascending: false })

      const list = (convs || []) as Conversation[]
      setConversations(list)

      const otherIds = Array.from(
        new Set(list.map((c) => (c.user1 === currentUser.id ? c.user2 : c.user1)))
      )
      if (otherIds.length) {
        const { data: profs } = await supabase
          .from('profiles')
          .select('id, full_name, username, profile_photo')
          .in('id', otherIds)
        const map: Record<string, any> = {}
        ;(profs || []).forEach((p: any) => (map[p.id] = p))
        setProfilesMap(map)
      }

      setLoading(false)
    })()
  }, [])

  // 2) aktif konuşma mesajları + realtime + okundu
  useEffect(() => {
    if (!activeConv || !myId) return

    let mounted = true
    ;(async () => {
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', activeConv.id)
        .order('created_at', { ascending: true })

      if (!mounted) return
      setMessages((msgs || []) as Message[])
      scrollToBottom()

      // görünür ise okundu yap
      await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('conversation_id', activeConv.id)
        .eq('is_read', false)
        .neq('sender_id', myId)

      const channel = supabase
        .channel(`conv-${activeConv.id}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
          const msg = payload.new as Message
          if (msg.conversation_id !== activeConv.id) return
          setMessages((prev) => [...prev, msg])
          scrollToBottom()
          if (msg.sender_id !== myId) {
            ping()
            await supabase
              .from('messages')
              .update({ is_read: true, read_at: new Date().toISOString() })
              .eq('id', msg.id)
              .neq('sender_id', myId)
          }
        })
        .subscribe()

      return () => {
        mounted = false
        supabase.removeChannel(channel)
      }
    })()
  }, [activeConv, myId])

  // 3) Presence (çevrimiçi durum)
  useEffect(() => {
    if (!myId) return

    const channel = supabase.channel('online-users', {
      config: { presence: { key: myId } },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        // presence state'i çek (SDK sürümüne göre method adı değişebiliyor)
        const anyChannel = channel as any
        const state =
          (anyChannel.presenceState && anyChannel.presenceState()) ||
          (anyChannel.getPresenceState && anyChannel.getPresenceState()) ||
          {}
        const ids = new Set<string>()
        Object.values(state).forEach((arr: any) => {
          ;(arr as any[]).forEach((m: any) => {
            if (m.user_id) ids.add(m.user_id)
          })
        })
        setOnlineIds(ids)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: myId })
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [myId])

  // yeni mesaj
  const sendMessage = async () => {
    if (!messageText.trim() && !file) return
    let attachments: string[] = []
    if (file) {
      const path = `messages/${Date.now()}-${file.name}`
      const { error } = await supabase.storage.from('public').upload(path, file)
      if (!error) {
        const { data } = supabase.storage.from('public').getPublicUrl(path)
        attachments.push(data.publicUrl)
      }
    }
    await supabase.from('messages').insert({
      conversation_id: activeConv!.id,
      sender_id: myId,
      content: messageText.trim(),
      attachments,
    })
    setMessageText('')
    setFile(null)

    // konuşma özetini güncelle
    await supabase
      .from('conversations')
      .update({
        last_message: messageText || (attachments.length ? '📎 Dosya gönderildi' : ''),
        last_message_at: new Date().toISOString(),
      })
      .eq('id', activeConv!.id)
  }

  // arama + yeni sohbet
  const handleUserSearch = async () => {
    if (!searchUser.trim()) return
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, username, profile_photo')
      .ilike('username', `%${searchUser}%`)
      .neq('id', myId)
    setFoundUsers(data || [])
  }

  const startConversation = async (targetId: string) => {
    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .or(`and(user1.eq.${myId},user2.eq.${targetId}),and(user1.eq.${targetId},user2.eq.${myId})`)
      .single()
    let conv = existing
    if (!conv) {
      const { data: created } = await supabase
        .from('conversations')
        .insert([{ user1: myId, user2: targetId }])
        .select()
        .single()
      conv = created!
    }
    setActiveConv(conv)
    setSearchUser('')
    setFoundUsers([])
  }

  const deleteConversation = async (convId: string) => {
    await supabase.from('conversations').update({ deleted_by: [myId] }).eq('id', convId)
    setConversations((prev) => prev.filter((c) => c.id !== convId))
    if (activeConv?.id === convId) setActiveConv(null)
  }
  const archiveConversation = async (convId: string) => {
    await supabase.from('conversations').update({ archived_by: [myId] }).eq('id', convId)
  }

  if (loading)
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin text-wb-olive" size={40} />
      </div>
    )

  return (
    <div className="flex flex-col md:flex-row h-[80vh] max-w-6xl mx-auto border border-wb-olive/30 rounded-xl overflow-hidden bg-white">
      {/* Sol panel */}
      <div className="w-full md:w-1/3 border-r border-wb-olive/20 bg-wb-cream/50 overflow-y-auto">
        <div className="p-4 border-b border-wb-olive/20 flex items-center justify-between">
          <input
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
            placeholder="Kullanıcı ara..."
            className="text-sm px-2 py-1 border rounded w-full mr-2"
          />
          <button
            onClick={handleUserSearch}
            className="bg-wb-olive text-white px-3 py-1 rounded hover:bg-wb-green"
            title="Yeni sohbet başlat"
          >
            <Plus size={16} />
          </button>
        </div>

        {foundUsers.length > 0 ? (
          <div>
            {foundUsers.map((u) => (
              <button
                key={u.id}
                onClick={() => startConversation(u.id)}
                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-wb-olive/10 text-sm"
              >
                <Image
                  src={u.profile_photo || '/default-avatar.png'}
                  alt={u.username}
                  width={32}
                  height={32}
                  className="rounded-full object-cover"
                />
                <span>{u.full_name || u.username}</span>
              </button>
            ))}
          </div>
        ) : (
          <>
            {conversations.length === 0 && (
              <p className="text-center text-gray-500 py-10 text-sm">Henüz bir konuşma yok.</p>
            )}
            {conversations.map((conv) => {
              const otherId = conv.user1 === myId ? conv.user2 : conv.user1
              const prof = profilesMap[otherId] || {}
              const name = prof.full_name || prof.username || `Kullanıcı ${otherId?.slice(0, 6)}`
              const online = onlineIds.has(otherId)

              return (
                <div
                  key={conv.id}
                  className={`group relative px-4 py-3 border-b border-wb-olive/10 hover:bg-wb-olive/10 cursor-pointer ${
                    activeConv?.id === conv.id ? 'bg-wb-olive/10' : ''
                  }`}
                  onClick={() => setActiveConv(conv)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Image
                        src={prof.profile_photo || '/default-avatar.png'}
                        alt={name}
                        width={36}
                        height={36}
                        className="rounded-full object-cover"
                      />
                      {/* çevrimiçi nokta */}
                      <span
                        className={`absolute -right-0 -bottom-0 w-3 h-3 rounded-full border-2 border-white ${
                          online ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                        title={online ? 'Çevrimiçi' : 'Çevrimdışı'}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-700 truncate">{name}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {conv.last_message || '—'}{' '}
                        {conv.last_message_at
                          ? '• ' + new Date(conv.last_message_at).toLocaleDateString('tr-TR')
                          : ''}
                      </p>
                    </div>
                  </div>

                  <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 flex gap-2 transition">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        archiveConversation(conv.id)
                      }}
                      className="text-gray-400 hover:text-wb-olive"
                      title="Arşivle"
                    >
                      <Archive size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteConversation(conv.id)
                      }}
                      className="text-gray-400 hover:text-red-600"
                      title="Sil"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>

      {/* Sağ panel */}
      <div className="flex-1 flex flex-col">
        {!activeConv ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Bir konuşma seçin
          </div>
        ) : (
          <>
            {/* Mesajlar */}
            <div className="flex-1 overflow-y-auto p-4 bg-wb-cream/30">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-3 flex ${msg.sender_id === myId ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`px-4 py-2 rounded-2xl max-w-[70%] text-sm ${
                      msg.sender_id === myId ? 'bg-wb-olive text-white' : 'bg-white text-gray-800'
                    }`}
                    title={new Date(msg.created_at).toLocaleString('tr-TR')}
                  >
                    {msg.content}
                    {msg.attachments?.length
                      ? msg.attachments.map((a, i) => (
                          <div key={i} className="mt-2">
                            <Image src={a} alt="Ek" width={180} height={130} className="rounded-lg border" />
                          </div>
                        ))
                      : null}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Yazma alanı */}
            <div className="border-t border-wb-olive/20 p-3 flex items-center gap-2 bg-white">
              <label className="cursor-pointer" title="Görsel ekle">
                <Upload size={18} className="text-wb-olive" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </label>
              {file && <span className="text-xs text-gray-500">{file.name} seçildi</span>}
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Mesajınızı yazın..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-wb-olive"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') sendMessage()
                }}
              />
              <button
                onClick={sendMessage}
                className="bg-wb-olive text-white rounded-full p-2 hover:bg-wb-green transition"
                title="Gönder"
              >
                <Send size={18} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
