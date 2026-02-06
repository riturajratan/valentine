'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, type Message } from '@/lib/supabase'

interface Stats {
  totalMessages: number
  totalClicks: number
  conversionRate: number
  uniqueSenders: number
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [stats, setStats] = useState<Stats>({
    totalMessages: 0,
    totalClicks: 0,
    conversionRate: 0,
    uniqueSenders: 0,
  })
  const router = useRouter()

  useEffect(() => {
    const auth = sessionStorage.getItem('adminAuth')
    if (auth !== 'true') {
      router.push('/admin/login')
      return
    }

    setIsAuthenticated(true)
    loadData()
  }, [router])

  const loadData = async () => {
    try {
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching messages:', error)
        setLoading(false)
        return
      }

      setMessages(messagesData || [])

      const totalMessages = messagesData?.length || 0
      const totalClicks = messagesData?.filter(m => m.clicked).length || 0
      const conversionRate = totalMessages > 0 ? (totalClicks / totalMessages) * 100 : 0
      const uniqueSenders = new Set(messagesData?.map(m => m.sender_email)).size

      setStats({
        totalMessages,
        totalClicks,
        conversionRate,
        uniqueSenders,
      })

      setLoading(false)
    } catch (error) {
      console.error('Error:', error)
      setLoading(false)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth')
    router.push('/admin/login')
  }

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-400 to-red-400">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">📊</div>
          <div className="text-2xl text-white font-bold">Loading dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-5">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-2xl shadow-2xl p-8 mb-8 text-white">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="text-5xl">📊</div>
                <h1 className="text-4xl font-black">Admin Dashboard</h1>
              </div>
              <p className="text-pink-100 text-lg font-medium">Valentine Message Analytics & Tracking</p>
            </div>
            <div className="flex gap-4">
              <a
                href="/"
                className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all font-semibold border border-white/30"
              >
                🏠 Home
              </a>
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-white text-red-600 rounded-xl hover:bg-red-50 transition-all font-bold shadow-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Messages */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="text-5xl">💌</div>
              <div className="px-3 py-1 bg-white/20 rounded-full text-sm font-bold backdrop-blur-sm">
                Total
              </div>
            </div>
            <p className="text-blue-100 text-sm font-semibold uppercase tracking-wide mb-2">
              Messages Generated
            </p>
            <p className="text-5xl font-black">{stats.totalMessages}</p>
          </div>

          {/* Total Clicks */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="text-5xl">💖</div>
              <div className="px-3 py-1 bg-white/20 rounded-full text-sm font-bold backdrop-blur-sm">
                Success
              </div>
            </div>
            <p className="text-green-100 text-sm font-semibold uppercase tracking-wide mb-2">
              Yes Clicks
            </p>
            <p className="text-5xl font-black">{stats.totalClicks}</p>
          </div>

          {/* Conversion Rate */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="text-5xl">📈</div>
              <div className="px-3 py-1 bg-white/20 rounded-full text-sm font-bold backdrop-blur-sm">
                Rate
              </div>
            </div>
            <p className="text-purple-100 text-sm font-semibold uppercase tracking-wide mb-2">
              Conversion Rate
            </p>
            <p className="text-5xl font-black">{stats.conversionRate.toFixed(1)}%</p>
          </div>

          {/* Unique Senders */}
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="text-5xl">👥</div>
              <div className="px-3 py-1 bg-white/20 rounded-full text-sm font-bold backdrop-blur-sm">
                Users
              </div>
            </div>
            <p className="text-pink-100 text-sm font-semibold uppercase tracking-wide mb-2">
              Unique Senders
            </p>
            <p className="text-5xl font-black">{stats.uniqueSenders}</p>
          </div>
        </div>

        {/* Messages Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
              <span className="text-3xl">📋</span>
              All Valentine Messages
            </h2>
            <p className="text-purple-100 mt-1">Track all generated links and their status</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">
                    💝 Recipient
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">
                    📧 Sender Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">
                    👤 Sender Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">
                    📅 Created
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">
                    ✨ Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">
                    ⏰ Clicked At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {messages.map((message, index) => (
                  <tr key={message.id} className="hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 transition-all">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">💕</span>
                        <div className="text-sm font-bold text-gray-900">{message.recipient_name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 font-medium">{message.sender_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 font-medium">{message.sender_name || '—'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {new Date(message.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {message.clicked ? (
                        <span className="px-4 py-2 inline-flex items-center gap-2 text-xs font-black rounded-full bg-gradient-to-r from-green-400 to-green-500 text-white shadow-md">
                          <span className="text-base">✓</span>
                          Clicked YES!
                        </span>
                      ) : (
                        <span className="px-4 py-2 inline-flex items-center gap-2 text-xs font-black rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-md">
                          <span className="text-base">⏳</span>
                          Waiting...
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {message.clicked_at ? new Date(message.clicked_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : '—'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {messages.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">💔</div>
              <p className="text-gray-500 text-xl font-semibold mb-2">No messages yet</p>
              <p className="text-gray-400">Create your first Valentine message to see it here!</p>
              <a
                href="/"
                className="inline-block mt-6 px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-xl transition-all"
              >
                Create Message
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500">
          <p className="text-sm mb-2">
            Made with <span className="text-red-500 animate-pulse">❤️</span> for spreading love
          </p>
          <div className="flex items-center justify-center gap-3 text-xs">
            <a
              href="/donate"
              className="text-pink-600 hover:text-pink-700 hover:underline font-semibold"
            >
              ☕ Donate
            </a>
            <span className="text-gray-300">•</span>
            <a
              href="https://buymeacoffee.com/riturajratan"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-700 hover:underline font-semibold"
            >
              Buy Me a Coffee
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
