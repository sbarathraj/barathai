import nodemailer from 'nodemailer';

export async function sendRateLimitAlert(errorDetails: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"BarathAI Alerts" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_ALERT_TO || process.env.GMAIL_USER,
    subject: '🚨 [BarathAI] Rate Limit Exceeded (429 Error) – Immediate Attention Required',
    text: `BarathAI has detected a 429 (Too Many Requests) error.\n\nDetails:\n${errorDetails}\n\nTime: ${new Date().toLocaleString()}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; background: linear-gradient(135deg, #f8fafc 0%, #f0abfc 100%); padding: 0; min-height: 100vh;">
        <div style="max-width: 540px; margin: 40px auto; background: #fff; border-radius: 22px; box-shadow: 0 8px 40px rgba(80, 80, 180, 0.10); border: 2px solid; border-image: linear-gradient(90deg, #2563eb 0%, #a21caf 100%) 1; padding: 40px 8vw 32px 8vw; max-width: 98vw;">
          <div style="text-align: center; margin-bottom: 18px;">
            <span style="display: inline-block; background: linear-gradient(90deg, #2563eb 0%, #a21caf 100%); border-radius: 50%; padding: 22px; box-shadow: 0 2px 16px #a21caf22;">
              <svg width="64" height="64" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block; margin:auto;">
                <circle cx="20" cy="20" r="18" fill="url(#gradient1)" />
                <circle cx="12" cy="12" r="3" fill="#ffffff" opacity="0.9" />
                <circle cx="28" cy="12" r="3" fill="#ffffff" opacity="0.9" />
                <circle cx="20" cy="20" r="3" fill="#ffffff" opacity="0.9" />
                <circle cx="12" cy="28" r="3" fill="#ffffff" opacity="0.9" />
                <circle cx="28" cy="28" r="3" fill="#ffffff" opacity="0.9" />
                <line x1="12" y1="12" x2="20" y2="20" stroke="#ffffff" stroke-width="1.5" opacity="0.7" />
                <line x1="28" y1="12" x2="20" y2="20" stroke="#ffffff" stroke-width="1.5" opacity="0.7" />
                <line x1="20" y1="20" x2="12" y2="28" stroke="#ffffff" stroke-width="1.5" opacity="0.7" />
                <line x1="20" y1="20" x2="28" y2="28" stroke="#ffffff" stroke-width="1.5" opacity="0.7" />
                <line x1="12" y1="12" x2="28" y2="12" stroke="#ffffff" stroke-width="1" opacity="0.5" />
                <line x1="12" y1="28" x2="28" y2="28" stroke="#ffffff" stroke-width="1" opacity="0.5" />
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#3b82f6" />
                    <stop offset="50%" stop-color="#8b5cf6" />
                    <stop offset="100%" stop-color="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </div>
          <div style="text-align: center; color: #6366f1; font-size: 1.05rem; font-weight: 500; margin-bottom: 10px;">
            The AI Platform for Professionals
          </div>
          <h1 style="color: #1e293b; font-size: 2rem; font-weight: 900; margin-bottom: 6px; text-align: center; letter-spacing: -1px;">BarathAI Rate Limit Alert</h1>
          <hr style="border: none; border-top: 1.5px solid #f3e8ff; margin: 18px 0 24px 0;" />
          <p style="color: #334155; font-size: 1.13rem; text-align: center; margin-bottom: 24px;">
            <strong style="color: #dc2626;">
              OpenRouter Primary API returned a 429 (Too Many Requests) error.<br/>
              <span style="color: #a21caf;">BarathAI has automatically switched to the backup API endpoint to maintain service continuity.</span>
            </strong>
          </p>
          <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 18px; font-size: 1.04rem; color: #475569; font-family: 'JetBrains Mono', 'Fira Mono', 'Menlo', monospace;">
            <strong>Full Error Details:</strong>
            <pre style="white-space: pre-wrap; word-break: break-all; margin: 0; color: #334155; font-size: 1.01rem;">${errorDetails}</pre>
          </div>
          <div style="color: #64748b; font-size: 1rem; text-align: right; margin-bottom: 8px;">
            <span>Time: ${new Date().toLocaleString()}</span>
          </div>
          <div style="margin-top: 32px; text-align: center;">
            <a href="https://your-barathai-dashboard.com" style="display: inline-block; background: linear-gradient(90deg, #2563eb 0%, #a21caf 100%); color: #fff; font-weight: 700; padding: 14px 38px; border-radius: 10px; text-decoration: none; font-size: 1.08rem; box-shadow: 0 2px 12px #a21caf22; letter-spacing: 0.01em; transition: background 0.2s;">Open BarathAI Dashboard</a>
          </div>
        </div>
        <div style="text-align: center; color: #a1a1aa; font-size: 0.97rem; margin-top: 32px; letter-spacing: 0.01em;">
          &copy; ${new Date().getFullYear()} <span style="color: #a21caf; font-weight: 700;">BarathAI</span>. All rights reserved.<br/>
          <span style="font-size: 0.93rem; color: #64748b;">
            This is an automated system notification from BarathAI.<br/>
            For questions, contact your administrator or BarathAI support.
          </span>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Rate limit alert email sent!');
  } catch (err) {
    console.error('Failed to send alert email:', err);
  }
}

export async function sendErrorAlert(errorTitle: string, errorDetails: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"BarathAI Alerts" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_ALERT_TO || process.env.GMAIL_USER,
    subject: `🚨 [BarathAI] ${errorTitle} – Immediate Attention Required`,
    text: `BarathAI has detected an error: ${errorTitle}\n\nDetails:\n${errorDetails}\n\nTime: ${new Date().toLocaleString()}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; background: linear-gradient(135deg, #f8fafc 0%, #f0abfc 100%); padding: 0; min-height: 100vh;">
        <div style="max-width: 540px; margin: 40px auto; background: #fff; border-radius: 22px; box-shadow: 0 8px 40px rgba(80, 80, 180, 0.10); border: 2px solid; border-image: linear-gradient(90deg, #2563eb 0%, #a21caf 100%) 1; padding: 40px 8vw 32px 8vw; max-width: 98vw;">
          <div style="text-align: center; margin-bottom: 18px;">
            <span style="display: inline-block; background: linear-gradient(90deg, #2563eb 0%, #a21caf 100%); border-radius: 50%; padding: 22px; box-shadow: 0 2px 16px #a21caf22;">
              <svg width="64" height="64" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block; margin:auto;">
                <circle cx="20" cy="20" r="18" fill="url(#gradient1)" />
                <circle cx="12" cy="12" r="3" fill="#ffffff" opacity="0.9" />
                <circle cx="28" cy="12" r="3" fill="#ffffff" opacity="0.9" />
                <circle cx="20" cy="20" r="3" fill="#ffffff" opacity="0.9" />
                <circle cx="12" cy="28" r="3" fill="#ffffff" opacity="0.9" />
                <circle cx="28" cy="28" r="3" fill="#ffffff" opacity="0.9" />
                <line x1="12" y1="12" x2="20" y2="20" stroke="#ffffff" stroke-width="1.5" opacity="0.7" />
                <line x1="28" y1="12" x2="20" y2="20" stroke="#ffffff" stroke-width="1.5" opacity="0.7" />
                <line x1="20" y1="20" x2="12" y2="28" stroke="#ffffff" stroke-width="1.5" opacity="0.7" />
                <line x1="20" y1="20" x2="28" y2="28" stroke="#ffffff" stroke-width="1.5" opacity="0.7" />
                <line x1="12" y1="12" x2="28" y2="12" stroke="#ffffff" stroke-width="1" opacity="0.5" />
                <line x1="12" y1="28" x2="28" y2="28" stroke="#ffffff" stroke-width="1" opacity="0.5" />
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#3b82f6" />
                    <stop offset="50%" stop-color="#8b5cf6" />
                    <stop offset="100%" stop-color="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </div>
          <div style="text-align: center; color: #6366f1; font-size: 1.05rem; font-weight: 500; margin-bottom: 10px;">
            The AI Platform for Professionals
          </div>
          <h1 style="color: #1e293b; font-size: 2rem; font-weight: 900; margin-bottom: 6px; text-align: center; letter-spacing: -1px;">BarathAI Error Alert</h1>
          <hr style="border: none; border-top: 1.5px solid #f3e8ff; margin: 18px 0 24px 0;" />
          <p style="color: #334155; font-size: 1.13rem; text-align: center; margin-bottom: 24px;">
            <strong style="color: #dc2626;">${errorTitle}</strong>
          </p>
          <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 18px; font-size: 1.04rem; color: #475569; font-family: 'JetBrains Mono', 'Fira Mono', 'Menlo', monospace;">
            <strong>Full Error Details:</strong>
            <pre style="white-space: pre-wrap; word-break: break-all; margin: 0; color: #334155; font-size: 1.01rem;">${errorDetails}</pre>
          </div>
          <div style="color: #64748b; font-size: 1rem; text-align: right; margin-bottom: 8px;">
            <span>Time: ${new Date().toLocaleString()}</span>
          </div>
          <div style="margin-top: 32px; text-align: center;">
            <a href="https://your-barathai-dashboard.com" style="display: inline-block; background: linear-gradient(90deg, #2563eb 0%, #a21caf 100%); color: #fff; font-weight: 700; padding: 14px 38px; border-radius: 10px; text-decoration: none; font-size: 1.08rem; box-shadow: 0 2px 12px #a21caf22; letter-spacing: 0.01em; transition: background 0.2s;">Open BarathAI Dashboard</a>
          </div>
        </div>
        <div style="text-align: center; color: #a1a1aa; font-size: 0.97rem; margin-top: 32px; letter-spacing: 0.01em;">
          &copy; ${new Date().getFullYear()} <span style="color: #a21caf; font-weight: 700;">BarathAI</span>. All rights reserved.<br/>
          <span style="font-size: 0.93rem; color: #64748b;">
            This is an automated system notification from BarathAI.<br/>
            For questions, contact your administrator or BarathAI support.
          </span>
        </div>
      </div>
    `,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log('Error alert email sent!');
  } catch (err) {
    console.error('Failed to send error alert email:', err);
  }
} 