import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { validateEmail } from '@/lib/email-validator'
import { verifyCaptchaToken } from '@/lib/captcha'
import { checkRateLimit, incrementRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // 1. Check authentication
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
          requiresAuth: true
        },
        { status: 401 }
      )
    }

    // 2. Parse request body
    const body = await request.json()
    const { recipientName, senderEmail, senderName, captchaToken } = body

    // 3. Validate required fields
    if (!recipientName || !senderEmail || !captchaToken) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 4. Validate email format
    const emailValidation = validateEmail(senderEmail)
    if (!emailValidation.valid) {
      return NextResponse.json(
        { success: false, error: emailValidation.error },
        { status: 400 }
      )
    }

    // 5. Verify CAPTCHA
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip')

    const captchaValid = await verifyCaptchaToken(captchaToken, ip || undefined)
    if (!captchaValid) {
      return NextResponse.json(
        { success: false, error: 'CAPTCHA verification failed. Please try again.' },
        { status: 400 }
      )
    }

    // 6. Check rate limit
    const rateLimitCheck = await checkRateLimit(session.user.email!)
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Rate limit exceeded. You can create ${MAX_MESSAGES_PER_DAY} messages per day. Resets at ${rateLimitCheck.resetAt.toLocaleString()}`,
          rateLimitExceeded: true,
          resetAt: rateLimitCheck.resetAt.toISOString(),
        },
        { status: 429 }
      )
    }

    // 7. Get user ID from database
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

    // 8. Insert message into database
    const { data, error } = await supabaseAdmin
      .from('messages')
      .insert([
        {
          recipient_name: recipientName,
          sender_email: senderEmail,
          sender_name: senderName || null,
          user_id: userData.id,
          ip_address: ip || null,
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

    // 9. Increment rate limit counter
    await incrementRateLimit(session.user.email!)

    // 10. Return success with remaining quota
    return NextResponse.json({
      success: true,
      messageId: data.id,
      remaining: rateLimitCheck.remaining - 1,
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Add constant for rate limit
const MAX_MESSAGES_PER_DAY = parseInt(
  process.env.RATE_LIMIT_MAX_MESSAGES_PER_DAY || '5',
  10
)
