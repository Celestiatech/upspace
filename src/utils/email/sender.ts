import nodemailer, { type Transporter } from 'nodemailer';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

let cachedTransporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.MAIL_HOST || 'smtp-relay.brevo.com';
  const port = Number(process.env.MAIL_PORT) || 465;
  const user = process.env.MAIL_USERNAME || process.env.SMTP_USER;
  const pass = process.env.MAIL_PASSWORD || process.env.SMTP_PASSWORD || process.env.SMTP_PASS;

  if (!user || !pass) {
    console.warn('[Email] SMTP credentials not fully configured in environment variables.');
    return null;
  }

  try {
    cachedTransporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for 587
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== 'false',
      },
    });

    return cachedTransporter;
  } catch (err) {
    console.error('[Email] Failed to create SMTP transporter:', err);
    return null;
  }
}

/**
 * Sends a transactional or marketing email via configured Brevo / SMTP server
 */
export async function sendEmail({ to, subject, html, text, replyTo }: EmailPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const fromAddress = process.env.MAIL_FROM_ADDRESS || 'notifications@upspace.live';
  const fromName = process.env.MAIL_FROM_NAME || 'UpSpace 3D Skyline';
  const formattedFrom = `"${fromName}" <${fromAddress}>`;

  const transporter = getTransporter();

  if (!transporter) {
    console.log(`[Email Mock/Dev] Would send email to: ${to} | Subject: ${subject}`);
    return { success: true, messageId: `mock_${Date.now()}` };
  }

  try {
    const info = await transporter.sendMail({
      from: formattedFrom,
      to,
      replyTo: replyTo || fromAddress,
      subject,
      html,
      text: text || html.replace(/<[^>]*>?/gm, ''),
    });

    console.log(`[Email Sent] Message ID: ${info.messageId} to ${to}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('[Email Error] Failed to send email:', error);
    return { success: false, error: error?.message || 'SMTP Transmission Error' };
  }
}
