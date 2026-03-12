/**
 * POST /api/comments - Add a comment on a page (SpaceHey-style)
 * GET /api/comments?pageId=... - List comments for a page
 */
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { pageId: string; content: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body?.pageId || !body?.content?.trim()) {
    return NextResponse.json(
      { error: 'pageId and content required' },
      { status: 400 }
    )
  }

  // TODO: Insert into Supabase comments table
  return NextResponse.json({
    ok: true,
    comment: {
      id: 'placeholder',
      content: body.content,
      profile_id: userId,
      page_id: body.pageId,
    },
    message: 'Connect Supabase for persistence',
  })
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const pageId = searchParams.get('pageId')
  if (!pageId) {
    return NextResponse.json({ error: 'pageId required' }, { status: 400 })
  }

  // TODO: Fetch from Supabase by page_id
  return NextResponse.json({
    comments: [],
    message: 'Connect Supabase for persistence',
  })
}
