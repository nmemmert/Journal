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
  const hasHero = images.length > 0

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero image or plain header */}
      {hasHero ? (
        <div className="relative" style={{ height: '55vw', minHeight: 220, maxHeight: 360 }}>
          <img src={images[0].url} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* Translucent nav bar over image */}
          <div className="absolute top-0 inset-x-0 flex items-center justify-between px-4"
               style={{ paddingTop: 'calc(env(safe-area-inset-top) + 8px)', height: 'calc(env(safe-area-inset-top) + 52px)' }}>
            <Link href="/journal"
              className="flex items-center gap-1 bg-black/30 backdrop-blur-md text-white text-[14px] font-medium px-3 py-1.5 rounded-full">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Link>
            <div className="flex items-center gap-2">
              <Link href={`/journal/${id}/edit`}
                className="bg-black/30 backdrop-blur-md text-white text-[13px] font-medium px-3 py-1.5 rounded-full">
                Edit
              </Link>
              <DeleteEntryButton entryId={id} dark />
            </div>
          </div>

          {/* Extra images thumbnails */}
          {images.length > 1 && (
            <div className="absolute bottom-3 right-3 flex gap-1.5">
              {images.slice(1, 4).map((img, i) => (
                <div key={img.id} className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white/50 relative">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  {images.length > 4 && i === 2 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold">+{images.length - 4}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[#f2f2f7] border-b border-gray-200/80"
             style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <div className="flex items-center justify-between px-4 h-14">
            <Link href="/journal" className="flex items-center gap-0.5 text-indigo-600 text-[15px] font-medium -ml-1 px-2 py-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Journal
            </Link>
            <div className="flex items-center gap-2">
              <Link href={`/journal/${id}/edit`}
                className="text-[13px] font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full">
                Edit
              </Link>
              <DeleteEntryButton entryId={id} />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 px-5 pt-5 pb-12">
        {/* Metadata row */}
        <div className="flex items-center gap-2 mb-4">
          {entry.mood && <span className="text-2xl">{entry.mood}</span>}
          <div>
            <p className="text-[15px] font-semibold text-gray-900">{formatDate(entry.createdAt)}</p>
            <p className="text-[12px] text-gray-400">{formatTime(entry.createdAt)}</p>
          </div>
        </div>

        {entry.location && (
          <div className="flex items-center gap-1.5 text-[13px] text-gray-500 mb-4 -mt-2">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {entry.location}
          </div>
        )}

        {entry.title && (
          <h1 className="text-[26px] font-bold text-gray-900 mb-4 leading-tight tracking-tight">
            {entry.title}
          </h1>
        )}

        <div className="text-[16px] text-gray-800 leading-[1.7] whitespace-pre-wrap"
             style={{ fontFamily: 'Georgia, Charter, "Bitstream Charter", serif' }}>
          {entry.content}
        </div>

        {/* Videos */}
        {videos.length > 0 && (
          <div className="mt-6 space-y-3">
            {videos.map(vid => (
              <video key={vid.id} src={vid.url} controls playsInline preload="metadata"
                className="w-full rounded-2xl bg-gray-900" style={{ maxHeight: '55vw' }} />
            ))}
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-8">
            {tags.map(tag => (
              <Link key={tag} href={`/search?tag=${encodeURIComponent(tag)}`}
                className="text-[13px] font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full">
                #{tag}
              </Link>
            ))}
          </div>
        )}

        <p className="text-[11px] text-gray-300 mt-10 text-center">
          Last updated {formatDate(entry.updatedAt)}
        </p>
      </div>
    </div>
  )
}
