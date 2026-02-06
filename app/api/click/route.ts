import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messageId } = body

    if (!messageId) {
      return NextResponse.json(
        { success: false, error: 'Missing message ID' },
        { status: 400 }
      )
    }

    // Fetch message details using admin client
    const { data: message, error: fetchError } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('id', messageId)
      .single()

    if (fetchError || !message) {
      return NextResponse.json(
        { success: false, error: 'Message not found' },
        { status: 404 }
      )
    }

    // Check if already clicked
    if (message.clicked) {
      return NextResponse.json({
        success: true,
        alreadyClicked: true,
      })
    }

    // Update message as clicked
    const { error: updateError } = await supabaseAdmin
      .from('messages')
      .update({
        clicked: true,
        clicked_at: new Date().toISOString(),
      })
      .eq('id', messageId)

    if (updateError) {
      console.error('Update error:', updateError)
    }

    // Record click in clicks table
    await supabaseAdmin
      .from('clicks')
      .insert([
        {
          message_id: messageId,
          recipient_name: message.recipient_name,
          sender_email: message.sender_email,
        }
      ])

    // Send email notification via Resend with custom domain
    try {
      const emailSubject = '💖 Someone said YES to your Valentine!'
      const senderInfo = message.sender_name
        ? `from ${message.sender_name}`
        : ''

      const fromEmail = process.env.RESEND_FROM_EMAIL ||
                        'noreply@maddyzone.com'
      const fromName = process.env.RESEND_FROM_NAME ||
                       'Valentine App'

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #ff6b9d; text-align: center;">💖 Great News!</h1>
          <p style="font-size: 18px; line-height: 1.6;">
            Hey there!
          </p>
          <p style="font-size: 18px; line-height: 1.6;">
            <strong>${message.recipient_name}</strong> clicked <strong>YES</strong> on your Valentine message${senderInfo ? ' ' + senderInfo : ''}! 🎉
          </p>
          <p style="font-size: 16px; color: #666;">
            They saw your message and accepted!
          </p>
          <div style="margin-top: 30px; padding: 20px; background: #fff0f5; border-radius: 10px; border-left: 4px solid #ff6b9d;">
            <p style="margin: 0; color: #333;">
              <strong>Recipient:</strong> ${message.recipient_name}<br />
              <strong>Clicked at:</strong> ${new Date().toLocaleString()}
            </p>
          </div>
          <p style="margin-top: 30px; font-size: 14px; color: #999; text-align: center;">
            Sent via <a href="https://maddyzone.com" style="color: #ff6b9d; text-decoration: none;">Valentine Message Generator</a> 💕
          </p>
        </div>
      `

      await resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: message.sender_email,
        subject: emailSubject,
        html: emailHtml,
      })
    } catch (emailError) {
      console.error('Email error:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      alreadyClicked: false,
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
