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
      {hasHero ? (
        <div className="relative" style={{ height: '62vw', minHeight: 240, maxHeight: 400 }}>
          <img src={images[0].url} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0"
               style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.5) 100%)' }} />

          {/* Nav */}
          <div className="absolute top-0 inset-x-0 flex items-center justify-between px-4"
               style={{ paddingTop: 'calc(env(safe-area-inset-top) + 8px)',
                        height: 'calc(env(safe-area-inset-top) + 52px)' }}>
            <Link href="/journal"
              className="flex items-center gap-1 text-white text-[14px] font-bold
                         bg-black/25 backdrop-blur-xl px-3 py-1.5 rounded-full"
              style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Journal
            </Link>
            <div className="flex items-center gap-2">
              <Link href={`/journal/${id}/edit`}
                className="text-white text-[13px] font-bold bg-black/25 backdrop-blur-xl
                           px-3 py-1.5 rounded-full"
                style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)' }}>
                Edit
              </Link>
              <DeleteEntryButton entryId={id} dark />
            </div>
          </div>

          {/* Extra thumbnails */}
          {images.length > 1 && (
            <div className="absolute bottom-3 right-3 flex gap-1.5">
              {images.slice(1, 4).map((img, i) => (
                <div key={img.id} className="w-12 h-12 rounded-xl overflow-hidden relative"
                     style={{ border: '2px solid rgba(255,255,255,0.5)' }}>
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
        /* Text-only header bar */
        <div style={{ background: 'var(--bg-grad)', borderBottom: '1px solid rgba(0,0,0,0.07)',
                      paddingTop: 'env(safe-area-inset-top)' }}>
          <div className="flex items-center justify-between px-4 h-14">
            <Link href="/journal"
              className="flex items-center gap-0.5 text-[15px] font-bold -ml-1 px-2 py-1"
              style={{ color: 'var(--primary)' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Journal
            </Link>
            <div className="flex items-center gap-2">
              <Link href={`/journal/${id}/edit`}
                className="text-[13px] font-bold px-3 py-1.5 rounded-full"
                style={{ background: 'var(--primary-tint)', color: 'var(--primary)' }}>
                Edit
              </Link>
              <DeleteEntryButton entryId={id} />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 px-5 pt-6 pb-16">
        {/* Date + mood */}
        <div className="flex items-start gap-4 mb-6">
          {entry.mood && (
            <span className="text-[36px] leading-none mt-0.5 flex-shrink-0">{entry.mood}</span>
          )}
          <div>
            <p className="text-[18px] font-bold leading-tight" style={{ color: 'var(--text)' }}>
              {formatDate(entry.createdAt)}
            </p>
            <p className="text-[13px] font-semibold mt-1" style={{ color: 'var(--text-3)' }}>
              {formatTime(entry.createdAt)}
            </p>
          </div>
        </div>

        {entry.location && (
          <div className="flex items-center gap-1.5 text-[13px] mb-5 -mt-2"
               style={{ color: 'var(--text-2)' }}>
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {entry.location}
          </div>
        )}

        {entry.title && (
          <h1 className="text-[26px] font-bold mb-6 leading-tight tracking-tight"
              style={{ color: 'var(--text)' }}>
            {entry.title}
          </h1>
        )}

        <div className="text-[17px] leading-[1.8] whitespace-pre-wrap"
             style={{ color: 'var(--text)', fontFamily: 'Georgia, Charter, serif' }}>
          {entry.content}
        </div>

        {videos.length > 0 && (
          <div className="mt-6 space-y-3">
            {videos.map(vid => (
              <video key={vid.id} src={vid.url} controls playsInline preload="metadata"
                className="w-full rounded-2xl bg-black" style={{ maxHeight: '55vw' }} />
            ))}
          </div>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-8">
            {tags.map(tag => (
              <Link key={tag} href={`/search?tag=${encodeURIComponent(tag)}`}
                className="tag-pill active:opacity-70 transition-opacity">
                #{tag}
              </Link>
            ))}
          </div>
        )}

        <p className="text-[11px] mt-12 text-center" style={{ color: 'var(--text-3)' }}>
          Last updated {formatDate(entry.updatedAt)}
        </p>
      </div>
    </div>
  )
}
