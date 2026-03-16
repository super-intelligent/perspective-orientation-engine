import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  console.log('[/api/orient stub] Received brain dump:', body.brainDump?.slice(0, 100))
  return NextResponse.json({
    status: 'stub',
    message: 'Orientation pipeline not yet connected.',
    received: true
  })
}
