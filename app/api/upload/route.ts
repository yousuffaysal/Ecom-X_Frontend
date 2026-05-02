import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import cloudinary from '@/lib/cloudinary'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || !['admin', 'moderator'].includes(session.role as string)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())

  const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: 'redleaf', resource_type: 'image' }, (err, res) => {
        if (err || !res) return reject(err)
        resolve(res)
      })
      .end(buffer)
  })

  return NextResponse.json({ url: result.secure_url, public_id: result.public_id })
}
