'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteEntryButton({ entryId }: { entryId: string }) {
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
        <button
          onClick={() => setConfirming(false)}
          className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-full"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-3 py-1.5 text-sm font-medium text-white bg-red-500 rounded-full disabled:opacity-50"
        >
          {deleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="w-9 h-9 flex items-center justify-center text-gray-400 active:bg-gray-100 rounded-full"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  )
}
