export interface WelcomeEmailParams {
  customerName: string;
  dashboardUrl: string;
  supportPhone?: string;
  supportEmail?: string;
}

export function generateWelcomeEmailHtml(params: WelcomeEmailParams): string {
  const {
    customerName,
    dashboardUrl,
    supportPhone = "7415921990",
    supportEmail = "support@successmponline.in",
  } = params;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Welcome to Success MP Online</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .logo-badge { display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; background: rgba(255,255,255,0.15); border-radius: 12px; margin-bottom: 12px; font-size: 24px; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0 0; color: #93c5fd; font-size: 13px; }
    .content { padding: 32px 24px; }
    .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 16px; }
    .message { font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 24px; }
    .features-list { background-color: #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 28px; }
    .feature-item { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; font-size: 14px; color: #334155; }
    .feature-item:last-child { margin-bottom: 0; }
    .feature-icon { font-size: 18px; }
    .btn-container { text-align: center; margin: 32px 0; }
    .btn { display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 14px rgba(37,99,235,0.3); }
    .footer { background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-badge">🛡️</div>
      <h1>Success MP Online</h1>
      <p>Government & Citizen Digital Services Portal</p>
    </div>
    <div class="content">
      <div class="greeting">🎉 Welcome, ${customerName}!</div>
      <div class="message">
        We're thrilled to have you join <strong>Success MP Online</strong>. You can now apply for government services, track application progress in real-time, receive instant notifications, and securely access your completed documents.
      </div>
      
      <div class="features-list">
        <div class="feature-item">
          <span class="feature-icon">📄</span>
          <div><strong>Easy Applications:</strong> Apply for PAN Card, Gumasta License, MSME Registration & more online.</div>
        </div>
        <div class="feature-item">
          <span class="feature-icon">🔔</span>
          <div><strong>Instant Notifications:</strong> Get real-time status updates via in-app alerts and emails.</div>
        </div>
        <div class="feature-item">
          <span class="feature-icon">🔒</span>
          <div><strong>Secure Vault:</strong> Access and download your official certificates and documents anytime.</div>
        </div>
      </div>

      <div class="btn-container">
        <a href="${dashboardUrl}" class="btn">Explore Success MP Online</a>
      </div>

      <p class="message" style="font-size: 13px; color: #64748b;">
        Need help? Contact support at <a href="mailto:${supportEmail}">${supportEmail}</a> or call <strong>+91 ${supportPhone}</strong>.
      </p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Success MP Online. All rights reserved.
    </div>
  </div>
</body>
</html>
  `;
}

export function generateWelcomeEmailText(params: WelcomeEmailParams): string {
  return `
Welcome to Success MP Online, ${params.customerName}!

We're happy to have you here. You can now apply for available services, track your applications, receive important updates, and securely access your documents.

Explore your dashboard:
${params.dashboardUrl}

Support Contact:
Email: ${params.supportEmail || "support@successmponline.in"}
Phone: +91 ${params.supportPhone || "7415921990"}

Thank you,
Success MP Online Team
  `.trim();
}
