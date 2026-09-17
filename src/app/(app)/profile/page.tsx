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

  const entryCount = await prisma.entry.count({ where: { userId: auth.userId } })
  const photos = await prisma.media.count({ where: { entry: { userId: auth.userId }, type: 'image' } })
  const videos = await prisma.media.count({ where: { entry: { userId: auth.userId }, type: 'video' } })

  const initials = user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen">
      <div className="page-header" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="px-5 pt-4 pb-3">
          <h1 className="text-[34px] font-black tracking-tight" style={{ color: 'var(--text)' }}>Profile</h1>
        </div>
      </div>

      <div className="px-4 pb-8 space-y-4">
        {/* Identity card */}
        <div className="rounded-3xl p-5 flex items-center gap-4"
             style={{ background: 'var(--card)', boxShadow: 'var(--card-shadow)' }}>
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
               style={{
                 background: 'linear-gradient(145deg, #D4681E, #963B08)',
                 boxShadow: '0 4px 16px rgba(196,89,26,0.4)',
               }}>
            <span className="text-2xl font-black text-white">{initials}</span>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-[18px] font-bold truncate" style={{ color: 'var(--text)' }}>
              {user.name}
            </h2>
            <p className="text-[13px] truncate mt-0.5" style={{ color: 'var(--text-2)' }}>
              {user.email}
            </p>
            <p className="text-[11px] font-semibold mt-1.5 uppercase tracking-wider"
               style={{ color: 'var(--text-3)' }}>
              Since {memberSince}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Entries', value: entryCount, emoji: '📝' },
            { label: 'Photos',  value: photos,     emoji: '📷' },
            { label: 'Videos',  value: videos,     emoji: '🎬' },
          ].map(stat => (
            <div key={stat.label} className="rounded-2xl p-4 text-center"
                 style={{ background: 'var(--card)', boxShadow: 'var(--card-shadow-sm)' }}>
              <span className="text-[24px]">{stat.emoji}</span>
              <p className="text-[28px] font-black leading-none mt-1.5"
                 style={{ color: 'var(--text)' }}>
                {stat.value}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-1"
                 style={{ color: 'var(--text-3)' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Info rows */}
        <div className="rounded-2xl overflow-hidden"
             style={{ background: 'var(--card)', boxShadow: 'var(--card-shadow-sm)' }}>
          {[
            { label: 'Name',         value: user.name },
            { label: 'Email',        value: user.email },
            { label: 'Member since', value: formatDate(user.createdAt) },
          ].map((row, i, arr) => (
            <div key={row.label}
                 className="px-4 py-3.5 flex items-center justify-between gap-3"
                 style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <span className="text-[14px] font-semibold flex-shrink-0" style={{ color: 'var(--text)' }}>
                {row.label}
              </span>
              <span className="text-[13px] truncate text-right" style={{ color: 'var(--text-2)' }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>

        <LogoutButton />
      </div>
    </div>
  )
}
