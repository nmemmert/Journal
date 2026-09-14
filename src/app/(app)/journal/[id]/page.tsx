import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatDate, formatTime, parseTags } from '@/lib/utils'
import DeleteEntryButton from '@/components/DeleteEntryButton'

export default async function EntryPage({ params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser()
  if (!auth) redirect('/login')

  const { id } = await params
  const entry = await prisma.entry.findFirst({
    where: { id, userId: auth.userId },
    include: { media: { orderBy: { createdAt: 'asc' } } },
  })
  if (!entry) notFound()

  const tags = parseTags(entry.tags)
  const images = entry.media.filter(m => m.type === 'image')
  const videos = entry.media.filter(m => m.type === 'video')

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-lg border-b border-gray-100"
           style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/journal" className="flex items-center gap-0.5 text-indigo-600 font-medium -ml-1 px-2 py-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Journal
          </Link>
          <div className="flex items-center gap-2">
            <Link href={`/journal/${id}/edit`} className="px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-full">
              Edit
            </Link>
            <DeleteEntryButton entryId={id} />
          </div>
        </div>
      </div>

      {/* Images hero */}
      {images.length > 0 && (
        <div className={`grid gap-0.5 ${images.length === 1 ? 'grid-cols-1' : images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {images.map(img => (
            <div key={img.id} className="relative bg-gray-100" style={{ aspectRatio: images.length === 1 ? '4/3' : '1' }}>
              <img src={img.url} alt={img.filename} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Videos */}
      {videos.length > 0 && (
        <div className="space-y-2 mt-2 px-4">
          {videos.map(vid => (
            <div key={vid.id}>
              <video
                src={vid.url}
                controls
                playsInline
                preload="metadata"
                className="w-full rounded-2xl bg-gray-900"
                style={{ maxHeight: '60vh' }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 px-4 pt-5 pb-10">
        {/* Metadata */}
        <div className="flex items-center gap-2 mb-3">
          {entry.mood && <span className="text-2xl">{entry.mood}</span>}
          <div>
            <p className="text-sm font-semibold text-gray-900">{formatDate(entry.createdAt)}</p>
            <p className="text-xs text-gray-400">{formatTime(entry.createdAt)}</p>
          </div>
        </div>

        {entry.location && (
          <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {entry.location}
          </div>
        )}

        {entry.title && (
          <h1 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">{entry.title}</h1>
        )}

        <div className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap font-[Georgia,serif]">
          {entry.content}
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6">
            {tags.map(tag => (
              <Link
                key={tag}
                href={`/search?tag=${encodeURIComponent(tag)}`}
                className="text-sm bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full font-medium"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-300 mt-8">
          Last updated {formatDate(entry.updatedAt)} at {formatTime(entry.updatedAt)}
        </p>
      </div>
    </div>
  )
}
