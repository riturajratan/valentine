import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { recipientName, senderEmail, senderName } = body

    if (!recipientName || !senderEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          recipient_name: recipientName,
          sender_email: senderEmail,
          sender_name: senderName || null,
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      messageId: data.id,
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
