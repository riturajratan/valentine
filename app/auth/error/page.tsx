'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const errorMessages: Record<string, string> = {
    Configuration: 'There is a problem with the server configuration.',
    AccessDenied: 'You do not have permission to sign in.',
    Verification: 'The verification token has expired or has already been used.',
    Default: 'An error occurred during authentication.',
  }

  const errorMessage = errorMessages[error || 'Default'] || errorMessages.Default

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-gradient-to-br from-pink-400 via-red-400 to-purple-500">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 max-w-md w-full border border-white/20">
        <div className="text-center mb-8">
          <div className="text-7xl mb-4">❌</div>
          <h1 className="text-4xl font-black mb-2 text-red-600">
            Authentication Error
          </h1>
          <p className="text-gray-700 text-lg">
            {errorMessage}
          </p>
        </div>

        <div className="space-y-4">
          <a
            href="/auth/signin"
            className="block w-full text-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
          >
            Try Again
          </a>

          <a
            href="/"
            className="block w-full text-center px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all"
          >
            Back to Home
          </a>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">
              <strong>Error code:</strong> {error}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-400 via-red-400 to-purple-500">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <div className="text-2xl text-white font-bold">Loading...</div>
        </div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
}
