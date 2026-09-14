'use client'

import { useState, useEffect, useCallback } from 'react'
import EntryCard from '@/components/EntryCard'
import { useSearchParams } from 'next/navigation'

interface Media { id: string; type: string; url: string }
interface Entry {
  id: string; title: string; content: string; mood: string | null
  tags: string | null; createdAt: string; media: Media[]
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialTag = searchParams.get('tag') ?? ''

  const [query, setQuery] = useState(initialTag ? `#${initialTag}` : '')
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const search = useCallback(async (q: string) => {
    setLoading(true)
    setSearched(true)
    const tag = q.startsWith('#') ? q.slice(1) : ''
    const text = !q.startsWith('#') ? q : ''
    const params = new URLSearchParams()
    if (text) params.set('search', text)
    if (tag) params.set('tag', tag)
    const res = await fetch(`/api/entries?${params}`)
    const data = await res.json()
    setEntries(data.entries ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (initialTag) search(`#${initialTag}`)
  }, [initialTag, search])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) search(query.trim())
  }

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#faf9f7]/90 backdrop-blur-lg border-b border-gray-100 px-4"
           style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center h-14">
          <h1 className="text-xl font-bold text-gray-900 w-20">Search</h1>
          <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
            <input
              type="search"
              placeholder="Search entries or #tag…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1 bg-gray-100 rounded-2xl px-4 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500"
              autoComplete="off"
            />
            <button type="submit" className="text-indigo-600 font-medium text-sm px-1">
              Go
            </button>
          </form>
        </div>
      </div>

      <div className="px-4 py-4">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && searched && entries.length === 0 && (
          <div className="text-center py-16">
            <span className="text-4xl">🔍</span>
            <p className="text-gray-500 mt-4">No entries found</p>
          </div>
        )}

        {!loading && !searched && (
          <div className="text-center py-16 text-gray-400">
            <span className="text-4xl">🔍</span>
            <p className="mt-4 text-sm">Search by keyword or #tag</p>
          </div>
        )}

        {!loading && entries.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 mb-2">{entries.length} result{entries.length !== 1 ? 's' : ''}</p>
            {entries.map(entry => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
