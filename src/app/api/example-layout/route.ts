/**
 * GET /api/example-layout
 * Returns the example JSON layout for the editor. Used when no page exists yet.
 */
import { NextResponse } from 'next/server'
import exampleLayout from '@/lib/editor/example-layout.json'

export async function GET() {
  return NextResponse.json({ layout: exampleLayout })
}
