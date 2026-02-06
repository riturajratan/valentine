import { supabaseAdmin } from './supabase-admin'

const MAX_MESSAGES_PER_DAY = parseInt(
  process.env.RATE_LIMIT_MAX_MESSAGES_PER_DAY || '5',
  10
)
const WINDOW_HOURS = parseInt(
  process.env.RATE_LIMIT_WINDOW_HOURS || '24',
  10
)

interface RateLimitCheck {
  allowed: boolean
  remaining: number
  resetAt: Date
}

export async function checkRateLimit(userEmail: string): Promise<RateLimitCheck> {
  try {
    const windowStart = new Date()
    windowStart.setHours(windowStart.getHours() - WINDOW_HOURS)

    // Get current count for this user in the time window
    const { data: rateLimits, error } = await supabaseAdmin
      .from('rate_limits')
      .select('count, window_start')
      .eq('user_email', userEmail)
      .eq('action', 'message_create')
      .gte('window_start', windowStart.toISOString())
      .order('window_start', { ascending: false })
      .limit(1)

    if (error) {
      console.error('Rate limit check error:', error)
      // Fail open: allow the request but log the error
      return {
        allowed: true,
        remaining: MAX_MESSAGES_PER_DAY,
        resetAt: new Date(Date.now() + WINDOW_HOURS * 60 * 60 * 1000),
      }
    }

    // Calculate total messages in the window
    const totalMessages = rateLimits && rateLimits.length > 0
      ? rateLimits[0].count
      : 0

    const allowed = totalMessages < MAX_MESSAGES_PER_DAY
    const remaining = Math.max(0, MAX_MESSAGES_PER_DAY - totalMessages)

    // Calculate reset time (24 hours from the first message in window)
    let resetAt = new Date(Date.now() + WINDOW_HOURS * 60 * 60 * 1000)
    if (rateLimits && rateLimits.length > 0) {
      const firstMessageTime = new Date(rateLimits[0].window_start)
      resetAt = new Date(firstMessageTime.getTime() + WINDOW_HOURS * 60 * 60 * 1000)
    }

    return { allowed, remaining, resetAt }
  } catch (error) {
    console.error('Rate limit error:', error)
    // Fail open
    return {
      allowed: true,
      remaining: MAX_MESSAGES_PER_DAY,
      resetAt: new Date(Date.now() + WINDOW_HOURS * 60 * 60 * 1000),
    }
  }
}

export async function incrementRateLimit(userEmail: string): Promise<void> {
  try {
    const now = new Date()
    const windowStart = new Date()
    windowStart.setHours(0, 0, 0, 0) // Start of current day

    // Try to find existing record for today
    const { data: existing } = await supabaseAdmin
      .from('rate_limits')
      .select('*')
      .eq('user_email', userEmail)
      .eq('action', 'message_create')
      .eq('window_start', windowStart.toISOString())
      .single()

    if (existing) {
      // Update existing record
      await supabaseAdmin
        .from('rate_limits')
        .update({ count: existing.count + 1 })
        .eq('id', existing.id)
    } else {
      // Insert new record
      await supabaseAdmin
        .from('rate_limits')
        .insert({
          user_email: userEmail,
          action: 'message_create',
          count: 1,
          window_start: windowStart.toISOString(),
        })
    }

    // Clean up old rate limit records (older than 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    await supabaseAdmin
      .from('rate_limits')
      .delete()
      .lt('window_start', sevenDaysAgo.toISOString())
  } catch (error) {
    console.error('Error incrementing rate limit:', error)
    // Don't throw - we don't want to block the request if rate limit logging fails
  }
}
