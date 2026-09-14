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
    <div>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#faf9f7]/90 backdrop-blur-lg border-b border-gray-100"
           style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center justify-between px-4 h-14">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Journal</h1>
            <p className="text-xs text-gray-400">{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</p>
          </div>
          <Link href="/journal/new"
            className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-transform">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </Link>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
          <div className="w-24 h-24 bg-indigo-50 rounded-3xl flex items-center justify-center mb-5">
            <span className="text-5xl">📔</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Your journal is empty</h2>
          <p className="text-gray-500 text-sm mb-8 max-w-xs">
            Capture your thoughts, memories, and moments. Start with your first entry.
          </p>
          <Link href="/journal/new" className="btn-primary">
            Write your first entry
          </Link>
        </div>
      ) : (
        <div className="px-4 py-4 space-y-6">
          {Object.entries(groups).map(([date, dayEntries]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-sm font-semibold ${date === today ? 'text-indigo-600' : 'text-gray-500'}`}>
                  {date === today ? 'Today' : date}
                </span>
                <div className="flex-1 h-px bg-gray-100" />
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
