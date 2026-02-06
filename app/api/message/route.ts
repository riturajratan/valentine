import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing message ID' },
        { status: 400 }
      )
    }

    // Fetch message from Supabase
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: 'Message not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: data,
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
