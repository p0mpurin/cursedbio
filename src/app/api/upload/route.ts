/**
 * POST /api/upload - Upload a file; returns public URL.
 * Saves to Supabase Storage (uploads bucket) and returns the public URL.
 */
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db'
import path from 'path'

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
    
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase storage is not configured' }, { status: 500 })
    }

    const ext = path.extname(file.name) || '.bin'
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`
    
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const { error: uploadError } = await supabaseAdmin
      .storage
      .from('uploads')
      .upload(name, buffer, {
        contentType: file.type || 'application/octet-stream',
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload to storage' }, { status: 500 })
    }

    const { data: { publicUrl } } = supabaseAdmin
      .storage
      .from('uploads')
      .getPublicUrl(name)

    return NextResponse.json({ url: publicUrl })
  } catch (e) {
    console.error('Upload error:', e)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
