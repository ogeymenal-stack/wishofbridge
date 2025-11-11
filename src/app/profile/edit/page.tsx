'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Camera, Loader2, Save, User, Phone, Calendar } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function EditProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>({})
  const [privacy, setPrivacy] = useState<any>({
    profile_visibility: 'public',
    show_online_status: true,
    allow_messages_from: 'everyone',
    data_sharing: {
      analytics: true,
      marketing: false,
      third_party: false,
    },
  })
  const [notifications, setNotifications] = useState<any>({
    email_notifications: {
      new_message: true,
      order_update: true,
      promotion: false,
      security_alert: true,
      weekly_summary: false,
    },
    push_notifications: {
      new_follower: true,
      gift_update: true,
      help_response: true,
      system_alert: true,
    },
    sms_notifications: {
      order_confirmation: false,
      delivery_update: false,
      two_factor_auth: true,
    },
    do_not_disturb: {
      enabled: false,
      start_hour: 22,
      end_hour: 7,
    },
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  // Tam adı hesapla
  const getFullName = () => {
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`
    }
    return profile.full_name || ''
  }

  // 🔹 Kullanıcı ve ayarları yükle
  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.auth.getUser()
      const currentUser = data?.user
      setUser(currentUser)

      if (currentUser) {
        // Profil
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single()
        setProfile(profileData || {})

        // Gizlilik
        const { data: privacyData } = await supabase
          .from('user_privacy_settings')
          .select('*')
          .eq('user_id', currentUser.id)
          .single()
        if (privacyData) setPrivacy(privacyData)

        // Bildirim tercihleri
        const { data: notifData } = await supabase
          .from('user_notification_settings')
          .select('*')
          .eq('user_id', currentUser.id)
          .single()
        if (notifData) setNotifications(notifData)
      }

      setLoading(false)
    })()
  }, [])

  // 🔹 Resim yükleme
  const handleUpload = async (e: any, type: 'profile_photo' | 'cover_photo') => {
    const file = e.target.files[0]
    if (!file || !user) return

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${type}.${fileExt}`
    const filePath = `${type}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      alert('Yükleme hatası: ' + uploadError.message)
      return
    }

    const { data: urlData } = supabase.storage
      .from('profiles')
      .getPublicUrl(filePath)

    const publicUrl = urlData?.publicUrl

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ [type]: publicUrl })
      .eq('id', user.id)

    if (updateError) alert('Profil güncellenemedi: ' + updateError.message)
    else setProfile((p: any) => ({ ...p, [type]: publicUrl }))
  }

  // 🔹 Kaydetme işlemi
  const handleSave = async () => {
    if (!user) return
    setSaving(true)

    // Tam adı güncelle
    const fullName = getFullName()

    // Profil güncelle
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        first_name: profile.first_name,
        last_name: profile.last_name,
        full_name: fullName,
        username: profile.username,
        phone: profile.phone,
        date_of_birth: profile.date_of_birth,
        gender: profile.gender,
        location: profile.location,
        website: profile.website,
        bio: profile.bio,
        updated_at: new Date(),
      })
      .eq('id', user.id)

    if (profileError) {
      alert('Profil kaydedilemedi: ' + profileError.message)
      setSaving(false)
      return
    }

    // Gizlilik güncelle
    await supabase.from('user_privacy_settings').upsert({
      user_id: user.id,
      ...privacy,
    })

    // Bildirim tercihlerini güncelle
    await supabase.from('user_notification_settings').upsert({
      user_id: user.id,
      email_notifications: notifications.email_notifications,
      push_notifications: notifications.push_notifications,
      sms_notifications: notifications.sms_notifications,
      do_not_disturb: notifications.do_not_disturb,
    })

    setSaving(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  // 🔹 Görünüm
  if (loading)
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin text-wb-olive" size={40} />
      </div>
    )

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold text-wb-olive mb-6">Profil Düzenle</h1>

      {/* Kapak Fotoğrafı */}
      <div className="relative w-full h-48 rounded-xl overflow-hidden bg-wb-cream mb-10">
        {profile.cover_photo ? (
          <Image
            src={profile.cover_photo}
            alt="Cover Photo"
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-wb-olive/50">
            Kapak fotoğrafı yok
          </div>
        )}
        <label className="absolute bottom-2 right-2 bg-wb-olive text-white p-2 rounded-full cursor-pointer hover:bg-wb-green transition">
          <Camera size={16} />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleUpload(e, 'cover_photo')}
          />
        </label>
      </div>

      {/* Profil Fotoğrafı */}
      <div className="flex items-center mb-6">
        <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md">
          {profile.profile_photo ? (
            <Image
              src={profile.profile_photo}
              alt="Avatar"
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-wb-olive text-white text-xl">
              {getFullName().charAt(0) || '?'}
            </div>
          )}
          <label className="absolute bottom-1 right-1 bg-wb-olive text-white p-1.5 rounded-full cursor-pointer hover:bg-wb-green transition">
            <Camera size={14} />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleUpload(e, 'profile_photo')}
            />
          </label>
        </div>

        <div className="ml-6">
          <h2 className="text-xl font-semibold text-wb-olive">
            {getFullName() || 'Ad Soyad'}
          </h2>
          <p className="text-gray-500">@{profile.username || 'kullanici'}</p>
        </div>
      </div>

      {/* 🧾 Profil Bilgileri */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              <User className="inline w-4 h-4 mr-1" />
              Ad *
            </label>
            <input
              type="text"
              value={profile.first_name || ''}
              onChange={(e) =>
                setProfile({ ...profile, first_name: e.target.value })
              }
              className="w-full border border-gray-300 rounded-xl px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Soyad *
            </label>
            <input
              type="text"
              value={profile.last_name || ''}
              onChange={(e) =>
                setProfile({ ...profile, last_name: e.target.value })
              }
              className="w-full border border-gray-300 rounded-xl px-3 py-2"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Kullanıcı Adı
          </label>
          <input
            type="text"
            value={profile.username || ''}
            onChange={(e) =>
              setProfile({ ...profile, username: e.target.value })
            }
            className="w-full border border-gray-300 rounded-xl px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            <Phone className="inline w-4 h-4 mr-1" />
            Telefon
          </label>
          <input
            type="tel"
            value={profile.phone || ''}
            onChange={(e) =>
              setProfile({ ...profile, phone: e.target.value })
            }
            className="w-full border border-gray-300 rounded-xl px-3 py-2"
            placeholder="+90 5XX XXX XX XX"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              <Calendar className="inline w-4 h-4 mr-1" />
              Doğum Tarihi
            </label>
            <input
              type="date"
              value={profile.date_of_birth || ''}
              onChange={(e) =>
                setProfile({ ...profile, date_of_birth: e.target.value })
              }
              max={new Date().toISOString().split('T')[0]}
              className="w-full border border-gray-300 rounded-xl px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Cinsiyet
            </label>
            <select
              value={profile.gender || ''}
              onChange={(e) =>
                setProfile({ ...profile, gender: e.target.value })
              }
              className="w-full border border-gray-300 rounded-xl px-3 py-2"
            >
              <option value="">Seçiniz</option>
              <option value="male">Erkek</option>
              <option value="female">Kadın</option>
              <option value="other">Diğer</option>
              <option value="prefer_not_to_say">Belirtmek İstemiyorum</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Konum
          </label>
          <input
            type="text"
            value={profile.location || ''}
            onChange={(e) =>
              setProfile({ ...profile, location: e.target.value })
            }
            className="w-full border border-gray-300 rounded-xl px-3 py-2"
            placeholder="Şehir, Ülke"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Website
          </label>
          <input
            type="url"
            value={profile.website || ''}
            onChange={(e) =>
              setProfile({ ...profile, website: e.target.value })
            }
            className="w-full border border-gray-300 rounded-xl px-3 py-2"
            placeholder="https://example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Hakkımda
          </label>
          <textarea
            value={profile.bio || ''}
            onChange={(e) =>
              setProfile({ ...profile, bio: e.target.value })
            }
            rows={4}
            className="w-full border border-gray-300 rounded-xl px-3 py-2"
            placeholder="Kendinizden bahsedin..."
          />
        </div>
      </div>

      {/* 🔒 Gizlilik Ayarları */}
      <div className="bg-white p-6 rounded-xl shadow-sm mt-10">
        <h3 className="text-lg font-semibold text-wb-olive mb-4">
          Gizlilik Ayarları
        </h3>
        <div className="space-y-3">
          <label className="block text-sm">Profil Görünürlüğü</label>
          <select
            value={privacy.profile_visibility}
            onChange={(e) =>
              setPrivacy({ ...privacy, profile_visibility: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="public">Herkese Açık</option>
            <option value="friends_only">Sadece Takipçiler</option>
            <option value="private">Sadece Ben</option>
          </select>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={privacy.show_online_status}
              onChange={(e) =>
                setPrivacy({ ...privacy, show_online_status: e.target.checked })
              }
            />
            <span className="text-sm text-gray-700">
              Çevrimiçi durumumu göster
            </span>
          </div>
        </div>
      </div>

      {/* 🔔 Bildirim Tercihleri */}
      <div className="bg-white p-6 rounded-xl shadow-sm mt-10">
        <h3 className="text-lg font-semibold text-wb-olive mb-4">
          Bildirim Tercihleri
        </h3>

        {/* Email */}
        <h4 className="text-md font-medium text-gray-800 mb-2">E-posta</h4>
        {Object.entries(notifications.email_notifications).map(([key, val]) => (
          <div key={key} className="flex items-center gap-2 mb-1">
            <input
              type="checkbox"
              checked={val as boolean}
              onChange={(e) =>
                setNotifications({
                  ...notifications,
                  email_notifications: {
                    ...notifications.email_notifications,
                    [key]: e.target.checked,
                  },
                })
              }
            />
            <span className="text-sm capitalize">
              {key.replaceAll('_', ' ')}
            </span>
          </div>
        ))}

        {/* Push */}
        <h4 className="text-md font-medium text-gray-800 mt-4 mb-2">Push</h4>
        {Object.entries(notifications.push_notifications).map(([key, val]) => (
          <div key={key} className="flex items-center gap-2 mb-1">
            <input
              type="checkbox"
              checked={val as boolean}
              onChange={(e) =>
                setNotifications({
                  ...notifications,
                  push_notifications: {
                    ...notifications.push_notifications,
                    [key]: e.target.checked,
                  },
                })
              }
            />
            <span className="text-sm capitalize">
              {key.replaceAll('_', ' ')}
            </span>
          </div>
        ))}

        {/* SMS */}
        <h4 className="text-md font-medium text-gray-800 mt-4 mb-2">SMS</h4>
        {Object.entries(notifications.sms_notifications).map(([key, val]) => (
          <div key={key} className="flex items-center gap-2 mb-1">
            <input
              type="checkbox"
              checked={val as boolean}
              onChange={(e) =>
                setNotifications({
                  ...notifications,
                  sms_notifications: {
                    ...notifications.sms_notifications,
                    [key]: e.target.checked,
                  },
                })
              }
            />
            <span className="text-sm capitalize">
              {key.replaceAll('_', ' ')}
            </span>
          </div>
        ))}

        {/* Sessiz Mod */}
        <div className="mt-6 border-t pt-4">
          <h4 className="text-md font-medium text-gray-800 mb-2">Sessiz Mod</h4>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              checked={notifications.do_not_disturb.enabled}
              onChange={(e) =>
                setNotifications({
                  ...notifications,
                  do_not_disturb: {
                    ...notifications.do_not_disturb,
                    enabled: e.target.checked,
                  },
                })
              }
            />
            <span className="text-sm">Sessiz Modu Etkinleştir</span>
          </div>

          <div className="flex gap-3">
            <div>
              <label className="block text-xs text-gray-600">Başlangıç</label>
              <input
                type="number"
                min={0}
                max={23}
                value={notifications.do_not_disturb.start_hour}
                onChange={(e) =>
                  setNotifications({
                    ...notifications,
                    do_not_disturb: {
                      ...notifications.do_not_disturb,
                      start_hour: Number(e.target.value),
                    },
                  })
                }
                className="border rounded-lg px-2 py-1 w-20"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600">Bitiş</label>
              <input
                type="number"
                min={0}
                max={23}
                value={notifications.do_not_disturb.end_hour}
                onChange={(e) =>
                  setNotifications({
                    ...notifications,
                    do_not_disturb: {
                      ...notifications.do_not_disturb,
                      end_hour: Number(e.target.value),
                    },
                  })
                }
                className="border rounded-lg px-2 py-1 w-20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 💾 Kaydet */}
      <div className="pt-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-wb-olive text-white px-6 py-2 rounded-xl flex items-center gap-2 hover:bg-wb-green transition"
        >
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          Kaydet
        </button>

        {success && (
          <p className="text-green-600 mt-3 text-sm">
            Profil, gizlilik ve bildirim ayarları güncellendi!
          </p>
        )}
      </div>
    </div>
  )
}