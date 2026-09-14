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

  const [entryCount, mediaCount] = await Promise.all([
    prisma.entry.count({ where: { userId: auth.userId } }),
    prisma.media.count({ where: { entry: { userId: auth.userId } } }),
  ])

  const photos = await prisma.media.count({ where: { entry: { userId: auth.userId }, type: 'image' } })
  const videos = await prisma.media.count({ where: { entry: { userId: auth.userId }, type: 'video' } })

  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="bg-[#f2f2f7] min-h-screen">
      <div className="sticky top-0 z-10 bg-[#f2f2f7]/90 backdrop-blur-xl"
           style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center justify-between px-5 pt-3 pb-2">
          <h1 className="text-[34px] font-bold tracking-tight text-gray-900">Profile</h1>
        </div>
      </div>

      <div className="px-4 pb-8 space-y-4">
        {/* Avatar & name */}
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-bold text-white">{initials}</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{user.name}</h2>
            <p className="text-gray-500 text-sm">{user.email}</p>
            <p className="text-gray-400 text-xs mt-1">Journaling since {formatDate(user.createdAt)}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Entries', value: entryCount, emoji: '📝' },
            { label: 'Photos', value: photos, emoji: '📷' },
            { label: 'Videos', value: videos, emoji: '🎬' },
          ].map(stat => (
            <div key={stat.label} className="card p-3 text-center">
              <span className="text-lg">{stat.emoji}</span>
              <p className="text-xl font-bold text-gray-900 mt-0.5">{stat.value}</p>
              <p className="text-[10px] text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Account section */}
        <div className="card divide-y divide-gray-100">
          <div className="px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-gray-700 font-medium">Name</span>
            <span className="text-sm text-gray-500">{user.name}</span>
          </div>
          <div className="px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-gray-700 font-medium">Email</span>
            <span className="text-sm text-gray-500">{user.email}</span>
          </div>
          <div className="px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-gray-700 font-medium">Member since</span>
            <span className="text-sm text-gray-500">{formatDate(user.createdAt)}</span>
          </div>
        </div>

        {/* Logout */}
        <LogoutButton />
      </div>
    </div>
  )
}
