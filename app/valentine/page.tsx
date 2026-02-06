'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'

export default function ValentinePage() {
  const searchParams = useSearchParams()
  const messageId = searchParams.get('id')

  const [recipientName, setRecipientName] = useState('there')
  const [loading, setLoading] = useState(true)
  const [showCelebration, setShowCelebration] = useState(false)
  const [dodgeCount, setDodgeCount] = useState(0)
  const [yesScale, setYesScale] = useState(1)
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 })

  const noBtnRef = useRef<HTMLButtonElement>(null)
  const maxDodges = 8

  useEffect(() => {
    if (!messageId) {
      alert('Invalid link!')
      return
    }

    // Fetch message details
    fetch(`/api/message?id=${messageId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRecipientName(data.message.recipient_name)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Error:', err)
        setLoading(false)
      })
  }, [messageId])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (showCelebration || dodgeCount >= maxDodges || !noBtnRef.current) return

    const noBtn = noBtnRef.current
    const rect = noBtn.getBoundingClientRect()
    const noBtnCenterX = rect.left + rect.width / 2
    const noBtnCenterY = rect.top + rect.height / 2

    const distance = Math.sqrt(
      Math.pow(e.clientX - noBtnCenterX, 2) +
      Math.pow(e.clientY - noBtnCenterY, 2)
    )

    if (distance < 120) {
      moveNoButton(e.clientX, e.clientY)
      setDodgeCount(prev => prev + 1)
      setYesScale(prev => Math.min(prev + 0.15, 2.2))
    }
  }

  const moveNoButton = (mouseX: number, mouseY: number) => {
    if (!noBtnRef.current) return

    const rect = noBtnRef.current.getBoundingClientRect()
    const angle = Math.atan2(
      rect.top + rect.height / 2 - mouseY,
      rect.left + rect.width / 2 - mouseX
    )

    const distance = 100 + Math.random() * 50
    let newX = Math.cos(angle) * distance
    let newY = Math.sin(angle) * distance

    const maxX = window.innerWidth - rect.width - 50
    const maxY = window.innerHeight - rect.height - 50

    newX = Math.max(-rect.left + 20, Math.min(newX, maxX - rect.left))
    newY = Math.max(-rect.top + 20, Math.min(newY, maxY - rect.top))

    setNoPosition({ x: newX, y: newY })
  }

  const handleYesClick = async () => {
    setShowCelebration(true)
    createHearts()
    createConfetti()

    // Send notification
    if (messageId) {
      try {
        await fetch('/api/click', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messageId }),
        })
      } catch (error) {
        console.error('Error sending notification:', error)
      }
    }
  }

  const handleNoClick = () => {
    alert("Nice try! But you can't escape love! 💕")
    setDodgeCount(prev => prev + 1)
    setYesScale(prev => Math.min(prev + 0.15, 2.2))
  }

  const createHearts = () => {
    const heartEmojis = ['❤️', '💕', '💖', '💗', '💓', '💝', '💘']

    for (let i = 0; i < 30; i++) {
      setTimeout(() => {
        const heart = document.createElement('div')
        heart.className = 'heart'
        heart.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)]
        heart.style.cssText = `
          position: fixed;
          font-size: ${20 + Math.random() * 20}px;
          left: ${Math.random() * window.innerWidth}px;
          bottom: -50px;
          animation: floatUp ${2 + Math.random() * 2}s ease-out forwards;
          pointer-events: none;
          z-index: 1000;
        `
        document.body.appendChild(heart)
        setTimeout(() => heart.remove(), 3000)
      }, i * 100)
    }
  }

  const createConfetti = () => {
    const colors = ['#ff6b9d', '#ffa8c5', '#c06c84', '#ffd700', '#ff69b4', '#da70d6']

    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div')
        confetti.style.cssText = `
          position: fixed;
          width: 10px;
          height: 10px;
          background-color: ${colors[Math.floor(Math.random() * colors.length)]};
          left: ${Math.random() * window.innerWidth}px;
          top: -10px;
          animation: confettiFall ${2 + Math.random() * 2}s ease-out forwards;
          pointer-events: none;
          z-index: 1000;
        `
        document.body.appendChild(confetti)
        setTimeout(() => confetti.remove(), 4000)
      }, i * 50)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #ffecd2 100%)'
      }}>
        <div className="text-2xl text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-5 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #ffecd2 100%)'
      }}
      onMouseMove={handleMouseMove}
    >
      <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-12 max-w-lg w-full text-center relative z-10 animate-fadeIn">
        {!showCelebration ? (
          <>
            <div className="text-7xl mb-5 animate-float">💝</div>
            <div className="text-3xl font-bold mb-2" style={{ color: '#ff6b9d' }}>
              Hey {recipientName}! 💕
            </div>
            <div className="text-4xl font-bold mb-6" style={{ color: '#c06c84' }}>
              Will you be mine valentine?
            </div>
            <div className="text-gray-500 italic mb-8">&quot;No&quot; seems a bit shy 😈</div>

            <div className="flex gap-5 justify-center items-center min-h-[150px] relative">
              <button
                onClick={handleYesClick}
                className="px-12 py-4 rounded-full text-2xl font-bold text-white shadow-lg transition-all hover:shadow-xl"
                style={{
                  background: 'linear-gradient(135deg, #ff6b9d 0%, #ff5085 100%)',
                  transform: `scale(${yesScale})`,
                  transformOrigin: 'center'
                }}
              >
                Yes 💖
              </button>
              <button
                ref={noBtnRef}
                onClick={handleNoClick}
                className="px-12 py-4 rounded-full text-2xl font-bold shadow-lg transition-all absolute"
                style={{
                  background: '#e0e0e0',
                  color: '#666',
                  transform: `translate(${noPosition.x}px, ${noPosition.y}px)`
                }}
              >
                No 😢
              </button>
            </div>
          </>
        ) : (
          <div className="animate-celebrationIn">
            <div className="text-8xl mb-5 animate-bounce">🎉</div>
            <h1 className="text-6xl font-bold mb-5" style={{ color: '#ff6b9d' }}>
              YAY!
            </h1>
            <p className="text-2xl text-gray-600">They said YES! 💖</p>
            <div className="mt-6">
              <img
                src="https://media.giphy.com/media/g5R9dok94mrIvplmZd/giphy.gif"
                alt="Celebration"
                className="max-w-full rounded-2xl"
              />
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes celebrationIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes floatUp {
          0% {
            opacity: 1;
            transform: translateY(0) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translateY(-100vh) rotate(360deg);
          }
        }
        @keyframes confettiFall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-celebrationIn {
          animation: celebrationIn 0.6s ease-out;
        }
        .animate-bounce {
          animation: bounce 1s ease-in-out infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  )
}
