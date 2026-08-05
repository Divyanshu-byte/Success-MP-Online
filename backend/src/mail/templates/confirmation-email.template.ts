export interface ConfirmationEmailParams {
  applicantName: string;
  applicationNo: string;
  serviceName: string;
  submissionDate: string;
  status: string;
  trackUrl: string;
  supportPhone?: string;
  supportEmail?: string;
}

export function generateConfirmationEmailHtml(params: ConfirmationEmailParams): string {
  const {
    applicantName,
    applicationNo,
    serviceName,
    submissionDate,
    status,
    trackUrl,
    supportPhone = "7415921990",
    supportEmail = "support@successmponline.in",
  } = params;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Submitted Successfully - Success MP Online</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      color: #1e293b;
    }
    .wrapper {
      width: 100%;
      background-color: #f1f5f9;
      padding: 30px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
      padding: 32px 36px 28px;
      text-align: left;
      position: relative;
    }
    .header-accent {
      height: 4px;
      background: linear-gradient(90deg, #f59e0b 0%, #3b82f6 50%, #10b981 100%);
    }
    .brand-badge {
      display: inline-block;
      background-color: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: 20px;
      padding: 4px 12px;
      font-size: 11px;
      font-weight: 600;
      color: #93c5fd;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 10px;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 800;
      color: #ffffff;
      margin: 0;
      letter-spacing: -0.5px;
    }
    .brand-subtitle {
      font-size: 13px;
      color: #cbd5e1;
      margin-top: 4px;
    }
    .content {
      padding: 36px;
    }
    .status-banner {
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
      border: 1px solid #a7f3d0;
      border-radius: 12px;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      margin-bottom: 28px;
    }
    .status-icon-circle {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background-color: #10b981;
      color: #ffffff;
      font-size: 22px;
      line-height: 42px;
      text-align: center;
      font-weight: bold;
      margin-right: 16px;
      flex-shrink: 0;
    }
    .status-title {
      font-size: 16px;
      font-weight: 700;
      color: #065f46;
      margin: 0;
    }
    .status-sub {
      font-size: 13px;
      color: #047857;
      margin-top: 2px;
    }
    .greeting {
      font-size: 16px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 12px;
    }
    .body-text {
      font-size: 14px;
      line-height: 1.6;
      color: #475569;
      margin-bottom: 24px;
    }
    .details-card {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 28px;
    }
    .details-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #64748b;
      margin-bottom: 16px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 8px;
    }
    .detail-row {
      padding: 8px 0;
      border-bottom: 1px dashed #e2e8f0;
    }
    .detail-label {
      font-size: 13px;
      color: #64748b;
      font-weight: 500;
    }
    .detail-value {
      font-size: 14px;
      color: #0f172a;
      font-weight: 600;
      text-align: right;
    }
    .app-id-badge {
      display: inline-block;
      background-color: #eff6ff;
      border: 1.5px solid #3b82f6;
      color: #1d4ed8;
      font-family: 'Courier New', Courier, monospace;
      font-size: 16px;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 8px;
      letter-spacing: 1px;
    }
    .status-pill {
      display: inline-block;
      background-color: #dcfce7;
      color: #15803d;
      font-size: 12px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .cta-container {
      text-align: center;
      margin: 32px 0;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: #ffffff !important;
      font-size: 15px;
      font-weight: 700;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }
    .security-notice {
      background-color: #fffbe6;
      border: 1px solid #ffe58f;
      border-left: 4px solid #f59e0b;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 28px;
    }
    .security-notice-title {
      font-size: 13px;
      font-weight: 700;
      color: #b45309;
      margin: 0 0 4px;
    }
    .security-notice-text {
      font-size: 12px;
      line-height: 1.5;
      color: #78350f;
      margin: 0;
    }
    .support-card {
      background-color: #f1f5f9;
      border-radius: 10px;
      padding: 18px 20px;
      margin-bottom: 24px;
    }
    .support-title {
      font-size: 13px;
      font-weight: 700;
      color: #334155;
      margin: 0 0 8px;
    }
    .support-item {
      font-size: 13px;
      color: #475569;
      margin: 4px 0;
    }
    .footer {
      background-color: #0f172a;
      padding: 28px 36px;
      text-align: center;
      color: #94a3b8;
      font-size: 12px;
      line-height: 1.6;
    }
    .footer-disclaimer {
      font-size: 11px;
      color: #64748b;
      margin-bottom: 16px;
      font-style: italic;
    }
    .footer-copy {
      margin-top: 16px;
      font-size: 11px;
      color: #475569;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header-accent"></div>
      <div class="header">
        <div class="brand-badge">Official Confirmation</div>
        <h1 class="brand-title">Success MP Online</h1>
        <div class="brand-subtitle">Citizen Services Facilitation Portal — Madhya Pradesh</div>
      </div>

      <div class="content">
        <div class="status-banner">
          <div class="status-icon-circle">✓</div>
          <div>
            <h2 class="status-title">Application Submitted Successfully</h2>
            <p class="status-sub">Your application is saved and queued for official processing.</p>
          </div>
        </div>

        <div class="greeting">Dear ${applicantName},</div>
        <p class="body-text">
          Thank you for choosing <strong>Success MP Online</strong>. Your application for <strong>${serviceName}</strong> has been successfully received, registered, and verified in our portal system.
        </p>

        <div class="details-card">
          <div class="details-title">Application Summary</div>
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td class="detail-label" style="padding: 8px 0; border-bottom: 1px dashed #e2e8f0;">Application ID</td>
              <td class="detail-value" style="padding: 8px 0; border-bottom: 1px dashed #e2e8f0;">
                <span class="app-id-badge">${applicationNo}</span>
              </td>
            </tr>
            <tr>
              <td class="detail-label" style="padding: 8px 0; border-bottom: 1px dashed #e2e8f0;">Service Name</td>
              <td class="detail-value" style="padding: 8px 0; border-bottom: 1px dashed #e2e8f0;">${serviceName}</td>
            </tr>
            <tr>
              <td class="detail-label" style="padding: 8px 0; border-bottom: 1px dashed #e2e8f0;">Submission Date & Time</td>
              <td class="detail-value" style="padding: 8px 0; border-bottom: 1px dashed #e2e8f0;">${submissionDate}</td>
            </tr>
            <tr>
              <td class="detail-label" style="padding: 8px 0;">Current Status</td>
              <td class="detail-value" style="padding: 8px 0;">
                <span class="status-pill">${status}</span>
              </td>
            </tr>
          </table>
        </div>

        <div class="security-notice">
          <div class="security-notice-title">
            🛡️ Important Security Notice
          </div>
          <p class="security-notice-text">
            Please keep your <strong>Application ID (${applicationNo})</strong> safe. You will need it to track your application status, download official receipts, or request support. Never share your account passwords or personal security pins with anyone.
          </p>
        </div>

        <div class="cta-container">
          <a href="${trackUrl}" class="cta-button" target="_blank">Track Application Status &rarr;</a>
        </div>

        <div class="support-card">
          <div class="support-title">Need Help or Have Questions?</div>
          <div class="support-item">📞 <strong>Support Phone:</strong> <a href="tel:${supportPhone}" style="color: #2563eb; text-decoration: none; font-weight: 700;">${supportPhone}</a></div>
          <div class="support-item">✉️ <strong>Email Helpdesk:</strong> <a href="mailto:${supportEmail}" style="color: #2563eb; text-decoration: none;">${supportEmail}</a></div>
          <div class="support-item">🕒 <strong>Operating Hours:</strong> Monday – Saturday (9:00 AM – 7:00 PM IST)</div>
        </div>
      </div>

      <div class="footer">
        <div class="footer-disclaimer">
          Disclaimer: Success MP Online is a dedicated citizen service facilitation portal. This confirmation email was automatically dispatched upon your successful application submission. Please do not reply directly to this automated email.
        </div>
        <div class="footer-copy">
          &copy; 2026 Success MP Online. All rights reserved. | Madhya Pradesh Citizen Portal Services
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export function generateConfirmationEmailText(params: ConfirmationEmailParams): string {
  const {
    applicantName,
    applicationNo,
    serviceName,
    submissionDate,
    status,
    trackUrl,
    supportPhone = "7415921990",
    supportEmail = "support@successmponline.in",
  } = params;

  return `=====================================================
SUCCESS MP ONLINE - APPLICATION SUBMITTED SUCCESSFULLY
=====================================================

Dear ${applicantName},

Thank you for choosing Success MP Online. Your application for ${serviceName} has been successfully received and registered.

APPLICATION DETAILS:
-----------------------------------------------------
• Application ID: ${applicationNo}
• Service Name:   ${serviceName}
• Date & Time:    ${submissionDate}
• Current Status: ${status}
-----------------------------------------------------

IMPORTANT SECURITY NOTICE:
Please keep your Application ID (${applicationNo}) safe. You will need it for tracking, official receipts, and support inquiries.

TRACK YOUR APPLICATION:
You can view your application status anytime at:
${trackUrl}

HELPDESK & SUPPORT:
• Support Phone: ${supportPhone}
• Support Email: ${supportEmail}
• Hours: Monday - Saturday (9:00 AM - 7:00 PM IST)

-----------------------------------------------------
Success MP Online - Citizen Services Facilitation Portal, Madhya Pradesh
© 2026 Success MP Online. All rights reserved.
`;
}
