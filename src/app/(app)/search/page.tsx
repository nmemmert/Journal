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
    <div className="min-h-screen">
      <div className="page-header" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="px-5 pt-4 pb-3">
          <h1 className="text-[34px] font-black tracking-tight mb-3" style={{ color: 'var(--text)' }}>
            Search
          </h1>
          <form onSubmit={handleSubmit} className="flex gap-2 items-center">
            <div className="flex-1 relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                   style={{ color: 'var(--text-3)' }}
                   fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                placeholder="Search entries or #tag…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full bg-white rounded-2xl pl-10 pr-4 py-3 text-[15px] outline-none"
                style={{ color: 'var(--text)', boxShadow: 'var(--card-shadow-sm)', border: 'none' }}
                autoComplete="off"
              />
            </div>
            <button type="submit" className="text-[15px] font-bold px-2"
                    style={{ color: 'var(--primary)' }}>
              Go
            </button>
          </form>
        </div>
      </div>

      <div className="px-4 py-4">
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-7 h-7 rounded-full animate-spin"
                 style={{ border: '2.5px solid var(--primary)', borderTopColor: 'transparent' }} />
          </div>
        )}

        {!loading && searched && entries.length === 0 && (
          <div className="flex flex-col items-center py-24 text-center">
            <div className="w-18 h-18 rounded-3xl flex items-center justify-center mb-4"
                 style={{ background: 'rgba(255,255,255,0.85)', boxShadow: 'var(--card-shadow)' }}>
              <span className="text-4xl">🔍</span>
            </div>
            <p className="text-[16px] font-semibold" style={{ color: 'var(--text)' }}>No entries found</p>
            <p className="text-[14px] mt-1" style={{ color: 'var(--text-3)' }}>Try a different word or #tag</p>
          </div>
        )}

        {!loading && !searched && (
          <div className="flex flex-col items-center py-24 text-center">
            <div className="w-18 h-18 rounded-3xl flex items-center justify-center mb-4"
                 style={{ background: 'rgba(255,255,255,0.85)', boxShadow: 'var(--card-shadow)' }}>
              <span className="text-4xl">🔍</span>
            </div>
            <p className="text-[14px]" style={{ color: 'var(--text-3)' }}>Search by keyword or #tag</p>
          </div>
        )}

        {!loading && entries.length > 0 && (
          <div className="space-y-4">
            <p className="text-[11px] font-bold uppercase tracking-widest px-1 mb-1"
               style={{ color: 'var(--text-3)' }}>
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
