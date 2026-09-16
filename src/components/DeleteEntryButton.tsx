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
      <div className="flex items-center gap-2">
        <button onClick={() => setConfirming(false)}
          className="text-[13px] font-semibold bg-black/30 backdrop-blur-md text-white px-3 py-1.5 rounded-full">
          Cancel
        </button>
        <button onClick={handleDelete} disabled={deleting}
          className="text-[13px] font-medium bg-red-500 text-white px-3 py-1.5 rounded-full disabled:opacity-50">
          {deleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    )
  }

  return (
    <button onClick={() => setConfirming(true)}
      className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
        dark ? 'bg-black/30 backdrop-blur-md text-white active:bg-black/50' : 'text-stone-400 active:bg-stone-100'
      }`}>
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  )
}
