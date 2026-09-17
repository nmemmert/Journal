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
    <div className="min-h-screen">
      <div className="page-header" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="px-5 pt-4 pb-3">
          <h1 className="text-[34px] font-black tracking-tight" style={{ color: 'var(--text)' }}>Tags</h1>
        </div>
      </div>

      <div className="px-4 py-4">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-center">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4"
                 style={{ background: 'var(--card)', boxShadow: 'var(--card-shadow)' }}>
              <span className="text-4xl">🏷️</span>
            </div>
            <p className="text-[16px] font-semibold" style={{ color: 'var(--text)' }}>No tags yet</p>
            <p className="text-[14px] mt-1" style={{ color: 'var(--text-3)' }}>Add tags when writing entries</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {sorted.map(([tag, count]) => (
              <Link key={tag} href={`/search?tag=${encodeURIComponent(tag)}`}
                className="flex items-center gap-2 rounded-2xl px-4 py-3
                           active:scale-95 transition-transform"
                style={{ background: 'var(--card)', boxShadow: 'var(--card-shadow-sm)' }}>
                <span className="text-[15px] font-bold" style={{ color: 'var(--primary)' }}>
                  #{tag}
                </span>
                <span className="text-[11px] font-bold rounded-full px-2 py-0.5"
                      style={{ background: 'var(--primary-tint)', color: 'var(--primary)' }}>
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
