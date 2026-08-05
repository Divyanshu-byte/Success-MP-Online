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

const SERVICE_NAMES: Record<string, string> = {
  pan_card: "PAN Card Application",
  gumasta_license: "Gumasta License",
  msme_registration: "MSME / Udyam Registration",
};

// Knowledge base for the AI assistant — used as system prompt context
const SERVICE_KB = `
Success MP Online — Service Knowledge Base

1. PAN Card Application (Fee: Rs. 150)
   Documents required: Aadhaar card, proof of address, passport-size photo, date of birth proof.
   Processing time: 15-20 working days.
   Types: New PAN or Correction in existing PAN.

2. Gumasta License (Fee: Rs. 599)
   Documents required: Owner's ID proof, address proof of shop, rent agreement (if rented), GSTIN (if applicable), employee details, nature of business.
   Processing time: 7-10 working days. Mandatory for operating commercial establishments in MP.

3. MSME / Udyam Registration (Fee: Rs. 199)
   Documents required: Aadhaar of applicant, PAN, bank account details, business address, investment and turnover details.
   Processing time: 1-3 working days. Provides URN and government-recognised MSME / Udyam certificate.
   For micro/small/medium enterprises. Enables subsidies, lower interest loans, and government scheme benefits.

General: Users can check application status by providing their Application ID (format SUC-XXXXXXXX).
Support email: support@successmponline.in
WhatsApp support: +91 90000 00000
`;

interface WhatsAppMessage {
  from: string;
  body: string;
}

async function getLlmResponse(userMessage: string, fromNumber: string): Promise<string> {
  // Check if user is asking about application status
  const statusMatch = userMessage.match(/SUC-[A-Z0-9]{8}/i);

  if (statusMatch) {
    const appId = statusMatch[0];
    // Look up application in database
    const { data } = await supabase
      .from("applications")
      .select("*")
      .ilike("id", `%${appId.replace("SUC-", "").toLowerCase()}%`)
      .limit(1);

    if (data && data.length > 0) {
      const app = data[0];
      return `Your application ${appId} for ${SERVICE_NAMES[app.service_type] ?? app.service_type}:
- Status: ${app.status.replace("_", " ")}
- Payment: ${app.payment_status}
- Amount: Rs. ${Number(app.amount).toLocaleString("en-IN")}
- Applied on: ${new Date(app.created_at).toLocaleDateString("en-IN")}

For further assistance, contact support@successmponline.in`;
    }
    return `I couldn't find an application with ID ${appId}. Please double-check the ID or contact support@successmponline.in for help.`;
  }

  // Use OpenAI GPT for general queries
  const openaiKey = Deno.env.get("OPENAI_API_KEY");

  if (openaiKey) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an AI customer support assistant for "Success MP Online", a government services portal in Madhya Pradesh, India. You help users with queries about PAN Card, Gumasta License, and MSME / Udyam Registration services. Be concise, helpful, and professional. Answer based on this knowledge base:\n\n${SERVICE_KB}\n\nIf a user asks about their application status, ask them for their Application ID (format SUC-XXXXXXXX). If they provide one, I will look it up separately. Keep responses under 150 words.`,
          },
          { role: "user", content: userMessage },
        ],
        max_tokens: 250,
        temperature: 0.7,
      }),
    });

    if (res.ok) {
      const json = await res.json();
      return json.choices?.[0]?.message?.content ?? "I'm sorry, I couldn't process your request right now.";
    }
  }

  // Fallback: keyword-based responses when no LLM key configured
  const lower = userMessage.toLowerCase();
  if (lower.includes("pan")) {
    return `PAN Card Application (Rs. 150): Documents needed — Aadhaar, address proof, photo, DOB proof. Processing: 15-20 working days. Apply at successmponline.in after login.`;
  }
  if (lower.includes("udyam") || lower.includes("msme")) {
    return `MSME / Udyam Registration (Rs. 199): Documents needed — Aadhaar, PAN, bank details, business address, investment & turnover details. Processing: 1-3 working days. Apply at successmponline.in.`;
  }
  if (lower.includes("gumasta") || lower.includes("shop")) {
    return `Gumasta License (Rs. 599): Documents needed — Owner ID, shop address proof, rent agreement (if rented), GSTIN, employee count, business nature. Processing: 7-10 working days.`;
  }
  if (lower.includes("status")) {
    return `Please share your Application ID (format SUC-XXXXXXXX) and I'll check the status for you.`;
  }
  if (lower.includes("price") || lower.includes("fee") || lower.includes("cost")) {
    return `Our service fees:\n- PAN Card: Rs. 150\n- MSME / Udyam Registration: Rs. 199\n- Gumasta License: Rs. 599`;
  }
  return `Hello! I'm the Success MP Online assistant. I can help with:\n- PAN Card (Rs. 150)\n- MSME / Udyam Registration (Rs. 199)\n- Gumasta License (Rs. 599)\n\nAsk me about documents required, pricing, or your application status.`;
}

async function sendWhatsAppMessage(to: string, message: string): Promise<boolean> {
  const token = Deno.env.get("WHATSAPP_TOKEN");
  const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");

  if (!token || !phoneNumberId) {
    console.log(`[WHATSAPP] To: ${to} | Message: ${message}`);
    return false;
  }

  const res = await fetch(
    `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: message },
      }),
    },
  );

  return res.ok;
}

async function verifyWebhookToken(token: string | null): Promise<boolean> {
  const verifyToken = Deno.env.get("WHATSAPP_VERIFY_TOKEN") ?? "success_mp_verify";
  return token === verifyToken;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const url = new URL(req.url);

  // Meta WhatsApp webhook verification (GET)
  if (req.method === "GET") {
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    if (mode === "subscribe" && (await verifyWebhookToken(token))) {
      return new Response(challenge ?? "", { status: 200, headers: corsHeaders });
    }
    return new Response("Forbidden", { status: 403, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const payload = await req.json();

    // Meta WhatsApp Cloud API webhook payload structure
    const entry = payload?.entry?.[0];
    const change = entry?.changes?.[0];
    const messageData = change?.value?.messages?.[0];

    if (!messageData) {
      // Not a message event (could be status update) — acknowledge
      return new Response(JSON.stringify({ status: "ok" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fromNumber = messageData.from;
    const textBody = messageData.text?.body ?? "";

    if (!textBody) {
      return new Response(JSON.stringify({ status: "ok" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get AI response and send back via WhatsApp
    const aiResponse = await getLlmResponse(textBody, fromNumber);
    await sendWhatsAppMessage(fromNumber, aiResponse);

    return new Response(JSON.stringify({ status: "ok", sent: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
