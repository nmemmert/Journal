import { notFound, redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import EntryEditor from '@/components/EntryEditor'
import { parseTags } from '@/lib/utils'

export default async function EditEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser()
  if (!auth) redirect('/login')

  const { id } = await params
  const entry = await prisma.entry.findFirst({
    where: { id, userId: auth.userId },
    include: { media: { orderBy: { createdAt: 'asc' } } },
  })
  if (!entry) notFound()

  return (
    <EntryEditor
      initial={{
        id: entry.id,
        title: entry.title,
        content: entry.content,
        mood: entry.mood,
        tags: parseTags(entry.tags),
        location: entry.location,
        media: entry.media.map(m => ({
          id: m.id,
          type: m.type as 'image' | 'video',
          url: m.url,
          filename: m.filename,
          size: m.size,
        })),
      }}
    />
  )
}
