import nodemailer from 'nodemailer'
import { smtp as smtpConfig } from '../config/env.js'

let transporter = null

/**
 * Lazy-initialize the Nodemailer transporter so it works even without env vars set.
 */
function getTransporter() {
  if (transporter) return transporter

  if (smtpConfig.host && smtpConfig.user && smtpConfig.pass) {
    transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.port === 465,
      auth: { user: smtpConfig.user, pass: smtpConfig.pass }
    })
  } else {
    // Create a fake transporter that just logs (for dev without SMTP config)
    transporter = {
      sendMail: async (mailOptions) => {
        console.log('')
        console.log('📧 ===== EMAIL (SMTP not configured) =====')
        console.log(`📧 To:      ${mailOptions.to}`)
        console.log(`📧 Subject: ${mailOptions.subject}`)
        console.log(`📧 OTP:     ${extractOtpFromHtml(mailOptions.html)}`)
        console.log('📧 =======================================')
        console.log('')
        return { messageId: 'fallback-transporter' }
      }
    }
  }

  return transporter
}

/**
 * Pull the OTP code out of the HTML body so we can log it in the fake transporter.
 */
function extractOtpFromHtml(html) {
  const match = html && html.match(/(\d{4})<\/div>\s*$/m)
  return match ? match[1] : 'unknown'
}

/**
 * Send an OTP code via email.
 * @param {string} to - Recipient email address
 * @param {string} otp - The 4-digit OTP code
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function sendOtpEmail(to, otp) {
  try {
    const from = smtpConfig.from
    const transport = getTransporter()

    await transport.sendMail({
      from,
      to,
      subject: 'Your Kady Admin OTP Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f4f4f5; padding: 32px;">
          <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <div style="text-align: center;">
              <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #6c63ff, #8b83ff); border-radius: 14px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L4 5v5c0 5.5 3.8 10.6 8 12 4.2-1.4 8-6.5 8-12V5l-8-3zm1 12.5v3h-2v-3H9l3-3 3 3h-2zM12 6.5c.8 0 1.5.7 1.5 1.5h-3c0-.8.7-1.5 1.5-1.5z" fill="white"/>
                </svg>
              </div>
              <h1 style="font-size: 20px; font-weight: 600; color: #18181b; margin: 0 0 8px;">Verify Your Identity</h1>
              <p style="font-size: 14px; color: #71717a; margin: 0 0 24px;">Use the OTP below to complete your admin login.</p>
            </div>

            <div style="background: #f8f8ff; border: 1px solid #e8e8ff; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
              <p style="font-size: 12px; color: #71717a; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">One-Time Password</p>
              <div style="font-size: 40px; font-weight: 700; letter-spacing: 12px; color: #6c63ff; font-family: 'Courier New', monospace;">${otp}</div>
            </div>

            <div style="border-top: 1px solid #e4e4e7; padding-top: 16px;">
              <p style="font-size: 12px; color: #a1a1aa; margin: 0 0 4px;">
                This OTP expires in <strong style="color: #52525b;">5 minutes</strong>.
              </p>
              <p style="font-size: 12px; color: #a1a1aa; margin: 0;">
                If you didn't request this, you can safely ignore this email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    })
    return { success: true }
  } catch (err) {
    console.error('Failed to send OTP email:', err.message)
    return { success: false, error: err.message }
  }
}

export { sendOtpEmail }
