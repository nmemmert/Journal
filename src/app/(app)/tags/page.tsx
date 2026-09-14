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
    <div>
      <div className="sticky top-0 z-10 bg-[#faf9f7]/90 backdrop-blur-lg border-b border-gray-100 px-4"
           style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center h-14">
          <h1 className="text-xl font-bold text-gray-900">Tags</h1>
        </div>
      </div>

      <div className="px-4 py-4">
        {sorted.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-4xl">🏷️</span>
            <p className="text-gray-500 mt-4 text-sm">No tags yet. Add tags when writing entries.</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {sorted.map(([tag, count]) => (
              <Link
                key={tag}
                href={`/search?tag=${encodeURIComponent(tag)}`}
                className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-4 py-2.5 active:scale-95 transition-transform shadow-sm"
              >
                <span className="text-indigo-600 font-semibold">#{tag}</span>
                <span className="text-xs bg-indigo-50 text-indigo-400 px-2 py-0.5 rounded-full font-medium">{count}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
