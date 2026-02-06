'use client'

import { Turnstile } from '@marsidev/react-turnstile'

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void
  onError?: () => void
}

export default function TurnstileWidget({ onSuccess, onError }: TurnstileWidgetProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  if (!siteKey) {
    console.error('NEXT_PUBLIC_TURNSTILE_SITE_KEY is not configured')
    return (
      <div className="text-center text-red-600 text-sm">
        CAPTCHA configuration error
      </div>
    )
  }

  return (
    <div className="flex justify-center my-4">
      <Turnstile
        siteKey={siteKey}
        onSuccess={onSuccess}
        onError={onError}
        options={{
          theme: 'light',
          size: 'normal',
        }}
      />
    </div>
  )
}
