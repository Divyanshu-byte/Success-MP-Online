export interface AnnouncementEmailParams {
  customerName: string;
  title: string;
  message: string;
  actionUrl?: string;
  supportPhone?: string;
  supportEmail?: string;
}

export function generateAnnouncementEmailHtml(params: AnnouncementEmailParams): string {
  const {
    customerName,
    title,
    message,
    actionUrl,
    supportPhone = "7415921990",
    supportEmail = "support@successmponline.in",
  } = params;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title} - Success MP Online</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .logo-badge { display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; background: rgba(255,255,255,0.15); border-radius: 12px; margin-bottom: 12px; font-size: 24px; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0 0; color: #93c5fd; font-size: 13px; }
    .content { padding: 32px 24px; }
    .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 16px; }
    .announcement-title { font-size: 20px; font-weight: 800; color: #1e3a8a; margin-bottom: 12px; }
    .message { font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 24px; }
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
      <div class="greeting">Hello ${customerName},</div>
      <div class="announcement-title">${title}</div>
      <div class="message">${message}</div>
      
      ${
        actionUrl
          ? `<div class="btn-container"><a href="${actionUrl}" class="btn">View Update</a></div>`
          : ""
      }

      <p class="message" style="font-size: 13px; color: #64748b;">
        Questions? Reach us at <a href="mailto:${supportEmail}">${supportEmail}</a> or call <strong>+91 ${supportPhone}</strong>.
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
