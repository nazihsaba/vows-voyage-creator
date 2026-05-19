import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Payload {
  wedding_id: string;
  invitation_link_id: string;
  wishes_message?: string;
  responses: { name: string; is_attending: boolean }[];
  number_of_persons?: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = (await req.json()) as Payload;
    if (!body?.wedding_id || !Array.isArray(body.responses)) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Get wedding + owner email
    const { data: wedding } = await supabase
      .from("weddings")
      .select("id, user_id, groom_name, bride_name, notification_email")
      .eq("id", body.wedding_id)
      .maybeSingle();

    if (!wedding) {
      return new Response(JSON.stringify({ error: "Wedding not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let recipientEmail = (wedding.notification_email || "").trim();

    if (!recipientEmail) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", wedding.user_id)
        .maybeSingle();
      recipientEmail = profile?.email || "";
    }

    if (!recipientEmail) {
      return new Response(JSON.stringify({ ok: true, skipped: "no recipient email" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const attending = body.responses.filter((r) => r.is_attending);
    const notAttending = body.responses.filter((r) => !r.is_attending);
    const guestCount = body.number_of_persons ?? attending.length;
    const couple = `${wedding.groom_name} & ${wedding.bride_name}`;

    const escape = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const listHtml = (items: { name: string; is_attending: boolean }[]) =>
      items.map((r) => `<li style="margin:4px 0;">${escape(r.name)}</li>`).join("");

    const wishesBlock = body.wishes_message?.trim()
      ? `<div style="margin-top:24px;padding:16px;background:#faf6ef;border-left:3px solid #865814;border-radius:4px;">
           <p style="margin:0 0 8px;font-weight:600;color:#865814;">Love &amp; Wishes</p>
           <p style="margin:0;white-space:pre-wrap;color:#3e2723;">${escape(body.wishes_message.trim())}</p>
         </div>`
      : "";

    const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;background:#ffffff;color:#1a1a1a;padding:24px;">
      <div style="max-width:560px;margin:0 auto;">
        <h2 style="color:#865814;margin:0 0 8px;">New RSVP Received</h2>
        <p style="margin:0 0 16px;color:#555;">For <strong>${escape(couple)}</strong></p>
        ${attending.length ? `<p style="margin:16px 0 4px;font-weight:600;">Attending (${guestCount}):</p><ul style="margin:0;padding-left:20px;">${listHtml(attending)}</ul>` : ""}
        ${notAttending.length ? `<p style="margin:16px 0 4px;font-weight:600;color:#a33;">Not Attending:</p><ul style="margin:0;padding-left:20px;">${listHtml(notAttending)}</ul>` : ""}
        ${wishesBlock}
        <p style="margin-top:32px;font-size:12px;color:#888;">Auréa Invites</p>
      </div>
    </body></html>`;

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Auréa Invites <notify@aureainvites.com>",
        to: [recipientEmail],
        subject: `New RSVP — ${couple}`,
        html,
      }),
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      console.error("Resend error:", errText);
      return new Response(JSON.stringify({ error: "Email send failed", detail: errText }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("rsvp-notification error:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
