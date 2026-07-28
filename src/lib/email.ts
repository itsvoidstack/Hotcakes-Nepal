import { Resend } from 'resend';

export interface VacancyEmailOptions {
  to: string;
  vacancyTitle: string;
  applicantName?: string;
  applicantEmail?: string;
  submittedAt?: string;
  totalApplications?: number;
  isTest?: boolean;
}

export async function sendVacancyNotificationEmail(options: VacancyEmailOptions): Promise<{ success: boolean; message: string; error?: string }> {
  const {
    to,
    vacancyTitle,
    applicantName = 'New Applicant',
    applicantEmail = 'N/A',
    submittedAt = new Date().toLocaleString(),
    totalApplications,
    isTest = false,
  } = options;

  if (!to || !to.trim()) {
    return {
      success: false,
      message: 'No notification email address provided.',
      error: 'Missing recipient email address.',
    };
  }

  const recipient = to.trim();

  // Primary: Resend Service
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      const fromAddress = process.env.RESEND_FROM_EMAIL || process.env.SMTP_FROM || 'Hotcakes Nepal <onboarding@resend.dev>';
      const htmlContent = generateEmailHtml({
        vacancyTitle,
        applicantName,
        applicantEmail,
        submittedAt,
        totalApplications,
        isTest,
      });

      const { data, error } = await resend.emails.send({
        from: fromAddress,
        to: [recipient],
        subject: isTest ? `🔔 [TEST] Hotcakes Nepal Vacancy Alert` : `🥞 New Application: ${vacancyTitle}`,
        html: htmlContent,
      });

      if (error) {
        console.error('Resend API error:', error);
        return {
          success: false,
          message: `Resend error: ${error.message}`,
          error: error.message,
        };
      }

      return {
        success: true,
        message: `Email notification sent successfully via Resend to ${recipient} (ID: ${data?.id || 'OK'})`,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Resend error';
      console.error('Resend error:', err);
      return { success: false, message: `Resend error: ${errorMsg}`, error: errorMsg };
    }
  }

  // Fallback if RESEND_API_KEY is not configured
  console.warn('⚠️ RESEND_API_KEY is missing in environment variables.');
  return {
    success: false,
    message: `Destination is ${recipient}, but RESEND_API_KEY is not configured in environment variables. Please add RESEND_API_KEY to .env.local or Vercel Environment Variables.`,
    error: 'Missing RESEND_API_KEY in environment variables.',
  };
}

function generateEmailHtml(data: {
  vacancyTitle: string;
  applicantName: string;
  applicantEmail: string;
  submittedAt: string;
  totalApplications?: number;
  isTest?: boolean;
}): string {
  const { vacancyTitle, applicantName, applicantEmail, submittedAt, totalApplications, isTest } = data;

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Hotcakes Nepal Vacancy Notification</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #FAF8F5; margin: 0; padding: 24px; color: #2C1A14;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #E8DFD8; overflow: hidden;">
      <!-- Header -->
      <tr style="background-color: #4A2E1B; color: #ffffff;">
        <td style="padding: 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 22px; font-weight: bold; letter-spacing: 1px;">🥞 HOTCAKES NEPAL</h1>
          <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.85;">${isTest ? 'TEST NOTIFICATION SYSTEM' : 'CAREER APPLICATION ALERT'}</p>
        </td>
      </tr>

      <!-- Content -->
      <tr>
        <td style="padding: 28px;">
          ${
            isTest
              ? `<div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; padding: 14px; border-radius: 8px; margin-bottom: 20px; color: #166534; font-weight: bold; font-size: 14px;">
                  ✅ Test Email Verified! Resend notification system is working correctly.
                </div>`
              : `<h2 style="font-size: 18px; margin-top: 0; color: #4A2E1B;">New Applicant Received!</h2>`
          }

          <table width="100%" border="0" cellspacing="0" cellpadding="8" style="font-size: 14px; margin-bottom: 20px; background-color: #FAF8F5; border-radius: 10px; border: 1px solid #E8DFD8;">
            <tr>
              <td width="35%" style="font-weight: bold; color: #8C5835;">Position:</td>
              <td style="color: #2C1A14; font-weight: bold;">${vacancyTitle}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #8C5835;">Applicant Name:</td>
              <td style="color: #2C1A14;">${applicantName}</td>
            </tr>
            ${
              applicantEmail && applicantEmail !== 'N/A'
                ? `<tr>
                    <td style="font-weight: bold; color: #8C5835;">Applicant Email:</td>
                    <td style="color: #2C1A14;"><a href="mailto:${applicantEmail}" style="color: #8C5835;">${applicantEmail}</a></td>
                  </tr>`
                : ''
            }
            <tr>
              <td style="font-weight: bold; color: #8C5835;">Submitted At:</td>
              <td style="color: #2C1A14;">${submittedAt}</td>
            </tr>
            ${
              typeof totalApplications === 'number'
                ? `<tr>
                    <td style="font-weight: bold; color: #8C5835;">Total Applications:</td>
                    <td style="color: #2C1A14; font-weight: bold;">${totalApplications}</td>
                  </tr>`
                : ''
            }
          </table>

          <p style="font-size: 13px; color: #6E5D53; line-height: 1.5; margin-bottom: 24px;">
            Log in to the Hotcakes Nepal Admin Dashboard to view full response logs or sync Google Spreadsheet updates.
          </p>

          <div style="text-align: center;">
            <a href="https://hotcakesnepal.com/hc-dashboard?tab=vacancies" style="background-color: #8C5835; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 24px; display: inline-block; font-size: 13px;">
              Open Admin Dashboard ↗
            </a>
          </div>
        </td>
      </tr>

      <!-- Footer -->
      <tr style="background-color: #FAF8F5; border-top: 1px solid #E8DFD8;">
        <td style="padding: 16px; text-align: center; font-size: 11px; color: #8C5835;">
          Hotcakes Nepal — Hattiban, Lalitpur, Nepal • Powered by Resend
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}
