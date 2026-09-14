import Link from 'next/link'
import { formatRelative, formatTime, parseTags, truncate } from '@/lib/utils'

interface Media { id: string; type: string; url: string }
interface Entry {
  id: string; title: string; content: string; mood: string | null
  tags: string | null; createdAt: string | Date; media: Media[]
}

export default function EntryCard({ entry }: { entry: Entry }) {
  const tags = parseTags(entry.tags)
  const images = entry.media.filter(m => m.type === 'image')
  const videos = entry.media.filter(m => m.type === 'video')

  return (
    <Link href={`/journal/${entry.id}`} className="block active:opacity-75 transition-opacity duration-100">
      {images.length > 0 ? (
        /* ── Photo card ── */
        <div className="relative overflow-hidden rounded-[20px]" style={{ aspectRatio: '4/3' }}
             role="img" aria-label={entry.title || 'Journal entry'}>
          {/* Background photo */}
          <img src={images[0].url} alt="" className="absolute inset-0 w-full h-full object-cover" />

          {/* Collage: 2nd and 3rd images as sidebar */}
          {images.length >= 2 && (
            <div className="absolute top-0 right-0 bottom-0 w-[35%] flex flex-col gap-px">
              {images.slice(1, 3).map((img, i) => (
                <div key={img.id} className="relative flex-1 overflow-hidden">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  {images.length > 3 && i === 1 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-base font-bold">+{images.length - 3}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

          {/* Text overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center gap-1.5 mb-1">
              {entry.mood && <span className="text-sm leading-none">{entry.mood}</span>}
              <span className="text-white/70 text-[11px] font-medium">
                {formatRelative(entry.createdAt)} · {formatTime(entry.createdAt)}
              </span>
              {videos.length > 0 && (
                <span className="ml-auto text-white/60 text-[10px] flex items-center gap-0.5">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  {videos.length}
                </span>
              )}
            </div>
            <h3 className="text-white font-bold text-[17px] leading-snug drop-shadow">
              {entry.title || truncate(entry.content, 60)}
            </h3>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-[10px] font-medium text-white/85 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
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
          {/* Thin accent bar — color by mood presence */}
          <div className={`h-[3px] ${entry.mood ? 'bg-gradient-to-r from-indigo-500 to-purple-400' : 'bg-gradient-to-r from-gray-200 to-gray-100'}`} />
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2.5">
              {entry.mood ? (
                <span className="text-[18px] leading-none">{entry.mood}</span>
              ) : (
                <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
                  <svg className="w-3 h-3 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                  </svg>
                </span>
              )}
              <div className="flex items-baseline gap-1.5">
                <span className="text-[12px] font-semibold text-indigo-600">{formatRelative(entry.createdAt)}</span>
                <span className="text-[11px] text-gray-400">{formatTime(entry.createdAt)}</span>
              </div>
              {videos.length > 0 && (
                <span className="ml-auto text-gray-400 text-[11px] flex items-center gap-0.5">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  {videos.length}
                </span>
              )}
            </div>

            {entry.title ? (
              <>
                <h3 className="font-bold text-gray-900 text-[17px] leading-snug">{entry.title}</h3>
                <p className="text-[14px] text-gray-500 leading-relaxed mt-1">{truncate(entry.content, 100)}</p>
              </>
            ) : (
              <p className="text-[15px] text-gray-800 leading-relaxed font-[Georgia,serif]">{truncate(entry.content, 130)}</p>
            )}

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-100">
                {tags.slice(0, 4).map(tag => (
                  <span key={tag} className="text-[11px] text-indigo-500 font-medium bg-indigo-50 px-2.5 py-0.5 rounded-full">
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
