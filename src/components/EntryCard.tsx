import Link from 'next/link'
import { formatTime, parseTags, truncate } from '@/lib/utils'

interface Media { id: string; type: string; url: string }
interface Entry {
  id: string; title: string; content: string; mood: string | null
  tags: string | null; createdAt: string | Date; media: Media[]
}

export default function EntryCard({ entry }: { entry: Entry }) {
  const tags = parseTags(entry.tags)
  const images = entry.media.filter(m => m.type === 'image')
  const videos = entry.media.filter(m => m.type === 'video')
  const time = formatTime(entry.createdAt)

  return (
    <Link href={`/journal/${entry.id}`} className="block active:scale-[0.98] transition-transform duration-100">
      {images.length > 0 ? (
        /* ── Photo card ── */
        <div className="relative overflow-hidden" style={{ borderRadius: 22, aspectRatio: '4/3',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12), 0 12px 40px rgba(0,0,0,0.18)' }}>

          {/* Main image */}
          <img src={images[0].url} alt="" className="absolute inset-0 w-full h-full object-cover" />

          {/* Collage sidebar */}
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

          {/* Cinematic gradient */}
          <div className="absolute inset-0"
               style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.12) 50%, rgba(0,0,0,0) 100%)' }} />

          {/* Top-left: time pill */}
          <div className="absolute top-3 left-3">
            <span className="text-[11px] font-semibold text-white/80 bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-full">
              {time}
            </span>
          </div>

          {/* Top-right: video badge */}
          {videos.length > 0 && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/30 backdrop-blur-md px-2 py-1 rounded-full">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              <span className="text-[10px] font-bold text-white">{videos.length}</span>
            </div>
          )}

          {/* Bottom: content */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {entry.mood && <span className="text-[22px] leading-none block mb-1">{entry.mood}</span>}
            <h3 className="text-white font-bold text-[19px] leading-snug" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
              {entry.title || truncate(entry.content, 65)}
            </h3>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-[10px] font-bold text-white/90 bg-white/20
                                             backdrop-blur-sm px-2.5 py-0.5 rounded-full tracking-wide">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ── Text card ── */
        <div style={{
          background: '#FFFFFF',
          borderRadius: 20,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 6px 20px rgba(0,0,0,0.09), 0 20px 48px rgba(0,0,0,0.07)',
          overflow: 'hidden',
        }}>
          <div className="p-5">
            {/* Header: mood + time */}
            <div className="flex items-start justify-between mb-3.5">
              <div className="flex items-center gap-2.5">
                {entry.mood ? (
                  <span className="text-[26px] leading-none">{entry.mood}</span>
                ) : (
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                       style={{ background: 'var(--primary-tint)' }}>
                    <svg className="w-4 h-4" style={{ color: 'var(--primary)' }}
                         fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                    </svg>
                  </div>
                )}
                <span className="text-[13px] font-bold" style={{ color: 'var(--primary)' }}>
                  {time}
                </span>
              </div>
              {videos.length > 0 && (
                <div className="flex items-center gap-1 bg-stone-100 px-2 py-1 rounded-full">
                  <svg className="w-3 h-3 text-stone-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <span className="text-[10px] font-bold text-stone-400">{videos.length}</span>
                </div>
              )}
            </div>

            {/* Title + preview */}
            {entry.title ? (
              <div>
                <h3 className="font-bold text-[18px] leading-snug mb-1.5" style={{ color: 'var(--text)' }}>
                  {entry.title}
                </h3>
                <p className="text-[14px] leading-[1.65]" style={{ color: 'var(--text-2)', fontFamily: 'Georgia, Charter, serif' }}>
                  {truncate(entry.content, 110)}
                </p>
              </div>
            ) : (
              <p className="text-[15.5px] leading-[1.7]"
                 style={{ color: 'var(--text)', fontFamily: 'Georgia, Charter, serif' }}>
                {truncate(entry.content, 140)}
              </p>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4 pt-3.5"
                   style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                {tags.slice(0, 4).map(tag => (
                  <span key={tag} className="tag-pill">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Link>
  )
}
