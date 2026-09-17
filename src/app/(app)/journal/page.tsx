import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import EntryCard from '@/components/EntryCard'

function groupByMonth(entries: { createdAt: Date | string }[]) {
  const groups: Record<string, typeof entries> = {}
  for (const entry of entries) {
    const d = new Date(entry.createdAt)
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`
    if (!groups[key]) groups[key] = []
    groups[key].push(entry)
  }
  return groups
}

function getMonthLabel(key: string) {
  const [year, month] = key.split('-').map(Number)
  const d = new Date(year, month, 1)
  const thisYear = new Date().getFullYear()
  return d.toLocaleDateString('en-US', {
    month: 'long',
    ...(year !== thisYear ? { year: 'numeric' } : {}),
  })
}

export default async function JournalPage() {
  const auth = await getAuthUser()
  if (!auth) redirect('/login')

  const [allEntries, recentEntries] = await Promise.all([
    prisma.entry.findMany({
      where: { userId: auth.userId },
      select: { createdAt: true, content: true },
    }),
    prisma.entry.findMany({
      where: { userId: auth.userId },
      include: { media: { orderBy: { createdAt: 'asc' } } },
      orderBy: { createdAt: 'desc' },
      take: 60,
    }),
  ])

  const thisYear = new Date().getFullYear()
  const yearEntries = allEntries.filter(e => new Date(e.createdAt).getFullYear() === thisYear)
  const entriesThisYear = yearEntries.length
  const daysJournaled = new Set(yearEntries.map(e => new Date(e.createdAt).toDateString())).size
  const totalWords = allEntries.reduce((sum, e) => {
    return sum + (e.content?.split(/\s+/).filter(Boolean).length ?? 0)
  }, 0)

  const groups = groupByMonth(recentEntries as unknown as { createdAt: Date }[])

  return (
    <div className="min-h-screen">
      <div className="page-header" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 12px' }}>
          <h1 className="text-[34px] font-black tracking-tight" style={{ color: 'var(--text)' }}>
            Journal
          </h1>
          <Link href="/journal/new"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              background: 'linear-gradient(145deg, #E8784F, #C45A30)',
              boxShadow: '0 4px 12px rgba(232,120,79,0.4)',
            }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"
                 stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4v16m8-8H4" />
            </svg>
          </Link>
        </div>
      </div>

      {recentEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[65vh] px-8 text-center">
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6"
               style={{ background: 'var(--card)', boxShadow: 'var(--card-shadow)' }}>
            <span className="text-5xl">📔</span>
          </div>
          <h2 className="text-[22px] font-bold mb-2" style={{ color: 'var(--text)' }}>Start Your Journal</h2>
          <p className="text-[15px] mb-8 max-w-[260px] leading-relaxed" style={{ color: 'var(--text-2)' }}>
            Capture your thoughts, photos, and moments — all in one place.
          </p>
          <Link href="/journal/new" className="btn-primary text-[15px]">
            Write First Entry
          </Link>
        </div>
      ) : (
        <div className="pt-4 pb-4">
          {/* Insights card */}
          <div className="mx-4 mb-5 rounded-3xl p-5 overflow-hidden relative"
               style={{ background: 'linear-gradient(135deg, #2A1B60 0%, #4A30A0 50%, #6B48CC 100%)',
                        boxShadow: '0 4px 24px rgba(74,48,160,0.4)' }}>
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-15"
                 style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)',
                          transform: 'translate(30%,-30%)' }} />
            <p className="text-white/60 text-[11px] font-bold uppercase tracking-widest mb-4">Insights</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: entriesThisYear, label: 'Entries\nThis Year' },
                { value: daysJournaled,   label: 'Days\nJournaled' },
                { value: totalWords >= 1000 ? `${(totalWords / 1000).toFixed(1)}k` : totalWords, label: 'Words\nAll Time' },
              ].map(stat => (
                <div key={stat.label} className="text-center">
                  <p className="text-white text-[30px] font-black leading-none">{stat.value}</p>
                  <p className="text-white/55 text-[10px] font-semibold mt-2 leading-tight whitespace-pre-line">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Entries grouped by month */}
          <div className="space-y-6 px-4">
            {Object.entries(groups).map(([key, monthEntries]) => (
              <div key={key}>
                <h2 className="text-[13px] font-bold uppercase tracking-widest mb-3 px-1"
                    style={{ color: 'var(--text-3)' }}>
                  {getMonthLabel(key)}
                </h2>
                <div className="space-y-3">
                  {(monthEntries as typeof recentEntries).map(entry => (
                    <EntryCard key={entry.id}
                               entry={entry as unknown as Parameters<typeof EntryCard>[0]['entry']} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
