'use client'

import PostCard from './PostCard'

export default function PostList({ type }: { type: 'gift' | 'help' | 'sale' }) {
  // Şimdilik sahte veriler
  const mockData = [
    {
      id: 1,
      title: 'Kullanmadığım kitap setini hediye etmek istiyorum',
      description: 'Roman ve kişisel gelişim kitapları, tertemiz durumda.',
      user: 'Ayşe K.',
      type: 'gift',
    },
    {
      id: 2,
      title: 'İhtiyaç sahibi aileye kışlık yardım',
      description: 'Mont, ayakkabı ve çocuk kıyafetleri için destek aranıyor.',
      user: 'Mehmet D.',
      type: 'help',
    },
    {
      id: 3,
      title: 'Az kullanılmış kahve makinesi satıyorum',
      description: 'Faturalı, kutulu, garantili. Uygun fiyata devrediyorum.',
      user: 'Zeynep T.',
      type: 'sale',
    },
  ]

  return (
    <div className="grid gap-4">
      {mockData
        .filter((p) => p.type === type)
        .map((post) => (
          <PostCard
            key={post.id}
            type={post.type as any}
            title={post.title}
            description={post.description}
            user={post.user}
          />
        ))}
    </div>
  )
}
