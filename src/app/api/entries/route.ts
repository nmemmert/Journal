import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const search = searchParams.get('search') ?? ''
  const tag = searchParams.get('tag') ?? ''
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const limit = 20

  const entries = await prisma.entry.findMany({
    where: {
      userId: auth.userId,
      ...(search
        ? {
            OR: [
              { title: { contains: search } },
              { content: { contains: search } },
              { tags: { contains: search } },
            ],
          }
        : {}),
      ...(tag ? { tags: { contains: tag } } : {}),
    },
    include: { media: { orderBy: { createdAt: 'asc' } } },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: (page - 1) * limit,
  })

  const total = await prisma.entry.count({ where: { userId: auth.userId } })

  return NextResponse.json({ entries, total, page, limit })
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title = '', content, mood, tags, location, weather, mediaIds } = body

  if (!content?.trim()) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 })
  }

  const entry = await prisma.entry.create({
    data: {
      title,
      content,
      mood: mood ?? null,
      tags: tags ? JSON.stringify(tags) : null,
      location: location ?? null,
      weather: weather ?? null,
      userId: auth.userId,
      ...(mediaIds?.length
        ? { media: { connect: mediaIds.map((id: string) => ({ id })) } }
        : {}),
    },
    include: { media: true },
  })

  return NextResponse.json({ entry }, { status: 201 })
}
