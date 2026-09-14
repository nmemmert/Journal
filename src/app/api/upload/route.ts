import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export const maxDuration = 60

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/mov', 'video/avi']
const MAX_IMAGE_SIZE = 20 * 1024 * 1024  // 20 MB
const MAX_VIDEO_SIZE = 200 * 1024 * 1024 // 200 MB

export async function POST(req: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const mimeType = file.type
  const isImage = ALLOWED_IMAGE_TYPES.includes(mimeType)
  const isVideo = ALLOWED_VIDEO_TYPES.includes(mimeType)

  if (!isImage && !isVideo) {
    return NextResponse.json({ error: 'File type not supported' }, { status: 400 })
  }

  const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE
  if (file.size > maxSize) {
    return NextResponse.json({
      error: `File too large (max ${isImage ? '20' : '200'} MB)`,
    }, { status: 400 })
  }

  const ext = file.name.split('.').pop() ?? (isImage ? 'jpg' : 'mp4')
  const filename = `${uuidv4()}.${ext}`
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')

  await mkdir(uploadDir, { recursive: true })

  const bytes = await file.arrayBuffer()
  await writeFile(path.join(uploadDir, filename), Buffer.from(bytes))

  const media = await prisma.media.create({
    data: {
      type: isImage ? 'image' : 'video',
      url: `/uploads/${filename}`,
      filename: file.name,
      mimeType,
      size: file.size,
      entryId: 'pending', // Linked to entry on save
    },
  })

  return NextResponse.json({ media }, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { mediaId } = await req.json()
  if (!mediaId) return NextResponse.json({ error: 'mediaId required' }, { status: 400 })

  const media = await prisma.media.findUnique({ where: { id: mediaId } })
  if (!media) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Only allow deletion of pending (not linked to entry) or entry belonging to user
  if (media.entryId !== 'pending') {
    const entry = await prisma.entry.findFirst({
      where: { id: media.entryId, userId: auth.userId },
    })
    if (!entry) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { unlink } = await import('fs/promises')
    await unlink(path.join(process.cwd(), 'public', media.url))
  } catch {
    // ignore
  }

  await prisma.media.delete({ where: { id: mediaId } })

  return NextResponse.json({ ok: true })
}
