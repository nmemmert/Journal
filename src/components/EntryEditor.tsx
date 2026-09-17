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
      if (res.status === 401) { router.push('/login'); return }
      let data: { error?: string; entry?: { id: string } } = {}
      try { data = await res.json() } catch { /* non-JSON response */ }
      if (!res.ok) { setError(data.error ?? `Save failed (${res.status})`); return }
      router.push(`/journal/${data.entry!.id}`)
      router.refresh()
    } catch {
      setError('Network error, please try again')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: '#111113',
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backgroundColor: 'rgba(17,17,19,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        paddingTop: 'env(safe-area-inset-top)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          height: '52px',
        }}>
          <button
            onClick={() => router.back()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              color: '#E8784F',
              fontSize: '15px',
              fontWeight: 600,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 4px',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor" strokeWidth="2.5"
                 strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 19l-7-7 7-7" />
            </svg>
            Cancel
          </button>

          <span style={{ color: 'rgba(242,242,247,0.38)', fontSize: '13px', fontWeight: 600 }}>
            {isEdit ? 'Edit Entry' : todayLabel()}
          </span>

          <button
            onClick={handleSave}
            disabled={saving || !content.trim()}
            style={{
              color: '#E8784F',
              fontSize: '16px',
              fontWeight: 700,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 4px',
              opacity: (saving || !content.trim()) ? 0.3 : 1,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {error && (
          <div style={{
            margin: '12px 16px 0',
            backgroundColor: 'rgba(239,68,68,0.15)',
            color: '#F87171',
            fontSize: '14px',
            fontWeight: 600,
            padding: '12px 16px',
            borderRadius: '12px',
            border: '1px solid rgba(239,68,68,0.25)',
          }}>
            {error}
          </div>
        )}

        <div style={{ padding: '20px 20px 8px' }}>
          {/* Mood selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <button
              type="button"
              onClick={() => setShowMoodPicker(!showMoodPicker)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '20px',
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.06)',
                border: 'none',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {mood ? (
                <>
                  <span style={{ fontSize: '20px', lineHeight: 1 }}>{mood}</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(242,242,247,0.55)' }}>
                    Change mood
                  </span>
                </>
              ) : (
                <>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24"
                       stroke="rgba(242,242,247,0.4)" strokeWidth="1.8"
                       strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(242,242,247,0.35)' }}>
                    How are you feeling?
                  </span>
                </>
              )}
            </button>
            {mood && (
              <button
                onClick={() => setMood('')}
                style={{
                  color: 'rgba(242,242,247,0.35)',
                  fontSize: '13px',
                  fontWeight: 600,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                Clear
              </button>
            )}
          </div>

          {showMoodPicker && (
            <div style={{
              borderRadius: '16px',
              padding: '12px',
              marginBottom: '20px',
              background: '#1C1C1E',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '4px',
              }}>
                {MOODS.map(m => (
                  <button
                    key={m.emoji}
                    type="button"
                    onClick={() => { setMood(m.emoji); setShowMoodPicker(false) }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '10px 4px',
                      borderRadius: '12px',
                      background: mood === m.emoji ? 'rgba(232,120,79,0.18)' : 'transparent',
                      border: mood === m.emoji ? '1.5px solid #E8784F' : '1.5px solid transparent',
                      cursor: 'pointer',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    <span style={{ fontSize: '22px' }}>{m.emoji}</span>
                    <span style={{ fontSize: '9px', fontWeight: 500, color: 'rgba(242,242,247,0.4)', marginTop: '2px' }}>
                      {m.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Title */}
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{
              display: 'block',
              width: '100%',
              fontSize: '27px',
              fontWeight: 700,
              color: '#F2F2F7',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              marginBottom: '8px',
              caretColor: '#E8784F',
              letterSpacing: '-0.02em',
              boxSizing: 'border-box',
            }}
          />

          <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: '16px' }} />

          {/* Content */}
          <textarea
            placeholder="What's on your mind…"
            value={content}
            onChange={e => setContent(e.target.value)}
            autoFocus={!isEdit}
            rows={12}
            style={{
              display: 'block',
              width: '100%',
              fontSize: '17px',
              lineHeight: 1.75,
              color: '#F2F2F7',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              fontFamily: 'Georgia, Charter, serif',
              caretColor: '#E8784F',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Media */}
        <div style={{ padding: '0 20px 20px' }}>
          <p style={{
            fontSize: '10px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'rgba(242,242,247,0.3)',
            marginBottom: '12px',
          }}>
            Photos & Videos
          </p>
          <MediaUpload value={media} onChange={setMedia} />
        </div>

        {/* Tags & Location */}
        <div style={{ padding: '0 20px 40px' }}>
          <button
            type="button"
            onClick={() => setShowExtras(!showExtras)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              fontWeight: 700,
              color: '#E8784F',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              marginBottom: '12px',
              padding: '4px 0',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <svg
              width="14" height="14"
              style={{ transform: showExtras ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M19 9l-7 7-7-7" />
            </svg>
            {showExtras ? 'Hide extras' : 'Tags & Location'}
          </button>

          {showExtras && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'rgba(242,242,247,0.3)',
                  marginBottom: '8px',
                }}>Tags</label>
                <input
                  type="text"
                  placeholder="hiking, family, gratitude"
                  className="input-field"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                />
                <p style={{ fontSize: '11px', marginTop: '4px', marginLeft: '4px', color: 'rgba(242,242,247,0.3)' }}>
                  Separate with commas
                </p>
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'rgba(242,242,247,0.3)',
                  marginBottom: '8px',
                }}>Location</label>
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

          <div style={{ textAlign: 'right', marginTop: '20px' }}>
            <span style={{ fontSize: '11px', color: 'rgba(242,242,247,0.3)' }}>
              {content.length} chars
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
