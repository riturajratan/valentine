interface TurnstileVerifyResponse {
  success: boolean
  'error-codes'?: string[]
  challenge_ts?: string
  hostname?: string
}

export async function verifyCaptchaToken(token: string, ip?: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY

  if (!secretKey) {
    console.error('TURNSTILE_SECRET_KEY is not configured')
    return false
  }

  try {
    const formData = new FormData()
    formData.append('secret', secretKey)
    formData.append('response', token)
    if (ip) {
      formData.append('remoteip', ip)
    }

    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        body: formData,
      }
    )

    const data: TurnstileVerifyResponse = await response.json()

    if (!data.success && data['error-codes']) {
      console.error('CAPTCHA verification failed:', data['error-codes'])
    }

    return data.success
  } catch (error) {
    console.error('Error verifying CAPTCHA:', error)
    return false
  }
}
