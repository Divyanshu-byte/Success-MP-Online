import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const supabase = createClient(supabaseUrl, serviceRoleKey);

interface ApplicationRow {
  id: string;
  service_type: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  details: Record<string, string>;
  amount: number;
  payment_status: string;
  payment_id: string | null;
  status: string;
  created_at: string;
}

const SERVICE_NAMES: Record<string, string> = {
  pan_card: "PAN Card Application",
  gumasta_license: "Gumasta License",
  msme_registration: "MSME / Udyam Registration",
};

function formatAppId(uuid: string): string {
  return `SUC-${uuid.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

function buildReceiptHtml(app: ApplicationRow): string {
  const serviceName = SERVICE_NAMES[app.service_type] ?? app.service_type;
  const detailsRows = Object.entries(app.details)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#6b7280;font-size:12px;text-transform:capitalize">${k.replace(/([A-Z])/g, " $1")}</td><td style="padding:4px 0;font-size:13px;color:#1f2937;font-weight:500">${String(v ?? "-")}</td></tr>`,
    )
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:Arial,Helvetica,sans-serif;margin:0;padding:24px;background:#f8fafc">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">
    <div style="background:#0d47a1;color:#fff;padding:24px 32px">
      <div style="font-size:20px;font-weight:bold">Success MP Online</div>
      <div style="font-size:12px;opacity:0.85;margin-top:2px">Government Services Portal — Payment Receipt</div>
    </div>
    <div style="padding:32px">
      <div style="font-size:18px;font-weight:bold;text-align:center;color:#1f2937;margin-bottom:20px">PAYMENT RECEIPT</div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
        <tr><td style="padding:6px 0;color:#6b7280;font-size:12px">APPLICATION ID</td><td style="padding:6px 0;text-align:right;font-size:14px;font-weight:bold;color:#1f2937">${formatAppId(app.id)}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:12px">DATE</td><td style="padding:6px 0;text-align:right;font-size:14px;color:#1f2937">${new Date(app.created_at).toLocaleString("en-IN")}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:12px">SERVICE</td><td style="padding:6px 0;text-align:right;font-size:14px;color:#1f2937">${serviceName}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:12px">APPLICANT</td><td style="padding:6px 0;text-align:right;font-size:14px;color:#1f2937">${app.applicant_name}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:12px">EMAIL</td><td style="padding:6px 0;text-align:right;font-size:14px;color:#1f2937">${app.applicant_email}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:12px">PHONE</td><td style="padding:6px 0;text-align:right;font-size:14px;color:#1f2937">${app.applicant_phone}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:12px">PAYMENT REF</td><td style="padding:6px 0;text-align:right;font-size:14px;color:#1f2937">${app.payment_id ?? "N/A"}</td></tr>
      </table>
      <div style="border-top:1px solid #e2e8f0;margin:16px 0"></div>
      <div style="font-size:12px;color:#6b7280;font-weight:bold;margin-bottom:8px">SUBMITTED DETAILS</div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px">${detailsRows}</table>
      <div style="background:#f0f7ff;border:1.5px solid #0d47a1;border-radius:8px;padding:16px;display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-size:11px;font-weight:bold;color:#0d47a1">AMOUNT PAID</div>
          <div style="font-size:24px;font-weight:bold;color:#0d47a1">Rs. ${Number(app.amount).toLocaleString("en-IN")}/-</div>
        </div>
        <div style="border:3px solid #1a8f5a;color:#1a8f5a;border-radius:50%;width:80px;height:80px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;transform:rotate(-12deg)">
          <div style="font-size:16px;font-weight:bold">PAID</div>
          <div style="font-size:7px">Success MP Online</div>
        </div>
      </div>
    </div>
    <div style="border-top:1px solid #e2e8f0;padding:16px 32px;text-align:center">
      <div style="font-size:10px;color:#9ca3af">This is a computer-generated receipt and does not require a physical signature.</div>
      <div style="font-size:10px;color:#9ca3af;margin-top:4px">Success MP Online | support@successmponline.in | +91 90000 00000</div>
    </div>
  </div>
</body></html>`;
}

async function sendEmailWithAttachment(to: string, subject: string, htmlBody: string, receiptHtml: string) {
  // Use SMTP2GO or similar via Deno native fetch to an email API.
  // Here we use the Resend API (or any SMTP relay) configured via RESEND_API_KEY secret.
  const apiKey = Deno.env.get("RESEND_API_KEY");

  if (apiKey) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Success MP Online <noreply@successmponline.in>",
        to,
        subject,
        html: htmlBody,
        attachments: [
          {
            filename: `${subject.split(":")[1]?.trim() ?? "receipt"}.html`,
            content: btoa(receiptHtml),
          },
        ],
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Email API error: ${res.status} ${text}`);
    }
    return;
  }

  // Fallback: log the email content (no SMTP credentials configured)
  console.log(`[EMAIL] To: ${to} | Subject: ${subject}`);
  console.log(`[EMAIL] Body length: ${htmlBody.length}`);
  console.log(`[EMAIL] Receipt attachment length: ${receiptHtml.length}`);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { applicationId } = await req.json();

    if (!applicationId) {
      return new Response(
        JSON.stringify({ error: "applicationId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .eq("id", applicationId)
      .single();

    if (error || !data) {
      return new Response(
        JSON.stringify({ error: "Application not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const app = data as ApplicationRow;
    const receiptHtml = buildReceiptHtml(app);
    const appId = formatAppId(app.id);
    const subject = `Receipt for ${SERVICE_NAMES[app.service_type] ?? app.service_type} — ${appId}`;

    const emailHtml = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#0d47a1">Payment Successful!</h2>
        <p>Dear ${app.applicant_name},</p>
        <p>Your application for <strong>${SERVICE_NAMES[app.service_type] ?? app.service_type}</strong> has been submitted successfully. Your Application ID is <strong>${appId}</strong>.</p>
        <p>Please find your payment receipt attached to this email.</p>
        <div style="background:#f0f7ff;border:1px solid #0d47a1;border-radius:8px;padding:16px;margin:16px 0">
          <strong>Amount Paid:</strong> Rs. ${Number(app.amount).toLocaleString("en-IN")}/-<br>
          <strong>Payment Ref:</strong> ${app.payment_id ?? "N/A"}<br>
          <strong>Date:</strong> ${new Date(app.created_at).toLocaleString("en-IN")}
        </div>
        <p>For any queries, contact us at support@successmponline.in or chat with us on WhatsApp.</p>
        <p style="color:#6b7280;font-size:12px;margin-top:24px">Success MP Online | Government Services Portal</p>
      </div>`;

    await sendEmailWithAttachment(app.applicant_email, subject, emailHtml, receiptHtml);

    return new Response(
      JSON.stringify({ success: true, message: `Receipt email sent to ${app.applicant_email}` }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
