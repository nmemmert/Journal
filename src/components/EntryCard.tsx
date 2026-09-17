import Link from 'next/link'
import { parseTags, truncate } from '@/lib/utils'

interface Media { id: string; type: string; url: string }
interface Entry {
  id: string; title: string; content: string; mood: string | null
  tags: string | null; createdAt: string | Date; media: Media[]
}

function formatEntryDate(d: string | Date): string {
  const date = new Date(d)
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' })
  const month = date.toLocaleDateString('en-US', { month: 'short' })
  const day = date.getDate()
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return `${weekday}, ${month} ${day} at ${time}`
}

export default function EntryCard({ entry }: { entry: Entry }) {
  const tags = parseTags(entry.tags)
  const images = entry.media.filter(m => m.type === 'image')
  const videos = entry.media.filter(m => m.type === 'video')
  const dateStr = formatEntryDate(entry.createdAt)

  return (
    <Link href={`/journal/${entry.id}`} className="block active:scale-[0.98] transition-transform duration-100">
      {images.length > 0 ? (
        /* ── Photo card ── */
        <div className="relative overflow-hidden" style={{ borderRadius: 20, aspectRatio: '4/3',
          boxShadow: '0 2px 8px rgba(0,0,0,0.4), 0 12px 40px rgba(0,0,0,0.5)' }}>

          <img src={images[0].url} alt="" className="absolute inset-0 w-full h-full object-cover" />

          {images.length >= 2 && (
            <div className="absolute top-0 right-0 bottom-0 w-[32%] flex flex-col gap-px">
              {images.slice(1, 3).map((img, i) => (
                <div key={img.id} className="relative flex-1 overflow-hidden">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  {images.length > 3 && i === 1 && (
                    <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">+{images.length - 3}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="absolute inset-0"
               style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0) 100%)' }} />

          {videos.length > 0 && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full">
              <svg width="12" height="12" fill="white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              <span className="text-[10px] font-bold text-white">{videos.length}</span>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-4">
            {entry.mood && <span className="text-[22px] leading-none block mb-1">{entry.mood}</span>}
            <h3 className="text-white font-bold text-[18px] leading-snug mb-3"
                style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
              {entry.title || truncate(entry.content, 65)}
            </h3>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-[10px] font-bold text-white/90 bg-white/20
                                             backdrop-blur-sm px-2.5 py-0.5 rounded-full tracking-wide">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-[14px]">📔</span>
              <span className="text-[11px] font-medium text-white/60">{dateStr}</span>
            </div>
          </div>
        </div>
      ) : (
        /* ── Text card ── */
        <div style={{
          background: 'var(--card)',
          borderRadius: 20,
          boxShadow: 'var(--card-shadow)',
          overflow: 'hidden',
        }}>
          <div className="p-5 flex flex-col">
            {/* Mood emoji */}
            {entry.mood && (
              <span className="text-[28px] leading-none mb-3">{entry.mood}</span>
            )}

            {/* Content */}
            {entry.title ? (
              <div className="mb-3">
                <h3 className="font-bold text-[17px] leading-snug mb-1.5" style={{ color: 'var(--text)' }}>
                  {entry.title}
                </h3>
                <p className="text-[14px] leading-[1.65]" style={{ color: 'var(--text-2)' }}>
                  {truncate(entry.content, 110)}
                </p>
              </div>
            ) : (
              <p className="text-[15px] leading-[1.7] mb-3"
                 style={{ color: 'var(--text)', fontFamily: 'Georgia, Charter, serif' }}>
                {truncate(entry.content, 140)}
              </p>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {tags.slice(0, 4).map(tag => (
                  <span key={tag} className="tag-pill">#{tag}</span>
                ))}
              </div>
            )}

            {/* Bottom: icon + date */}
            <div className="flex items-center gap-2 pt-3"
                 style={{ borderTop: '1px solid var(--border)' }}>
              <span className="text-[15px]">📔</span>
              {videos.length > 0 && (
                <span className="flex items-center gap-1 mr-1">
                  <svg width="12" height="12" fill="var(--text-3)" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </span>
              )}
              <span className="text-[12px] font-medium" style={{ color: 'var(--text-3)' }}>
                {dateStr}
              </span>
            </div>
          </div>
        </div>
      )}
    </Link>
  )
}
