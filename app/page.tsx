'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import SignInButton from '@/components/SignInButton'
import TurnstileWidget from '@/components/TurnstileWidget'

export default function Home() {
  const { data: session, status } = useSession()
  const [recipientName, setRecipientName] = useState('')
  const [senderEmail, setSenderEmail] = useState('')
  const [senderName, setSenderName] = useState('')
  const [generatedLink, setGeneratedLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; left: number; delay: number }[]>([])
  const [captchaToken, setCaptchaToken] = useState('')
  const [rateLimitRemaining, setRateLimitRemaining] = useState<number | null>(null)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)

  useEffect(() => {
    // Generate floating hearts
    const hearts = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
    }))
    setFloatingHearts(hearts)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check if user is authenticated
    if (!session) {
      setShowAuthPrompt(true)
      return
    }

    // Check CAPTCHA
    if (!captchaToken) {
      alert('Please complete the CAPTCHA verification')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientName,
          senderEmail,
          senderName: senderName || null,
          captchaToken,
        }),
      })

      const data = await response.json()

      if (data.success) {
        const baseUrl = window.location.origin
        const link = `${baseUrl}/valentine?id=${data.messageId}`
        setGeneratedLink(link)
        setRateLimitRemaining(data.remaining)
        // Reset CAPTCHA
        setCaptchaToken('')
      } else if (data.requiresAuth) {
        setShowAuthPrompt(true)
      } else if (data.rateLimitExceeded) {
        alert(`Rate limit exceeded! ${data.error}`)
      } else {
        alert(data.error || 'Failed to generate link. Please try again.')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-5">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-red-400 to-purple-500 animate-gradient"></div>

      {/* Floating Hearts Background */}
      {floatingHearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute text-4xl opacity-20 animate-float-up pointer-events-none"
          style={{
            left: `${heart.left}%`,
            animationDelay: `${heart.delay}s`,
            bottom: '-100px',
          }}
        >
          ❤️
        </div>
      ))}

      {/* Main Content Card */}
      <div className="relative z-10 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 md:p-12 max-w-4xl w-full border border-white/20 animate-slide-up">
        {/* Header */}
        <div className="mb-6">
          {/* Animated Mail Icon */}
          <div className="text-center mb-6">
            <div className="inline-block relative">
              <div className="text-7xl md:text-8xl mb-2 animate-bounce-slow cursor-pointer hover:scale-110 transition-transform">
                💌
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full animate-ping"></div>
            </div>
          </div>

          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-5xl font-black mb-2 bg-gradient-to-r from-pink-600 via-red-500 to-purple-600 bg-clip-text text-transparent">
                Valentine Generator
              </h1>
              <p className="text-gray-600 text-sm md:text-base">
                Create a playful Valentine message that will{' '}
                <span className="font-semibold text-pink-600">make their heart skip a beat!</span> 💕
              </p>
            </div>

            {/* Auth Actions - Desktop */}
            {status === 'authenticated' ? (
              <div className="hidden md:flex gap-2 flex-shrink-0">
                <a
                  href="/dashboard"
                  className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-all font-semibold text-sm"
                >
                  My Links
                </a>
                <SignInButton />
              </div>
            ) : (
              <div className="hidden md:block">
                <SignInButton />
              </div>
            )}
          </div>

          {/* User Info & Actions - Mobile Friendly */}
          {status === 'authenticated' ? (
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {session.user.image && (
                    <img
                      src={session.user.image}
                      alt=""
                      className="w-8 h-8 rounded-full flex-shrink-0"
                    />
                  )}
                  <p className="text-xs md:text-sm text-green-700 truncate">
                    <span className="font-semibold">{session.user.name || session.user.email}</span>
                    {rateLimitRemaining !== null && (
                      <span className="text-green-600"> • {rateLimitRemaining} left</span>
                    )}
                  </p>
                </div>
                {/* Mobile Actions */}
                <div className="flex md:hidden gap-2 flex-shrink-0">
                  <a
                    href="/dashboard"
                    className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-all font-semibold text-xs"
                  >
                    Links
                  </a>
                  <SignInButton />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-pink-50 border border-pink-200 rounded-xl flex items-center justify-between">
              <p className="text-sm text-pink-700 font-semibold">Sign in to create messages</p>
              <div className="md:hidden">
                <SignInButton />
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Recipient Name Input */}
          <div>
            <label className="block text-left mb-2 text-gray-700 font-semibold text-sm">
              Their Name
            </label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="e.g., Sarah"
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all"
            />
          </div>

          {/* Sender Email Input */}
          <div>
            <label className="block text-left mb-2 text-gray-700 font-semibold text-sm">
              Your Email
            </label>
            <input
              type="email"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all"
            />
            <p className="text-xs text-gray-500 mt-1.5">
              We'll notify you when they say YES!
            </p>
          </div>

          {/* Sender Name Input (Optional) */}
          <div>
            <label className="block text-left mb-2 text-gray-700 font-semibold text-sm">
              Your Name <span className="text-gray-400 text-xs font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="e.g., John"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all"
            />
          </div>

          {/* CAPTCHA */}
          {session && (
            <TurnstileWidget
              onSuccess={(token) => setCaptchaToken(token)}
              onError={() => {
                setCaptchaToken('')
                alert('CAPTCHA verification failed. Please try again.')
              }}
            />
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 text-white font-bold text-lg rounded-xl transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #ec4899 0%, #ef4444 50%, #8b5cf6 100%)',
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Generating...
              </span>
            ) : (
              'Generate Magic Link ✨'
            )}
          </button>
        </form>

        {/* Generated Link Result */}
        {generatedLink && (
          <div className="mt-8 p-6 rounded-2xl animate-scale-in bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-200 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <div className="text-3xl animate-bounce">🎊</div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Your Magic Link is Ready!
              </h3>
            </div>

            <p className="text-gray-600 mb-4 leading-relaxed">
              Share this link and watch the magic happen! The "No" button will playfully run away 😈
            </p>

            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={generatedLink}
                readOnly
                className="flex-1 px-4 py-3 bg-white border-2 border-pink-300 rounded-xl text-sm font-mono text-gray-700 cursor-pointer"
                onClick={(e) => e.currentTarget.select()}
              />
              <button
                onClick={copyToClipboard}
                className="px-6 py-3 font-bold rounded-xl transition-all hover:scale-105 shadow-md"
                style={{
                  background: copied ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                  color: 'white',
                }}
              >
                {copied ? (
                  <span className="flex items-center gap-2">
                    ✓ Copied!
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    📋 Copy
                  </span>
                )}
              </button>
            </div>

            <div className="p-4 bg-white rounded-xl border-l-4 border-pink-500 shadow-sm">
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong className="text-pink-600">💡 What's next?</strong><br />
                When they click "YES", you'll receive an instant email notification!
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs md:text-sm text-gray-500">
            Made with ❤️ for spreading love •{' '}
            <a
              href="/donate"
              className="text-pink-600 hover:text-pink-700 hover:underline font-semibold"
            >
              Support
            </a>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float-up {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.2;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 15s ease infinite;
        }
        .animate-float-up {
          animation: float-up 15s linear infinite;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}
