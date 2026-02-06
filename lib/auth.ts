import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { supabaseAdmin } from './supabase-admin'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Upsert user in our database
        const { data: existingUser, error: fetchError } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('email', user.email!)
          .single()

        if (fetchError && fetchError.code !== 'PGRST116') {
          // PGRST116 = no rows returned, which is fine for new users
          console.error('Error fetching user:', fetchError)
          return false
        }

        if (!existingUser) {
          // Create new user
          const { error: insertError } = await supabaseAdmin
            .from('users')
            .insert({
              email: user.email!,
              name: user.name,
              google_id: account?.providerAccountId,
              avatar_url: user.image,
              last_login: new Date().toISOString(),
            })

          if (insertError) {
            console.error('Error creating user:', insertError)
            return false
          }
        } else {
          // Update last login
          await supabaseAdmin
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', existingUser.id)
        }

        return true
      } catch (error) {
        console.error('Sign in error:', error)
        return false
      }
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!

        // Fetch user from our database to get UUID and active status
        const { data: user } = await supabaseAdmin
          .from('users')
          .select('id, is_active')
          .eq('email', session.user.email!)
          .single()

        if (user) {
          session.user.userId = user.id
          session.user.isActive = user.is_active
        }
      }
      return session
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// Export auth for middleware usage in NextAuth v5
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)
