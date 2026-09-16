import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import LogoutButton from '@/components/LogoutButton'

export default async function ProfilePage() {
  const auth = await getAuthUser()
  if (!auth) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { id: true, name: true, email: true, createdAt: true },
  })
  if (!user) redirect('/login')

  const [entryCount] = await Promise.all([
    prisma.entry.count({ where: { userId: auth.userId } }),
  ])
  const photos = await prisma.media.count({ where: { entry: { userId: auth.userId }, type: 'image' } })
  const videos = await prisma.media.count({ where: { entry: { userId: auth.userId }, type: 'video' } })

  const initials = user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  const stats = [
    { label: 'Entries', value: entryCount, icon: '📝' },
    { label: 'Photos', value: photos, icon: '📷' },
    { label: 'Videos', value: videos, icon: '🎬' },
  ]

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="page-header" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="px-5 pt-3 pb-2.5">
          <h1 className="text-[34px] font-bold tracking-tight text-stone-900">Profile</h1>
        </div>
      </div>

      <div className="px-4 pb-8 space-y-4">
        {/* Avatar hero */}
        <div className="card px-5 py-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0
                          bg-gradient-to-br from-amber-500 to-orange-600 shadow-md shadow-amber-200">
            <span className="text-xl font-bold text-white">{initials}</span>
          </div>
          <div className="min-w-0">
            <h2 className="text-[17px] font-bold text-stone-900 truncate">{user.name}</h2>
            <p className="text-stone-500 text-[13px] truncate">{user.email}</p>
            <p className="text-stone-400 text-[12px] mt-0.5">
              Journaling since {formatDate(user.createdAt).split(',')[0]}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map(stat => (
            <div key={stat.label} className="card p-4 text-center">
              <span className="text-[22px]">{stat.icon}</span>
              <p className="text-[24px] font-bold text-stone-900 mt-1 leading-none">{stat.value}</p>
              <p className="text-[11px] font-semibold text-stone-400 mt-1 uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Account info */}
        <div className="card overflow-hidden divide-y divide-stone-100">
          {[
            { label: 'Name', value: user.name },
            { label: 'Email', value: user.email },
            { label: 'Member since', value: formatDate(user.createdAt) },
          ].map(row => (
            <div key={row.label} className="px-4 py-3.5 flex items-center justify-between gap-3">
              <span className="text-[14px] font-semibold text-stone-700 flex-shrink-0">{row.label}</span>
              <span className="text-[13px] text-stone-500 truncate text-right">{row.value}</span>
            </div>
          ))}
        </div>

        <LogoutButton />
      </div>
    </div>
  )
}
