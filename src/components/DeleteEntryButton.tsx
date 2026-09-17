'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteEntryButton({ entryId, dark }: { entryId: string; dark?: boolean }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    await fetch(`/api/entries/${entryId}`, { method: 'DELETE' })
    router.push('/journal')
    router.refresh()
  }

  if (confirming) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={() => setConfirming(false)}
          style={{
            fontSize: '13px', fontWeight: 600,
            background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)',
            color: 'white', padding: '6px 12px', borderRadius: '100px',
            border: 'none', cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          style={{
            fontSize: '13px', fontWeight: 500,
            background: '#EF4444', color: 'white',
            padding: '6px 12px', borderRadius: '100px',
            border: 'none', cursor: 'pointer',
            opacity: deleting ? 0.5 : 1,
          }}
        >
          {deleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      style={{
        width: '32px', height: '32px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: '50%',
        background: dark ? 'rgba(0,0,0,0.3)' : 'transparent',
        backdropFilter: dark ? 'blur(8px)' : undefined,
        color: dark ? 'white' : 'rgba(120,113,108,0.8)',
        border: 'none', cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24"
           stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  )
}
