import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user ID from database
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', session.user.email!)
      .single()

    if (!userData) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Fetch user's messages
    const { data: messages, error } = await supabaseAdmin
      .from('messages')
      .select('id, recipient_name, created_at, clicked, clicked_at, sender_email, sender_name')
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching messages:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch messages' },
        { status: 500 }
      )
    }

    // Add shareable links
    const baseUrl = process.env.NEXTAUTH_URL || 'https://bemyvalentine.maddyzone.com'
    const messagesWithLinks = messages.map(msg => ({
      ...msg,
      shareableLink: `${baseUrl}/valentine?id=${msg.id}`,
      status: msg.clicked ? 'clicked' : 'waiting'
    }))

    return NextResponse.json({
      success: true,
      messages: messagesWithLinks
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
