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
    // Check authentication
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
      // Fetch all messages
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

      // Calculate stats
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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-5">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Valentine Message Analytics</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold uppercase">Total Messages</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalMessages}</p>
              </div>
              <div className="text-4xl">💌</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold uppercase">Total Clicks</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.totalClicks}</p>
              </div>
              <div className="text-4xl">💖</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold uppercase">Conversion Rate</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {stats.conversionRate.toFixed(1)}%
                </p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold uppercase">Unique Senders</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.uniqueSenders}</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>
        </div>

        {/* Messages Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">All Messages</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recipient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sender Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sender Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clicked At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {messages.map((message) => (
                  <tr key={message.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{message.recipient_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{message.sender_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{message.sender_name || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {new Date(message.created_at).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {message.clicked ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Clicked
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {message.clicked_at ? new Date(message.clicked_at).toLocaleString() : '-'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {messages.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No messages yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
