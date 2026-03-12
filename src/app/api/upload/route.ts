/**
 * POST /api/upload - Upload a file; returns public URL.
 * Saves to public/uploads/ so the file is served at /uploads/filename
 */
import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file || !file.size) {
      return NextResponse.json({ error: 'No file' }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
    }
    const ext = path.extname(file.name) || '.bin'
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`
    await mkdir(UPLOAD_DIR, { recursive: true })
    const bytes = await file.arrayBuffer()
    const outPath = path.join(UPLOAD_DIR, name)
    await writeFile(outPath, Buffer.from(bytes))
    const url = `/uploads/${name}`
    return NextResponse.json({ url })
  } catch (e) {
    console.error('Upload error:', e)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
