'use client'

import ModeratorGuard from '@/components/moderator/ModeratorGuard'

export default function ModeratorHome() {
  return (
    <ModeratorGuard>
      <section>
        <h1 className="text-2xl font-semibold text-wb-olive mb-4">👋 Hoş geldin Moderatör!</h1>
        <p className="text-slate-600">
          Bu panelden kullanıcı içeriklerini onaylayabilir, raporlanan gönderileri inceleyebilir ve iletişim taleplerine yanıt verebilirsin.
        </p>
      </section>
    </ModeratorGuard>
  )
}
