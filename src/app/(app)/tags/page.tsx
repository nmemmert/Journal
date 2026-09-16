import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { parseTags } from '@/lib/utils'

export default async function TagsPage() {
  const auth = await getAuthUser()
  if (!auth) redirect('/login')

  const entries = await prisma.entry.findMany({
    where: { userId: auth.userId },
    select: { tags: true },
  })

  const tagCount: Record<string, number> = {}
  for (const e of entries) {
    for (const tag of parseTags(e.tags)) {
      tagCount[tag] = (tagCount[tag] ?? 0) + 1
    }
  }

  const sorted = Object.entries(tagCount).sort((a, b) => b[1] - a[1])

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="page-header" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="px-5 pt-3 pb-2.5">
          <h1 className="text-[34px] font-bold tracking-tight text-stone-900">Tags</h1>
        </div>
      </div>

      <div className="px-4 py-4">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-card flex items-center justify-center mb-4">
              <span className="text-3xl">🏷️</span>
            </div>
            <p className="text-stone-500 font-medium">No tags yet</p>
            <p className="text-stone-400 text-sm mt-1">Add tags when writing entries</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {sorted.map(([tag, count]) => (
              <Link
                key={tag}
                href={`/search?tag=${encodeURIComponent(tag)}`}
                className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2.5
                           active:scale-95 transition-transform shadow-card"
              >
                <span className="text-amber-700 font-bold text-[14px]">#{tag}</span>
                <span className="text-[11px] bg-amber-50 text-amber-600 font-bold
                                 px-2 py-0.5 rounded-full border border-amber-100">
                  {count}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
