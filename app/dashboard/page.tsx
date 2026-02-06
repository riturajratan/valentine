'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'

interface UserMessage {
  id: string
  recipient_name: string
  sender_email: string
  sender_name: string | null
  created_at: string
  clicked: boolean
  clicked_at: string | null
  shareableLink: string
  status: 'clicked' | 'waiting'
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [messages, setMessages] = useState<UserMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/dashboard')
      return
    }

    if (status === 'authenticated') {
      fetchMessages()
    }
  }, [status, router])

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/user/messages')
      const data = await response.json()

      if (data.success) {
        setMessages(data.messages)
      } else {
        console.error('Failed to fetch messages:', data.error)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (link: string, id: string) => {
    try {
      await navigator.clipboard.writeText(link)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 3000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Calculate stats
  const stats = {
    total: messages.length,
    clicked: messages.filter(m => m.clicked).length,
    waiting: messages.filter(m => !m.clicked).length,
    conversionRate: messages.length > 0
      ? ((messages.filter(m => m.clicked).length / messages.length) * 100).toFixed(1)
      : '0'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-red-50">
        <div className="text-2xl font-bold text-purple-600 animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-red-50 p-5">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-red-600 bg-clip-text text-transparent mb-2">
              My Valentine Links 💕
            </h1>
            <p className="text-gray-600">View all your sent Valentine messages</p>
          </div>
          <div className="flex gap-3">
            <a
              href="/"
              className="px-4 py-2 bg-white text-purple-600 rounded-xl hover:bg-purple-50 transition-all font-semibold shadow-md"
            >
              🏠 Home
            </a>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-all font-semibold"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="text-5xl font-bold mb-2">{stats.total}</div>
            <div className="text-blue-100 text-lg">Messages Sent</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="text-5xl font-bold mb-2">{stats.clicked}</div>
            <div className="text-green-100 text-lg">Clicked YES! 💚</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="text-5xl font-bold mb-2">{stats.waiting}</div>
            <div className="text-orange-100 text-lg">Waiting... ⏳</div>
          </div>
        </div>

        {/* Messages Table */}
        {messages.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-pink-100 to-purple-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">💝 Recipient</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">📅 Created</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">✨ Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">🔗 Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {messages.map((message) => (
                    <tr key={message.id} className="hover:bg-pink-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{message.recipient_name}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {formatDate(message.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        {message.clicked ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                            ✓ Clicked YES!
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                            ⏳ Waiting...
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => copyToClipboard(message.shareableLink, message.id)}
                          className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                            copiedId === message.id
                              ? 'bg-green-500 text-white'
                              : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                          }`}
                        >
                          {copiedId === message.id ? '✓ Copied!' : '📋 Copy Link'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
            <div className="text-6xl mb-4">💌</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No messages yet!</h2>
            <p className="text-gray-500 mb-6">Create your first Valentine message to get started.</p>
            <a
              href="/"
              className="inline-block px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold hover:scale-105 transition-transform"
            >
              Create Message
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
