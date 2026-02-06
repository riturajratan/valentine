'use client'

import { useState } from 'react'

export default function Home() {
  const [recipientName, setRecipientName] = useState('')
  const [senderEmail, setSenderEmail] = useState('')
  const [senderName, setSenderName] = useState('')
  const [generatedLink, setGeneratedLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
        }),
      })

      const data = await response.json()

      if (data.success) {
        const baseUrl = window.location.origin
        const link = `${baseUrl}/valentine?id=${data.messageId}`
        setGeneratedLink(link)
      } else {
        alert('Failed to generate link. Please try again.')
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
    <div className="min-h-screen flex items-center justify-center p-5" style={{
      background: 'linear-gradient(135deg, #ff6b9d 0%, #c06c84 50%, #ffa8c5 100%)'
    }}>
      <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-10 max-w-md w-full animate-slideIn">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-heartbeat">💌</div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#c06c84' }}>
            Valentine Message Generator
          </h1>
          <p className="text-gray-600">
            Create a romantic and playful Valentine message that will make them smile!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-left mb-2 text-gray-700 font-semibold text-sm">
              Their Name *
            </label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="e.g., Sarah"
              required
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all"
              style={{ borderColor: '#ffa8c5' }}
            />
          </div>

          <div>
            <label className="block text-left mb-2 text-gray-700 font-semibold text-sm">
              Your Email * (for notification)
            </label>
            <input
              type="email"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all"
              style={{ borderColor: '#ffa8c5' }}
            />
          </div>

          <div>
            <label className="block text-left mb-2 text-gray-700 font-semibold text-sm">
              Your Name (optional)
            </label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="e.g., John"
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all"
              style={{ borderColor: '#ffa8c5' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 text-white font-bold text-lg rounded-xl transition-all hover:shadow-lg disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #ff6b9d 0%, #c06c84 100%)'
            }}
          >
            {loading ? 'Generating...' : 'Generate Link 💖'}
          </button>
        </form>

        {generatedLink && (
          <div className="mt-8 p-6 rounded-2xl animate-fadeIn" style={{
            background: 'linear-gradient(135deg, #fff0f5 0%, #ffe6f0 100%)',
            border: '2px solid #ffa8c5'
          }}>
            <h3 className="text-xl font-bold mb-3" style={{ color: '#c06c84' }}>
              Your link is ready! 🎊
            </h3>
            <p className="text-gray-600 mb-4">
              Share this link via WhatsApp, text, or any messaging app:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={generatedLink}
                readOnly
                className="flex-1 px-3 py-2 border-2 rounded-lg text-sm"
                style={{ borderColor: '#ffa8c5' }}
              />
              <button
                onClick={copyToClipboard}
                className="px-6 py-2 text-white font-bold rounded-lg transition-all hover:scale-105"
                style={{
                  background: copied ? '#4caf50' : '#ff6b9d'
                }}
              >
                {copied ? 'Copied! ✓' : 'Copy'}
              </button>
            </div>
            <div className="mt-4 p-4 bg-white rounded-lg border-l-4" style={{ borderColor: '#ff6b9d' }}>
              <p className="text-sm text-gray-600">
                <strong style={{ color: '#c06c84' }}>What happens next?</strong><br />
                When they click "Yes", you'll receive an email notification! The "No" button will playfully dodge their cursor.
              </p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slideIn {
          animation: slideIn 0.5s ease-out;
        }
        .animate-heartbeat {
          animation: heartbeat 1.5s ease-in-out infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}
