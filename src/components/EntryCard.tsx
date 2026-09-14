import Link from 'next/link'
import Image from 'next/image'
import { formatRelative, formatTime, parseTags, truncate } from '@/lib/utils'

interface Media {
  id: string
  type: string
  url: string
}

interface Entry {
  id: string
  title: string
  content: string
  mood: string | null
  tags: string | null
  createdAt: string | Date
  media: Media[]
}

export default function EntryCard({ entry }: { entry: Entry }) {
  const tags = parseTags(entry.tags)
  const images = entry.media.filter(m => m.type === 'image')
  const videos = entry.media.filter(m => m.type === 'video')
  const hasMedia = entry.media.length > 0

  return (
    <Link href={`/journal/${entry.id}`} className="block card overflow-hidden active:scale-[0.98] transition-transform">
      {/* Images */}
      {images.length > 0 && (
        <div className={`grid gap-0.5 ${images.length === 1 ? 'grid-cols-1' : images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {images.slice(0, 3).map((img, i) => (
            <div key={img.id} className="relative aspect-square bg-gray-100">
              <img src={img.url} alt="" className="w-full h-full object-cover" />
              {images.length > 3 && i === 2 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">+{images.length - 3}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Video thumbnail */}
      {images.length === 0 && videos.length > 0 && (
        <div className="relative aspect-video bg-gray-900 flex items-center justify-center">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          {videos.length > 1 && (
            <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
              {videos.length} videos
            </span>
          )}
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              {entry.mood && <span className="text-base">{entry.mood}</span>}
              <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                {formatRelative(entry.createdAt)}
              </span>
              <span className="text-xs text-gray-400">{formatTime(entry.createdAt)}</span>
            </div>
            {entry.title && (
              <h3 className="font-semibold text-gray-900 text-base leading-snug truncate">
                {entry.title}
              </h3>
            )}
          </div>
          {hasMedia && (
            <div className="flex items-center gap-1 text-gray-400 flex-shrink-0">
              {images.length > 0 && (
                <span className="text-xs flex items-center gap-0.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {images.length}
                </span>
              )}
              {videos.length > 0 && (
                <span className="text-xs flex items-center gap-0.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {videos.length}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Content preview */}
        <p className="text-gray-600 text-sm leading-relaxed">
          {truncate(entry.content, 120)}
        </p>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {tags.slice(0, 4).map(tag => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                #{tag}
              </span>
            ))}
            {tags.length > 4 && (
              <span className="text-xs text-gray-400">+{tags.length - 4}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
