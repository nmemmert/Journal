'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MediaUpload from './MediaUpload'
import { MOODS } from '@/lib/utils'

interface MediaItem {
  id: string
  type: 'image' | 'video'
  url: string
  filename: string
  size: number
  preview?: string
}

interface InitialData {
  id?: string
  title?: string
  content?: string
  mood?: string | null
  tags?: string[]
  location?: string | null
  media?: MediaItem[]
}

interface Props {
  initial?: InitialData
}

export default function EntryEditor({ initial }: Props) {
  const router = useRouter()
  const isEdit = Boolean(initial?.id)

  const [title, setTitle] = useState(initial?.title ?? '')
  const [content, setContent] = useState(initial?.content ?? '')
  const [mood, setMood] = useState(initial?.mood ?? '')
  const [tagInput, setTagInput] = useState((initial?.tags ?? []).join(', '))
  const [location, setLocation] = useState(initial?.location ?? '')
  const [media, setMedia] = useState<MediaItem[]>(initial?.media ?? [])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showMoodPicker, setShowMoodPicker] = useState(false)
  const [showExtras, setShowExtras] = useState(false)

  function parseTags(raw: string): string[] {
    return raw
      .split(/[,\s]+/)
      .map(t => t.replace(/^#/, '').trim())
      .filter(Boolean)
  }

  async function handleSave() {
    if (!content.trim()) { setError('Write something first!'); return }
    setError('')
    setSaving(true)

    try {
      const body = {
        title: title.trim(),
        content: content.trim(),
        mood: mood || null,
        tags: parseTags(tagInput),
        location: location.trim() || null,
        mediaIds: media.map(m => m.id),
      }

      const url = isEdit ? `/api/entries/${initial!.id}` : '/api/entries'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Save failed'); return }

      router.push(`/journal/${data.entry.id}`)
      router.refresh()
    } catch {
      setError('Network error, please try again')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 pt-[env(safe-area-inset-top)]">
        <div className="flex items-center justify-between h-14">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-indigo-600 font-medium -ml-1 px-2 py-1"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Cancel
          </button>
          <span className="font-semibold text-gray-900">{isEdit ? 'Edit Entry' : 'New Entry'}</span>
          <button
            onClick={handleSave}
            disabled={saving || !content.trim()}
            className="text-indigo-600 font-semibold disabled:opacity-40 px-2 py-1"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <div className="flex-1 px-4 pt-4 pb-8 space-y-4 overflow-y-auto">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-2xl">{error}</div>
        )}

        {/* Mood row */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowMoodPicker(!showMoodPicker)}
            className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-2.5 text-sm font-medium text-gray-700 active:bg-gray-100"
          >
            {mood ? (
              <><span className="text-xl">{mood}</span><span>Change mood</span></>
            ) : (
              <><span className="text-gray-400">😶</span><span>Add mood</span></>
            )}
          </button>
          {mood && (
            <button onClick={() => setMood('')} className="text-gray-400 text-sm">Clear</button>
          )}
        </div>

        {showMoodPicker && (
          <div className="bg-gray-50 rounded-2xl p-3">
            <div className="grid grid-cols-5 gap-2">
              {MOODS.map(m => (
                <button
                  key={m.emoji}
                  type="button"
                  onClick={() => { setMood(m.emoji); setShowMoodPicker(false) }}
                  className={`flex flex-col items-center p-2 rounded-xl active:scale-90 transition-transform ${mood === m.emoji ? 'bg-indigo-100' : 'hover:bg-gray-100'}`}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-[9px] text-gray-500 mt-0.5">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Title */}
        <input
          type="text"
          placeholder="Title (optional)"
          className="w-full text-2xl font-semibold text-gray-900 placeholder-gray-300 bg-transparent border-none outline-none"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        {/* Content */}
        <textarea
          placeholder="What's on your mind today…"
          className="w-full min-h-[200px] text-gray-800 text-base leading-relaxed placeholder-gray-300 bg-transparent border-none outline-none resize-none"
          value={content}
          onChange={e => setContent(e.target.value)}
          autoFocus={!isEdit}
        />

        {/* Media */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Photos & Videos</p>
          <MediaUpload value={media} onChange={setMedia} />
        </div>

        {/* Extras toggle */}
        <button
          type="button"
          onClick={() => setShowExtras(!showExtras)}
          className="flex items-center gap-2 text-sm text-gray-500 font-medium"
        >
          <svg className={`w-4 h-4 transition-transform ${showExtras ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          {showExtras ? 'Hide details' : 'Add tags & location'}
        </button>

        {showExtras && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Tags</label>
              <input
                type="text"
                placeholder="travel, family, gratitude"
                className="input-field"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1 ml-1">Separate with commas</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Location</label>
              <input
                type="text"
                placeholder="Where are you?"
                className="input-field"
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Character count */}
        <div className="text-right">
          <span className="text-xs text-gray-300">{content.length} characters</span>
        </div>
      </div>
    </div>
  )
}
