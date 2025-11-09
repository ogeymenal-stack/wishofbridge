import { NextResponse } from 'next/server'
import { Resend } from 'resend'

// 🔐 ENV değişkenleri (.env.local)
const resend = new Resend(process.env.RESEND_API_KEY)
const RECEIVER = 'info@wishofbridge.com' // ana hedef e-posta adresi

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // 🧾 Form verilerini al
    const { to, subject, text } = body

    if (!subject || !text) {
      return NextResponse.json(
        { error: 'Eksik bilgi: subject veya text alanı yok.' },
        { status: 400 }
      )
    }

    // 📤 E-posta gönder
    const { data, error } = await resend.emails.send({
      from: 'Wish Of Bridge <no-reply@wishofbridge.com>',
      to: RECEIVER,
      subject: subject,
      text: text,
      replyTo: body.email || 'noreply@wishofbridge.com',
    })

    if (error) {
      console.error('Resend hata:', error)
      return NextResponse.json({ error: 'E-posta gönderilemedi.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data?.id || null })
  } catch (err: any) {
    console.error('API hata:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
