import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// Check if user is admin by email in database
async function isAdminEmail(email: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('admin_whitelist')
    .select('is_active')
    .eq('email', email)
    .eq('is_active', true)
    .single()

  return !!data
}

// Also check environment variable whitelist
function isInEnvWhitelist(email: string): boolean {
  const whitelist = process.env.ADMIN_EMAIL_WHITELIST || ''
  const emails = whitelist.split(',').map(e => e.trim().toLowerCase())
  return emails.includes(email.toLowerCase())
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Missing credentials' },
        { status: 400 }
      )
    }

    // Check password
    const validPassword = password === process.env.ADMIN_PASSWORD ||
                         password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD ||
                         password === 'Rajarani@945#' // Temporary backward compatibility

    if (!validPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      )
    }

    // Check if email is in whitelist
    const inDbWhitelist = await isAdminEmail(email)
    const inEnvWhitelist = isInEnvWhitelist(email)

    if (!inDbWhitelist && !inEnvWhitelist) {
      return NextResponse.json(
        { success: false, error: 'Email not authorized for admin access' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      email,
    })
  } catch (error) {
    console.error('Admin auth error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
