'use client'

import { signIn, signOut, useSession } from 'next-auth/react'

export default function SignInButton() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="px-4 py-2 bg-gray-200 rounded-xl animate-pulse">
        Loading...
      </div>
    )
  }

  if (session) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-pink-100 rounded-xl">
          {session.user.image && (
            <img
              src={session.user.image}
              alt={session.user.name || ''}
              className="w-6 h-6 rounded-full"
            />
          )}
          <span className="text-sm font-semibold text-pink-700">
            {session.user.name || session.user.email}
          </span>
        </div>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-red-600 transition-colors"
        >
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => signIn('google')}
      className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
    >
      Sign In to Create
    </button>
  )
}
