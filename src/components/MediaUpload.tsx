'use client'

import { useRef, useState } from 'react'
import { formatFileSize } from '@/lib/utils'

interface MediaItem {
  id: string
  type: 'image' | 'video'
  url: string
  filename: string
  size: number
  preview?: string
}

interface Props {
  value: MediaItem[]
  onChange: (items: MediaItem[]) => void
}

export default function MediaUpload({ value, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<Record<string, number>>({})
  const [errors, setErrors] = useState<string[]>([])

  async function uploadFile(file: File): Promise<MediaItem | null> {
    const formData = new FormData()
    formData.append('file', file)

    const tempId = Math.random().toString(36)
    setProgress(p => ({ ...p, [tempId]: 0 }))

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      setProgress(p => { const n = { ...p }; delete n[tempId]; return n })

      if (!res.ok) {
        setErrors(e => [...e, data.error ?? 'Upload failed'])
        return null
      }

      const { media } = data
      const isImage = media.type === 'image'
      let preview: string | undefined

      if (isImage) {
        preview = URL.createObjectURL(file)
      }

      return {
        id: media.id,
        type: media.type,
        url: media.url,
        filename: media.filename,
        size: media.size,
        preview,
      }
    } catch {
      setProgress(p => { const n = { ...p }; delete n[tempId]; return n })
      setErrors(e => [...e, `Failed to upload ${file.name}`])
      return null
    }
  }

  async function handleFiles(files: FileList) {
    setErrors([])
    setUploading(true)
    const results: MediaItem[] = []

    for (const file of Array.from(files)) {
      const item = await uploadFile(file)
      if (item) results.push(item)
    }

    onChange([...value, ...results])
    setUploading(false)
  }

  function remove(id: string) {
    onChange(value.filter(m => m.id !== id))
  }

  const inProgress = Object.keys(progress).length

  return (
    <div className="space-y-3">
      {/* Error messages */}
      {errors.map((err, i) => (
        <div key={i} className="text-sm px-4 py-2 rounded-2xl flex items-center justify-between"
             style={{ background: 'rgba(239,68,68,0.15)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)' }}>
          <span>{err}</span>
          <button onClick={() => setErrors(e => e.filter((_, j) => j !== i))} className="ml-2 text-red-400">✕</button>
        </div>
      ))}

      {/* Media grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {value.map(item => (
            <div key={item.id} className="relative group aspect-square rounded-2xl overflow-hidden bg-gray-100">
              {item.type === 'image' ? (
                <img src={item.preview ?? item.url} alt={item.filename} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white p-2">
                  <svg className="w-8 h-8 mb-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span className="text-[10px] text-center truncate w-full text-gray-300">{item.filename}</span>
                  <span className="text-[9px] text-gray-400">{formatFileSize(item.size)}</span>
                </div>
              )}
              <button
                onClick={() => remove(item.id)}
                className="absolute top-1.5 right-1.5 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center text-white text-sm leading-none"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload progress */}
      {inProgress > 0 && (
        <div className="flex items-center gap-3 bg-indigo-50 px-4 py-3 rounded-2xl">
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
          <span className="text-sm text-indigo-700 font-medium">
            Uploading {inProgress} file{inProgress > 1 ? 's' : ''}…
          </span>
        </div>
      )}

      {/* Upload button */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-full flex items-center justify-center gap-3 border-2 border-dashed border-gray-200 rounded-2xl py-4 text-gray-500 active:bg-gray-50 transition-colors disabled:opacity-50"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        <span className="font-medium text-sm">Add Photos or Videos</span>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={e => e.target.files && handleFiles(e.target.files)}
        capture={undefined}
      />
    </div>
  )
}
