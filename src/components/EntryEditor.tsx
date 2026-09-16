'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MediaUpload from './MediaUpload'
import { MOODS } from '@/lib/utils'

interface MediaItem {
  id: string; type: 'image' | 'video'; url: string; filename: string; size: number; preview?: string
}
interface InitialData {
  id?: string; title?: string; content?: string; mood?: string | null
  tags?: string[]; location?: string | null; media?: MediaItem[]
}

function todayLabel() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })
}

export default function EntryEditor({ initial }: { initial?: InitialData }) {
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
    return raw.split(/[,\s]+/).map(t => t.replace(/^#/, '').trim()).filter(Boolean)
  }

  async function handleSave() {
    if (!content.trim()) { setError('Write something first!'); return }
    setError('')
    setSaving(true)
    try {
      const body = {
        title: title.trim(), content: content.trim(),
        mood: mood || null, tags: parseTags(tagInput),
        location: location.trim() || null,
        mediaIds: media.map(m => m.id),
      }
      const url = isEdit ? `/api/entries/${initial!.id}` : '/api/entries'
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
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
      <div className="sticky top-0 z-10" style={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        paddingTop: 'env(safe-area-inset-top)',
      }}>
        <div className="flex items-center justify-between px-4 h-12">
          <button onClick={() => router.back()}
            className="flex items-center gap-0.5 text-[15px] font-semibold -ml-1 px-2 py-1.5"
            style={{ color: 'var(--primary)' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Cancel
          </button>
          <span className="text-[13px] font-semibold" style={{ color: 'var(--text-3)' }}>
            {isEdit ? 'Edit Entry' : todayLabel()}
          </span>
          <button onClick={handleSave} disabled={saving || !content.trim()}
            className="text-[15px] font-bold disabled:opacity-30 px-2 py-1.5"
            style={{ color: 'var(--primary)' }}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {error && (
          <div className="mx-4 mt-3 bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-xl font-medium">
            {error}
          </div>
        )}

        <div className="px-5 pt-5 pb-2">
          {/* Mood selector */}
          <div className="flex items-center gap-2 mb-5">
            <button type="button" onClick={() => setShowMoodPicker(!showMoodPicker)}
              className="flex items-center gap-2 rounded-2xl px-3.5 py-2.5 active:opacity-70 transition-opacity"
              style={{ background: 'rgba(0,0,0,0.04)' }}>
              {mood ? (
                <>
                  <span className="text-[20px] leading-none">{mood}</span>
                  <span className="text-[13px] font-semibold" style={{ color: 'var(--text-2)' }}>
                    Change mood
                  </span>
                </>
              ) : (
                <>
                  <svg className="w-4.5 h-4.5" style={{ color: 'var(--text-3)' }}
                       fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span className="text-[13px] font-semibold" style={{ color: 'var(--text-3)' }}>
                    How are you feeling?
                  </span>
                </>
              )}
            </button>
            {mood && (
              <button onClick={() => setMood('')}
                className="text-[12px] font-semibold px-2 py-1" style={{ color: 'var(--text-3)' }}>
                Clear
              </button>
            )}
          </div>

          {showMoodPicker && (
            <div className="rounded-2xl p-3 mb-5" style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div className="grid grid-cols-5 gap-1">
                {MOODS.map(m => (
                  <button key={m.emoji} type="button"
                    onClick={() => { setMood(m.emoji); setShowMoodPicker(false) }}
                    className="flex flex-col items-center p-2.5 rounded-xl active:scale-90 transition-transform"
                    style={{ background: mood === m.emoji ? 'var(--primary-tint)' : 'transparent',
                             outline: mood === m.emoji ? `1.5px solid var(--primary)` : 'none' }}>
                    <span className="text-[22px]">{m.emoji}</span>
                    <span className="text-[9px] font-medium mt-0.5" style={{ color: 'var(--text-3)' }}>
                      {m.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Title */}
          <input type="text" placeholder="Title"
            className="w-full text-[27px] font-bold placeholder:font-bold
                       bg-transparent border-none outline-none mb-2 tracking-tight"
            style={{ color: 'var(--text)', caretColor: 'var(--primary)' }}
            placeholder-style={{ color: 'rgba(0,0,0,0.15)' }}
            value={title} onChange={e => setTitle(e.target.value)} />

          <div style={{ height: 1, background: 'rgba(0,0,0,0.07)', marginBottom: 16 }} />

          {/* Content */}
          <textarea
            placeholder="What's on your mind…"
            className="w-full min-h-[260px] text-[16.5px] leading-[1.75]
                       bg-transparent border-none outline-none resize-none"
            style={{ color: 'var(--text)', fontFamily: 'Georgia, Charter, serif',
                     caretColor: 'var(--primary)' }}
            value={content} onChange={e => setContent(e.target.value)}
            autoFocus={!isEdit} />
        </div>

        {/* Media */}
        <div className="px-5 pb-5">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-3)' }}>
            Photos & Videos
          </p>
          <MediaUpload value={media} onChange={setMedia} />
        </div>

        {/* Tags & location */}
        <div className="px-5 pb-10">
          <button type="button" onClick={() => setShowExtras(!showExtras)}
            className="flex items-center gap-1.5 text-[13px] font-bold mb-3"
            style={{ color: 'var(--primary)' }}>
            <svg className={`w-3.5 h-3.5 transition-transform ${showExtras ? 'rotate-180' : ''}`}
                 fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            {showExtras ? 'Hide' : 'Tags & Location'}
          </button>

          {showExtras && (
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest block mb-2"
                       style={{ color: 'var(--text-3)' }}>Tags</label>
                <input type="text" placeholder="hiking, family, gratitude" className="input-field"
                  value={tagInput} onChange={e => setTagInput(e.target.value)} />
                <p className="text-[11px] mt-1 ml-1" style={{ color: 'var(--text-3)' }}>Separate with commas</p>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest block mb-2"
                       style={{ color: 'var(--text-3)' }}>Location</label>
                <input type="text" placeholder="Where are you?" className="input-field"
                  value={location} onChange={e => setLocation(e.target.value)} />
              </div>
            </div>
          )}

          <div className="text-right mt-5">
            <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>{content.length} characters</span>
          </div>
        </div>
      </div>
    </div>
  )
}
