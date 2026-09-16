import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import EntryCard from '@/components/EntryCard'

function groupByDate(entries: { createdAt: Date }[]) {
  const groups: Record<string, typeof entries> = {}
  for (const entry of entries) {
    const d = new Date(entry.createdAt)
    const key = d.toDateString()
    if (!groups[key]) groups[key] = []
    groups[key].push(entry)
  }
  return groups
}

function formatGroupHeader(dateStr: string): { label: string; sub: string; isToday: boolean } {
  const d = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const isToday = d.toDateString() === today.toDateString()
  const isYesterday = d.toDateString() === yesterday.toDateString()

  if (isToday) return { label: 'Today', sub: d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }), isToday: true }
  if (isYesterday) return { label: 'Yesterday', sub: d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }), isToday: false }

  const diffMs = today.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 7) {
    return {
      label: d.toLocaleDateString('en-US', { weekday: 'long' }),
      sub: d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
      isToday: false,
    }
  }

  return {
    label: d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
    sub: d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric' }),
    isToday: false,
  }
}

export default async function JournalPage() {
  const auth = await getAuthUser()
  if (!auth) redirect('/login')

  const entries = await prisma.entry.findMany({
    where: { userId: auth.userId },
    include: { media: { orderBy: { createdAt: 'asc' } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const groups = groupByDate(entries as unknown as { createdAt: Date }[])

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Large iOS-style header */}
      <div className="page-header" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center justify-between px-5 pt-3 pb-2.5">
          <h1 className="text-[34px] font-bold tracking-tight text-stone-900">Journal</h1>
          <Link href="/journal/new"
            className="w-9 h-9 bg-amber-600 rounded-full flex items-center justify-center
                       shadow-md shadow-amber-300/40 active:scale-90 transition-transform">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </Link>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[65vh] px-8 text-center">
          <div className="w-24 h-24 bg-white rounded-3xl shadow-card flex items-center justify-center mb-6">
            <span className="text-5xl">📔</span>
          </div>
          <h2 className="text-[22px] font-bold text-stone-900 mb-2">Start Your Journal</h2>
          <p className="text-stone-500 text-[15px] mb-8 max-w-[260px] leading-relaxed">
            Capture your thoughts, photos, and moments — all in one beautiful place.
          </p>
          <Link href="/journal/new" className="btn-primary text-[15px]">
            Write First Entry
          </Link>
        </div>
      ) : (
        <div className="px-4 pt-1 pb-6 space-y-6">
          {Object.entries(groups).map(([dateStr, dayEntries]) => {
            const { label, sub, isToday } = formatGroupHeader(dateStr)
            return (
              <div key={dateStr}>
                {/* Date group header */}
                <div className="flex items-baseline gap-2 mb-3 px-1">
                  <span className={`text-[15px] font-bold ${isToday ? 'text-amber-600' : 'text-stone-700'}`}>
                    {label}
                  </span>
                  <span className="text-[12px] text-stone-400 font-medium">{sub}</span>
                  <div className="flex-1 h-px bg-stone-200/70 ml-1" />
                </div>
                <div className="space-y-3">
                  {(dayEntries as typeof entries).map(entry => (
                    <EntryCard key={entry.id} entry={entry as unknown as Parameters<typeof EntryCard>[0]['entry']} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
