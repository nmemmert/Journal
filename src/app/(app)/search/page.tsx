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
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="page-header" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="px-5 pt-3 pb-3">
          <h1 className="text-[34px] font-bold tracking-tight text-stone-900 mb-3">Search</h1>
          <form onSubmit={handleSubmit} className="flex gap-2 items-center">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none"
                   fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                placeholder="Search entries or #tag…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full bg-white rounded-2xl pl-9 pr-4 py-2.5 text-[15px] text-stone-900
                           placeholder-stone-400 outline-none focus:ring-2 focus:ring-amber-500/30
                           shadow-card"
                autoComplete="off"
              />
            </div>
            <button type="submit"
              className="text-amber-600 font-bold text-[15px] px-2">
              Go
            </button>
          </form>
        </div>
      </div>

      <div className="px-4 py-4">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-7 h-7 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && searched && entries.length === 0 && (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-card flex items-center justify-center mb-4">
              <span className="text-3xl">🔍</span>
            </div>
            <p className="text-stone-500 font-medium">No entries found</p>
            <p className="text-stone-400 text-sm mt-1">Try a different word or tag</p>
          </div>
        )}

        {!loading && !searched && (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-card flex items-center justify-center mb-4">
              <span className="text-3xl">🔍</span>
            </div>
            <p className="text-stone-400 text-sm">Search by keyword or #tag</p>
          </div>
        )}

        {!loading && entries.length > 0 && (
          <div className="space-y-3">
            <p className="text-[12px] font-semibold text-stone-400 uppercase tracking-wider px-1 mb-2">
              {entries.length} result{entries.length !== 1 ? 's' : ''}
            </p>
            {entries.map(entry => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
