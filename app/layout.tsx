import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Valentine Message Generator 💕',
  description: 'Create romantic and playful Valentine messages',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
