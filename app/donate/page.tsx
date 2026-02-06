'use client'

import { useState } from 'react'

export default function DonatePage() {
  const [activeTab, setActiveTab] = useState<'international' | 'india'>('international')

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-5">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-purple-400 to-red-400 animate-gradient"></div>

      {/* Floating Hearts */}
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute text-4xl opacity-20 animate-float-up pointer-events-none"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            bottom: '-100px',
          }}
        >
          ❤️
        </div>
      ))}

      {/* Main Content Card */}
      <div className="relative z-10 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 max-w-2xl w-full border border-white/20 animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-7xl mb-4 animate-bounce-slow">☕</div>
          <h1 className="text-5xl font-black mb-3 bg-gradient-to-r from-pink-600 via-red-500 to-purple-600 bg-clip-text text-transparent">
            Support This Project
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            If you enjoyed this Valentine generator, consider buying me a coffee! ☕
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Your support helps keep this project running and free for everyone! 💕
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab('international')}
            className={`flex-1 py-4 px-6 rounded-2xl font-bold text-lg transition-all ${
              activeTab === 'international'
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🌍 Buy Me a Coffee
          </button>
          <button
            onClick={() => setActiveTab('india')}
            className={`flex-1 py-4 px-6 rounded-2xl font-bold text-lg transition-all ${
              activeTab === 'india'
                ? 'bg-gradient-to-r from-orange-500 to-green-500 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🇮🇳 India (UPI)
          </button>
        </div>

        {/* Content */}
        {activeTab === 'international' ? (
          <div className="text-center animate-fade-in">
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 mb-6 border-2 border-yellow-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-2">
                <span className="text-3xl">☕</span>
                Scan to Support
              </h2>
              <div className="bg-white p-6 rounded-2xl shadow-lg inline-block">
                <img
                  src="/buymeacoffee-qr.png"
                  alt="Buy Me a Coffee QR Code"
                  className="w-64 h-64 mx-auto"
                />
              </div>
              <p className="text-gray-600 mt-4 font-medium">
                Scan with your phone camera to donate
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <a
                href="https://buymeacoffee.com/riturajratan"
                target="_blank"
                rel="noopener noreferrer"
                className="block py-4 px-8 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black text-xl rounded-2xl hover:shadow-2xl transition-all hover:scale-105"
              >
                ☕ Visit Buy Me a Coffee
              </a>
              <p className="text-sm text-gray-500">
                Or visit: <span className="font-mono text-pink-600">buymeacoffee.com/riturajratan</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center animate-fade-in">
            <div className="bg-gradient-to-br from-orange-50 to-green-50 rounded-2xl p-8 mb-6 border-2 border-orange-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-2">
                <span className="text-3xl">🇮🇳</span>
                Pay via UPI
              </h2>
              <div className="bg-white p-6 rounded-2xl shadow-lg inline-block">
                <img
                  src="/india-payment-qr.png"
                  alt="India UPI Payment QR Code"
                  className="w-64 h-64 mx-auto"
                />
              </div>
              <p className="text-gray-600 mt-4 font-medium">
                Scan with any UPI app (PhonePe, Paytm, GPay, etc.)
              </p>
            </div>

            <div className="bg-gradient-to-r from-orange-100 to-green-100 rounded-xl p-6 border-l-4 border-orange-500">
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong className="text-orange-600">💡 For Indian Users:</strong><br />
                Use any UPI app to scan the QR code and send a donation. Every contribution, no matter how small, is greatly appreciated! 🙏
              </p>
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <a
            href="/"
            className="inline-block px-8 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all"
          >
            ← Back to Home
          </a>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Made with <span className="text-red-500 animate-pulse">❤️</span> by Rituraj Ratan
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
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
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
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}
