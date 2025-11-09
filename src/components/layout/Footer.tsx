'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import {
  Facebook,
  Instagram,
  Twitter,
  Music2,
  Youtube,
  Linkedin,
  Mail,
} from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const iconMap: Record<string, any> = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  tiktok: Music2,
  youtube: Youtube,
  linkedin: Linkedin,
}

export default function Footer() {
  const [socials, setSocials] = useState<{ key: string; value: string }[]>([])
  const [contact, setContact] = useState<string>('destek@wishofbridge.com')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFooterData()
  }, [])

  const loadFooterData = async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value, is_active')
      .in('key', ['facebook', 'instagram', 'twitter', 'tiktok', 'youtube', 'linkedin', 'contact'])

    if (error) console.error('Footer verileri alınamadı:', error)

    if (data) {
      const social = data.filter((d) => d.is_active && iconMap[d.key])
      const contactItem = data.find((d) => d.key === 'contact')
      setSocials(social)
      if (contactItem?.value) setContact(contactItem.value)
    }
    setLoading(false)
  }

  return (
    <footer className="bg-wb-cream/60 border-t border-wb-olive/20 text-slate-700 mt-10">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* 🖼️ LOGO & AÇIKLAMA */}
        <div className="flex flex-col items-start">
          <div className="mb-4">
            <Image
              src="/logo-wishofbridge.png"
              alt="Wish Of Bridge"
              width={160}
              height={160}
              priority
              className="object-contain"
            />
          </div>
          <p className="text-sm text-slate-600 mb-3 leading-relaxed">
            Paylaşmanın, yardımlaşmanın ve hediyeleşmenin köprüsü.  
            Topluluk odaklı sosyal–ticaret platformu.
          </p>

          {/* 🌐 Sosyal Medya */}
          <div className="flex gap-3 text-wb-olive">
            {loading ? (
              <span className="text-xs text-gray-400">Yükleniyor...</span>
            ) : socials.length > 0 ? (
              socials.map((s) => {
                const Icon = iconMap[s.key] || Mail
                return (
                  <a
                    key={s.key}
                    href={s.value}
                    target="_blank"
                    rel="noreferrer"
                    title={s.key}
                    className="hover:text-wb-green transition"
                  >
                    <Icon size={18} />
                  </a>
                )
              })
            ) : (
              <span className="text-xs text-gray-400">Bağlantı yok</span>
            )}
          </div>
        </div>

        {/* 🔗 Hızlı Linkler */}
        <FooterSection title="Hızlı Linkler">
          <FooterLink href="/gifts" label="Hediyeleşme" />
          <FooterLink href="/help" label="Yardımlaşma" />
          <FooterLink href="/market" label="Satış" />
          <FooterLink href="/create" label="Oluştur" />
        </FooterSection>

        {/* 📄 Kurumsal */}
        <FooterSection title="Kurumsal">
          <FooterLink href="/about" label="Hakkımızda" />
          <FooterLink href="/privacy" label="Gizlilik Politikası" />
          <FooterLink href="/terms" label="Kullanım Şartları" />
          <FooterLink href="/contact" label="İletişim" />
        </FooterSection>

        {/* 📞 İletişim */}
        <FooterSection title="İletişim">
          <p className="text-sm">📧 {contact}</p>
          <p className="text-sm">📍 İstanbul, Türkiye</p>
        </FooterSection>

        {/* 📚 Destek */}
        <FooterSection title="Destek">
          <FooterLink href="/faq" label="SSS" />
          <FooterLink href="/support" label="Yardım Merkezi" />
          <FooterLink href="/security" label="Güvenlik" />
        </FooterSection>
      </div>

      {/* Alt Kısım */}
      <div className="border-t border-wb-olive/10 text-center py-4 text-xs text-slate-500 bg-white/40">
        © {new Date().getFullYear()} Wish Of Bridge. Tüm hakları saklıdır.
      </div>
    </footer>
  )
}

/* 🔹 Yardımcı bileşenler */
function FooterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-wb-olive mb-3">{title}</h3>
      <ul className="space-y-2 text-sm">{children}</ul>
    </div>
  )
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link href={href} className="hover:text-wb-olive transition">
        {label}
      </Link>
    </li>
  )
}
