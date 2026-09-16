import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import EntryCard from '@/components/EntryCard'

function groupByDate(entries: { createdAt: Date }[]) {
  const groups: Record<string, typeof entries> = {}
  for (const entry of entries) {
    const key = new Date(entry.createdAt).toDateString()
    if (!groups[key]) groups[key] = []
    groups[key].push(entry)
  }
  return groups
}

function parseDateHeader(dateStr: string) {
  const d = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const isToday     = d.toDateString() === today.toDateString()
  const isYesterday = d.toDateString() === yesterday.toDateString()

  const day  = d.getDate()
  const week = d.toLocaleDateString('en-US', { weekday: 'long' })
  const mon  = d.toLocaleDateString('en-US', { month: 'short' })
  const yr   = d.getFullYear()
  const thisYear = today.getFullYear()

  return {
    day,
    weekday: isToday ? 'Today' : isYesterday ? 'Yesterday' : week,
    sub: `${mon} ${yr !== thisYear ? yr : ''}`.trim(),
    isToday,
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
    <div className="min-h-screen">
      {/* Header */}
      <div className="page-header" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <h1 className="text-[34px] font-black tracking-tight" style={{ color: 'var(--text)' }}>
            Journal
          </h1>
          <Link href="/journal/new"
            className="w-9 h-9 rounded-full flex items-center justify-center
                       active:scale-90 transition-transform"
            style={{
              background: 'linear-gradient(145deg, #D4681E, #B84A0D)',
              boxShadow: '0 4px 12px rgba(196,89,26,0.4)',
            }}>
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </Link>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[65vh] px-8 text-center">
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6"
               style={{ background: 'rgba(255,255,255,0.8)', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
            <span className="text-5xl">📔</span>
          </div>
          <h2 className="text-[22px] font-bold mb-2" style={{ color: 'var(--text)' }}>Start Your Journal</h2>
          <p className="text-[15px] mb-8 max-w-[260px] leading-relaxed" style={{ color: 'var(--text-2)' }}>
            Capture your thoughts, photos, and moments — all in one beautiful place.
          </p>
          <Link href="/journal/new" className="btn-primary text-[15px]">
            Write First Entry
          </Link>
        </div>
      ) : (
        <div className="px-4 pt-2 pb-4 space-y-7">
          {Object.entries(groups).map(([dateStr, dayEntries]) => {
            const { day, weekday, sub, isToday } = parseDateHeader(dateStr)
            return (
              <div key={dateStr}>
                {/* Calendar-style date header */}
                <div className="flex items-end gap-3 mb-4 px-1">
                  <span className="text-[52px] font-black leading-none tracking-tight"
                        style={{ color: isToday ? 'var(--primary)' : 'rgba(0,0,0,0.13)' }}>
                    {day}
                  </span>
                  <div className="mb-1">
                    <p className="text-[15px] font-bold leading-none"
                       style={{ color: isToday ? 'var(--primary)' : 'var(--text)' }}>
                      {weekday}
                    </p>
                    <p className="text-[12px] font-semibold mt-0.5" style={{ color: 'var(--text-3)' }}>
                      {sub}
                    </p>
                  </div>
                  <div className="flex-1 mb-2" style={{ height: 1, background: 'rgba(0,0,0,0.08)' }} />
                </div>

                <div className="space-y-4">
                  {(dayEntries as typeof entries).map(entry => (
                    <EntryCard key={entry.id}
                               entry={entry as unknown as Parameters<typeof EntryCard>[0]['entry']} />
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
