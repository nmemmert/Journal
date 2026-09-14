import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { unlink } from 'fs/promises'
import path from 'path'

async function getEntry(id: string, userId: string) {
  return prisma.entry.findFirst({
    where: { id, userId },
    include: { media: { orderBy: { createdAt: 'asc' } } },
  })
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const entry = await getEntry(id, auth.userId)
  if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ entry })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const existing = await getEntry(id, auth.userId)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const { title, content, mood, tags, location, weather, mediaIds } = body

  const entry = await prisma.entry.update({
    where: { id },
    data: {
      title: title ?? existing.title,
      content: content ?? existing.content,
      mood: mood !== undefined ? mood : existing.mood,
      tags: tags !== undefined ? (tags ? JSON.stringify(tags) : null) : existing.tags,
      location: location !== undefined ? location : existing.location,
      weather: weather !== undefined ? weather : existing.weather,
      ...(mediaIds !== undefined
        ? { media: { set: mediaIds.map((mid: string) => ({ id: mid })) } }
        : {}),
    },
    include: { media: true },
  })

  return NextResponse.json({ entry })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const entry = await getEntry(id, auth.userId)
  if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Delete media files from disk
  for (const m of entry.media) {
    try {
      const filePath = path.join(process.cwd(), 'public', m.url)
      await unlink(filePath)
    } catch {
      // File may already be deleted
    }
  }

  await prisma.entry.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
