import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface Message {
  id: string
  recipient_name: string
  sender_email: string
  sender_name: string | null
  created_at: string
  clicked: boolean
  clicked_at: string | null
}

export interface Click {
  id: string
  message_id: string
  clicked_at: string
  recipient_name: string
  sender_email: string
}
