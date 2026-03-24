import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    return NextResponse.json(
      { error: 'Orientation not found.' },
      { status: 404 }
    )
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .rpc('get_orientation', { p_id: id })

  if (error || !data) {
    return NextResponse.json(
      { error: 'Orientation not found.' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    brain_dump: data.brain_dump,
    ...data.result_json,
    orientation_id: data.id,
    created_at: data.created_at,
  })
}
