import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import EntryCard from '@/components/EntryCard'
import { formatDate } from '@/lib/utils'

function groupByDate(entries: { createdAt: Date }[]) {
  const groups: Record<string, typeof entries> = {}
  for (const entry of entries) {
    const key = formatDate(entry.createdAt)
    if (!groups[key]) groups[key] = []
    groups[key].push(entry)
  }
  return groups
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
  const today = formatDate(new Date())

  return (
    <div className="bg-[#f2f2f7] min-h-screen">
      {/* Large iOS-style header */}
      <div className="sticky top-0 z-10 bg-[#f2f2f7]/90 backdrop-blur-xl"
           style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center justify-between px-5 pt-3 pb-2">
          <h1 className="text-[34px] font-bold tracking-tight text-gray-900">Journal</h1>
          <Link href="/journal/new"
            className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-transform">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </Link>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[65vh] px-8 text-center">
          <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-5">
            <span className="text-4xl">📔</span>
          </div>
          <h2 className="text-[22px] font-bold text-gray-900 mb-2">Start Your Journal</h2>
          <p className="text-gray-500 text-[15px] mb-8 max-w-[260px] leading-relaxed">
            Capture your thoughts, photos, and moments — all in one beautiful place.
          </p>
          <Link href="/journal/new" className="btn-primary text-[15px]">
            Write First Entry
          </Link>
        </div>
      ) : (
        <div className="px-4 pt-1 pb-6 space-y-5">
          {Object.entries(groups).map(([date, dayEntries]) => (
            <div key={date}>
              {/* Date header */}
              <div className="flex items-center gap-3 mb-3 px-1">
                <span className={`text-[13px] font-semibold uppercase tracking-wider ${
                  date === today ? 'text-indigo-600' : 'text-gray-400'
                }`}>
                  {date === today ? 'Today' : date}
                </span>
                <div className="flex-1 h-px bg-gray-200/80" />
              </div>
              <div className="space-y-3">
                {(dayEntries as typeof entries).map(entry => (
                  <EntryCard key={entry.id} entry={entry as unknown as Parameters<typeof EntryCard>[0]['entry']} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
