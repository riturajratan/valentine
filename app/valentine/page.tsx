'use client'

import { useEffect, useState, useRef, Suspense, useCallback, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'

function ValentineContent() {
  const searchParams = useSearchParams()
  const messageId = searchParams.get('id')

  const [recipientName, setRecipientName] = useState('there')
  const [loading, setLoading] = useState(true)
  const [showCelebration, setShowCelebration] = useState(false)

  const noBtnRef = useRef<HTMLButtonElement>(null)
  const yesBtnRef = useRef<HTMLButtonElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const messageRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const progressContainerRef = useRef<HTMLDivElement>(null)

  // Use refs instead of state to prevent re-renders
  const dodgeCountRef = useRef(0)
  const yesScaleRef = useRef(1)
  const lastDodgeTimeRef = useRef(0)
  const animationFrameRef = useRef<number | undefined>(undefined)
  const noPositionRef = useRef({ x: 0, y: 0 })
  const shakeTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const maxDodges = 8

  // Memoize floating hearts to prevent re-creation on every render
  const floatingHearts = useMemo(() => {
    return [...Array(20)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 10 + Math.random() * 10,
    }))
  }, [])

  useEffect(() => {
    if (!messageId) {
      alert('Invalid link!')
      return
    }

    let isMounted = true

    fetch(`/api/message?id=${messageId}`)
      .then(res => res.json())
      .then(data => {
        if (isMounted && data.success) {
          // Batch both state updates in a single render cycle
          const name = data.message.recipient_name
          requestAnimationFrame(() => {
            if (isMounted) {
              // Update both states together
              setRecipientName(name)
              setLoading(false)
            }
          })
        } else if (isMounted) {
          requestAnimationFrame(() => {
            if (isMounted) {
              setLoading(false)
            }
          })
        }
      })
      .catch(err => {
        console.error('Error:', err)
        if (isMounted) {
          requestAnimationFrame(() => {
            if (isMounted) {
              setLoading(false)
            }
          })
        }
      })

    return () => {
      isMounted = false
    }
  }, [messageId])

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (showCelebration || dodgeCountRef.current >= maxDodges || !noBtnRef.current) return

    // Cancel previous animation frame to prevent buildup
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      if (!noBtnRef.current) return

      const noBtn = noBtnRef.current
      const rect = noBtn.getBoundingClientRect()
      const noBtnCenterX = rect.left + rect.width / 2
      const noBtnCenterY = rect.top + rect.height / 2

      const distance = Math.sqrt(
        Math.pow(e.clientX - noBtnCenterX, 2) +
        Math.pow(e.clientY - noBtnCenterY, 2)
      )

      // ALWAYS move the button away from cursor (continuous tracking)
      const angle = Math.atan2(
        noBtnCenterY - e.clientY,
        noBtnCenterX - e.clientX
      )

      // Keep button at a minimum distance from cursor
      const minDistance = 180
      if (distance < minDistance) {
        const moveDistance = minDistance - distance + 50
        let newX = Math.cos(angle) * moveDistance
        let newY = Math.sin(angle) * moveDistance

        const maxX = window.innerWidth - rect.width - 50
        const maxY = window.innerHeight - rect.height - 50

        newX = Math.max(-rect.left + 20, Math.min(newX, maxX - rect.left))
        newY = Math.max(-rect.top + 20, Math.min(newY, maxY - rect.top))

        // Update position via direct DOM manipulation (NO React re-render!)
        noPositionRef.current = { x: newX, y: newY }
        noBtn.style.transform = `translate3d(${newX}px, ${newY}px, 0)`

        // Only increment dodge count once per second to avoid too many updates
        const now = Date.now()
        if (now - lastDodgeTimeRef.current > 1000) {
          lastDodgeTimeRef.current = now
          dodgeCountRef.current += 1
          yesScaleRef.current = Math.min(yesScaleRef.current + 0.2, 2.5)

          const newDodgeCount = dodgeCountRef.current
          const newYesScale = yesScaleRef.current

          // Update via direct DOM manipulation (NO React re-render!)
          if (yesBtnRef.current) {
            yesBtnRef.current.style.transform = `scale(${newYesScale})`
          }

          // Update message text
          if (messageRef.current) {
            if (newDodgeCount >= maxDodges) {
              messageRef.current.textContent = "Haha! The No button ran away forever! 😂 Love wins!"
            } else if (newDodgeCount > 4) {
              messageRef.current.textContent = `Stop chasing me! 🏃‍♂️💨 Just click YES already! (${newDodgeCount}/${maxDodges})`
            } else {
              messageRef.current.textContent = `Catch me if you can! 😜 The No button is too fast for you (${newDodgeCount}/${maxDodges})`
            }
          }

          // Show/update progress indicator
          if (progressContainerRef.current && progressRef.current) {
            progressContainerRef.current.style.display = 'block'
            progressRef.current.textContent = `Love is growing stronger! ${Math.round((newYesScale - 1) * 100)}%`
          }

          // Update No button opacity if max dodges reached
          if (newDodgeCount >= maxDodges && noBtn) {
            noBtn.style.opacity = '0.3'
            noBtn.style.pointerEvents = 'none'
          }

          // Add shake animation to card
          if (cardRef.current) {
            cardRef.current.classList.add('animate-shake')
            if (shakeTimeoutRef.current) {
              clearTimeout(shakeTimeoutRef.current)
            }
            shakeTimeoutRef.current = setTimeout(() => {
              if (cardRef.current) {
                cardRef.current.classList.remove('animate-shake')
              }
            }, 500)
          }
        }
      }
    })
  }, [showCelebration, maxDodges])

  const handleYesClick = async () => {
    setShowCelebration(true)
    createHearts()
    createConfetti()
    createFireworks()

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

    dodgeCountRef.current += 1
    yesScaleRef.current = Math.min(yesScaleRef.current + 0.2, 2.5)

    const newDodgeCount = dodgeCountRef.current
    const newYesScale = yesScaleRef.current

    // Update via direct DOM manipulation
    if (yesBtnRef.current) {
      yesBtnRef.current.style.transform = `scale(${newYesScale})`
    }

    if (messageRef.current) {
      if (newDodgeCount >= maxDodges) {
        messageRef.current.textContent = "Haha! The No button ran away forever! 😂 Love wins!"
      } else if (newDodgeCount > 4) {
        messageRef.current.textContent = `Stop chasing me! 🏃‍♂️💨 Just click YES already! (${newDodgeCount}/${maxDodges})`
      } else {
        messageRef.current.textContent = `Catch me if you can! 😜 The No button is too fast for you (${newDodgeCount}/${maxDodges})`
      }
    }

    if (progressContainerRef.current && progressRef.current) {
      progressContainerRef.current.style.display = 'block'
      progressRef.current.textContent = `Love is growing stronger! ${Math.round((newYesScale - 1) * 100)}%`
    }

    if (cardRef.current) {
      cardRef.current.classList.add('animate-shake')
      if (shakeTimeoutRef.current) {
        clearTimeout(shakeTimeoutRef.current)
      }
      shakeTimeoutRef.current = setTimeout(() => {
        if (cardRef.current) {
          cardRef.current.classList.remove('animate-shake')
        }
      }, 500)
    }
  }

  const createHearts = () => {
    const heartEmojis = ['❤️', '💕', '💖', '💗', '💓', '💝', '💘', '💞', '💟', '❣️']

    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        const heart = document.createElement('div')
        heart.className = 'heart'
        heart.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)]
        heart.style.cssText = `
          position: fixed;
          font-size: ${30 + Math.random() * 40}px;
          left: ${Math.random() * window.innerWidth}px;
          bottom: -100px;
          animation: floatUp ${3 + Math.random() * 3}s ease-out forwards;
          pointer-events: none;
          z-index: 1000;
          filter: drop-shadow(0 0 10px rgba(255, 0, 100, 0.5));
        `
        document.body.appendChild(heart)
        setTimeout(() => heart.remove(), 6000)
      }, i * 80)
    }
  }

  const createConfetti = () => {
    const colors = ['#ff6b9d', '#ffa8c5', '#c06c84', '#ffd700', '#ff69b4', '#da70d6', '#87ceeb', '#98fb98']

    for (let i = 0; i < 100; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div')
        const size = Math.random() * 15 + 5
        confetti.style.cssText = `
          position: fixed;
          width: ${size}px;
          height: ${size}px;
          background-color: ${colors[Math.floor(Math.random() * colors.length)]};
          left: ${Math.random() * window.innerWidth}px;
          top: -20px;
          animation: confettiFall ${3 + Math.random() * 3}s ease-out forwards;
          pointer-events: none;
          z-index: 1000;
          border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
          opacity: 0.9;
        `
        document.body.appendChild(confetti)
        setTimeout(() => confetti.remove(), 6000)
      }, i * 30)
    }
  }

  const createFireworks = () => {
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        const x = Math.random() * window.innerWidth
        const y = Math.random() * (window.innerHeight * 0.6)

        for (let j = 0; j < 12; j++) {
          const particle = document.createElement('div')
          const angle = (Math.PI * 2 * j) / 12
          particle.style.cssText = `
            position: fixed;
            width: 6px;
            height: 6px;
            background: ${['#ff6b9d', '#ffd700', '#87ceeb', '#98fb98'][Math.floor(Math.random() * 4)]};
            left: ${x}px;
            top: ${y}px;
            border-radius: 50%;
            animation: explode 1s ease-out forwards;
            --angle: ${angle}rad;
            pointer-events: none;
            z-index: 999;
          `
          document.body.appendChild(particle)
          setTimeout(() => particle.remove(), 1000)
        }
      }, i * 400)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-400 via-red-400 to-purple-500">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">💕</div>
          <div className="text-2xl text-white font-bold">Loading magic...</div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-5 overflow-hidden relative"
      onMouseMove={handleMouseMove}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-300 via-purple-300 to-red-300 animate-gradient-shift"></div>

      {/* Floating Hearts Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingHearts.map((heart) => (
          <div
            key={heart.id}
            className="absolute text-4xl opacity-10 animate-float-random"
            style={{
              left: `${heart.left}%`,
              top: `${heart.top}%`,
              animationDelay: `${heart.delay}s`,
              animationDuration: `${heart.duration}s`,
            }}
          >
            💕
          </div>
        ))}
      </div>

      {/* Main Card */}
      <div ref={cardRef} className="relative z-10 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl p-12 max-w-2xl w-full text-center border-4 border-white/30 animate-pop-in">
        {!showCelebration ? (
          <>
            {/* Main Content */}
            <div className="mb-8">
              <div className="text-9xl mb-6 animate-float inline-block hover:scale-110 transition-transform cursor-pointer">
                💝
              </div>
              <div className="text-5xl font-black mb-4 bg-gradient-to-r from-pink-600 via-red-500 to-purple-600 bg-clip-text text-transparent animate-slide-down">
                Hey {recipientName}! 💕
              </div>
              <div className="text-4xl font-bold mb-6 text-gray-800 leading-tight animate-slide-down" style={{ animationDelay: '0.1s' }}>
                Will you be my<br />Valentine?
              </div>
              <div className="text-lg text-gray-600 italic mb-8 animate-slide-down" style={{ animationDelay: '0.2s' }}>
                <span ref={messageRef} className="text-pink-600 font-semibold">
                  Try clicking &quot;No&quot; if you dare... 😈
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-8 justify-center items-center min-h-[200px] relative">
              {/* Yes Button */}
              <button
                ref={yesBtnRef}
                onClick={handleYesClick}
                className="relative px-16 py-6 rounded-full text-3xl font-black text-white shadow-2xl transition-all duration-300 hover:shadow-pink-500/50 animate-pulse-slow group overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #ec4899 0%, #ef4444 100%)',
                  transform: 'scale(1)',
                  transformOrigin: 'center',
                  willChange: 'transform',
                }}
              >
                <span className="relative z-10 flex items-center gap-3">
                  Yes! 💖
                  <span className="text-2xl group-hover:scale-125 transition-transform inline-block">
                    ✨
                  </span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-red-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>

              {/* No Button */}
              <button
                ref={noBtnRef}
                onClick={handleNoClick}
                className="absolute px-12 py-5 rounded-full text-2xl font-bold shadow-lg select-none"
                style={{
                  background: '#e5e7eb',
                  color: '#6b7280',
                  transform: 'translate3d(0, 0, 0)',
                  opacity: 1,
                  pointerEvents: 'auto',
                  transition: 'opacity 0.3s ease',
                  willChange: 'transform',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              >
                No 😢
              </button>
            </div>

            {/* Progress Indicator */}
            <div ref={progressContainerRef} className="mt-8 text-center animate-fade-in" style={{ display: 'none' }}>
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-pink-100 rounded-full">
                <span className="text-2xl animate-bounce">💘</span>
                <span ref={progressRef} className="text-sm font-semibold text-pink-700">
                  Love is growing stronger! 0%
                </span>
              </div>
            </div>

            {/* Footer with Support Links */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500 mb-2">
                Like this? Support the creator! 💕
              </p>
              <div className="flex items-center justify-center gap-2 text-xs">
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
          </>
        ) : (
          /* Celebration Screen */
          <div className="animate-celebration">
            <div className="text-9xl mb-8 animate-bounce-big inline-block">
              💝
            </div>
            <h1 className="text-6xl md:text-7xl font-black mb-6 bg-gradient-to-r from-pink-600 via-red-500 to-purple-600 bg-clip-text text-transparent animate-scale-up leading-tight">
              Ohh Wow! 😍
            </h1>
            <p className="text-3xl md:text-4xl text-gray-700 mb-4 font-bold animate-slide-up">
              You said YES! 💖
            </p>
            <div className="text-xl md:text-2xl text-pink-600 mb-8 animate-slide-up font-semibold italic" style={{ animationDelay: '0.2s' }}>
              Two hearts, one beautiful story ✨
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl animate-scale-up border-4 border-pink-300" style={{ animationDelay: '0.3s' }}>
              <img
                src="https://media.giphy.com/media/G96zgIcQn1L2xpmdxi/giphy.gif"
                alt="Love Celebration - They Said Yes!"
                className="max-w-full w-full"
                style={{ maxHeight: '400px', objectFit: 'cover' }}
              />
            </div>

            {/* Support Links */}
            <div className="mt-8 pt-6 border-t border-pink-200 text-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <p className="text-sm text-gray-600 mb-3">
                Enjoyed this? Support the creator! 💕
              </p>
              <div className="flex items-center justify-center gap-3 text-sm">
                <a
                  href="/donate"
                  className="inline-flex items-center gap-1 px-4 py-2 bg-pink-100 text-pink-700 rounded-full hover:bg-pink-200 transition-all font-semibold"
                >
                  ☕ Donate
                </a>
                <a
                  href="https://buymeacoffee.com/riturajratan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-4 py-2 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-all font-semibold"
                >
                  💖 Buy Me a Coffee
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(10deg); }
        }
        @keyframes float-random {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(20px, -20px) rotate(90deg); }
          50% { transform: translate(-20px, 20px) rotate(180deg); }
          75% { transform: translate(20px, 20px) rotate(270deg); }
        }
        @keyframes pop-in {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          60% {
            transform: scale(1.05);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px) rotate(-5deg); }
          75% { transform: translateX(10px) rotate(5deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); box-shadow: 0 20px 60px rgba(236, 72, 153, 0.3); }
          50% { transform: scale(1.05); box-shadow: 0 25px 80px rgba(236, 72, 153, 0.5); }
        }
        @keyframes celebration {
          from {
            opacity: 0;
            transform: scale(0.5) rotate(-10deg);
          }
          to {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }
        @keyframes bounce-big {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-40px); }
        }
        @keyframes scale-up {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes floatUp {
          0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-150vh) rotate(720deg) scale(1.5);
            opacity: 0;
          }
        }
        @keyframes confettiFall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(120vh) rotate(720deg);
            opacity: 0;
          }
        }
        @keyframes explode {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(
              calc(cos(var(--angle)) * 150px),
              calc(sin(var(--angle)) * 150px)
            ) scale(0);
            opacity: 0;
          }
        }
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 10s ease infinite;
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-float-random {
          animation: float-random linear infinite;
        }
        .animate-pop-in {
          animation: pop-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        .animate-slide-down {
          animation: slide-down 0.6s ease-out;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        .animate-celebration {
          animation: celebration 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        .animate-bounce-big {
          animation: bounce-big 1.5s ease-in-out infinite;
        }
        .animate-scale-up {
          animation: scale-up 0.6s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}

export default function ValentinePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-400 via-red-400 to-purple-500">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">💕</div>
          <div className="text-2xl text-white font-bold">Loading magic...</div>
        </div>
      </div>
    }>
      <ValentineContent />
    </Suspense>
  )
}
