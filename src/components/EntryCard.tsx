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
    <Link href={`/journal/${entry.id}`} className="block active:opacity-80 transition-opacity duration-100">
      {images.length > 0 ? (
        /* ── Photo card ── */
        <div className="relative overflow-hidden rounded-[22px]" style={{ aspectRatio: '4/3' }}>
          <img src={images[0].url} alt="" className="absolute inset-0 w-full h-full object-cover" />

          {images.length >= 2 && (
            <div className="absolute top-0 right-0 bottom-0 w-[34%] flex flex-col gap-px">
              {images.slice(1, 3).map((img, i) => (
                <div key={img.id} className="relative flex-1 overflow-hidden">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  {images.length > 3 && i === 1 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">+{images.length - 3}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              {entry.mood && <span className="text-sm leading-none">{entry.mood}</span>}
              <span className="text-white/65 text-[11px] font-medium">{time}</span>
              {videos.length > 0 && (
                <span className="ml-auto text-white/60 text-[11px] flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  {videos.length}
                </span>
              )}
            </div>
            <h3 className="text-white font-bold text-[17px] leading-snug drop-shadow-sm">
              {entry.title || truncate(entry.content, 60)}
            </h3>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-[10px] font-semibold text-white/90 bg-white/15
                                             backdrop-blur-sm px-2 py-0.5 rounded-full tracking-wide">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ── Text card ── */
        <div className="card overflow-hidden">
          <div className={`h-[3px] ${entry.mood
            ? 'bg-gradient-to-r from-amber-400 to-orange-400'
            : 'bg-gradient-to-r from-stone-200 to-stone-100'}`}
          />
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              {entry.mood ? (
                <span className="text-[20px] leading-none">{entry.mood}</span>
              ) : (
                <div className="w-5 h-5 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                  </svg>
                </div>
              )}
              <span className="text-[12px] font-semibold text-amber-600">{time}</span>
              {videos.length > 0 && (
                <span className="ml-auto text-stone-400 text-[11px] flex items-center gap-0.5">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  {videos.length}
                </span>
              )}
            </div>

            {entry.title ? (
              <>
                <h3 className="font-bold text-stone-900 text-[17px] leading-snug mb-1">
                  {entry.title}
                </h3>
                <p className="text-[14px] text-stone-500 leading-relaxed"
                   style={{ fontFamily: 'Georgia, Charter, serif' }}>
                  {truncate(entry.content, 100)}
                </p>
              </>
            ) : (
              <p className="text-[15px] text-stone-700 leading-[1.65]"
                 style={{ fontFamily: 'Georgia, Charter, serif' }}>
                {truncate(entry.content, 130)}
              </p>
            )}

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-stone-100">
                {tags.slice(0, 4).map(tag => (
                  <span key={tag} className="text-[11px] text-amber-700 font-semibold
                                             bg-amber-50 px-2.5 py-0.5 rounded-full tracking-wide">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Link>
  )
}
