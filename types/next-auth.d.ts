import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      userId: string
      isActive: boolean
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
  }
}
