import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Physical cards consultation booking.
 *
 *   POST { action: "availability" }  -> free 30-minute slots
 *   POST { action: "book", start, name, email, phone?, meeting_type, notes? }
 *
 * Free times come from the owner's Google Calendar (Lovable Google Calendar
 * connector). A booking is saved in public.bookings, added to Google Calendar
 * (with a Google Meet link when chosen) and confirmed by email (Gmail connector).
 */

// ---------- Booking rules (change these to change the calendar) ----------
const TIME_ZONE = "Asia/Beirut";
const BOOKABLE_WEEKDAYS = [1, 2, 3, 4, 5]; // Monday–Friday (0 = Sunday)
const SLOT_TIMES = ["18:00", "18:30", "19:00", "19:30"]; // 6–8 PM, Beirut time
const SLOT_MINUTES = 30;
const MIN_NOTICE_HOURS = 72; // at least 3 days ahead
const BOOKING_WINDOW_DAYS = 45; // how far ahead customers can book

// ---------- Connections ----------
const CALENDAR_BASE =
  Deno.env.get("GOOGLE_CALENDAR_GATEWAY_URL") ??
  "https://connector-gateway.lovable.dev/google_calendar/calendar/v3";
const CALENDAR_ID = Deno.env.get("BOOKING_CALENDAR_ID") ?? "primary";
const GMAIL_SEND_URL = "https://connector-gateway.lovable.dev/google_mail/gmail/v1/users/me/messages/send";
const AUREA_EMAIL = "aaureainvites@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// ---------- Time zone helpers (no libraries; handles summer time) ----------
const partsFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

function zoneParts(date: Date) {
  const p: Record<string, number> = {};
  for (const { type, value } of partsFmt.formatToParts(date)) {
    if (type !== "literal") p[type] = Number(value);
  }
  return p as { year: number; month: number; day: number; hour: number; minute: number; second: number };
}

/** Milliseconds the time zone is ahead of UTC at this moment. */
function zoneOffsetMs(date: Date) {
  const p = zoneParts(date);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

/** A wall-clock time in TIME_ZONE -> the real moment (UTC). */
function zonedToUtc(year: number, month: number, day: number, hour: number, minute: number) {
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  let result = guess - zoneOffsetMs(new Date(guess));
  const corrected = guess - zoneOffsetMs(new Date(result));
  if (corrected !== result) result = corrected;
  return new Date(result);
}

/** Every bookable slot start, ignoring the calendar (only the rules above). */
function candidateSlots(now = new Date()) {
  const earliest = now.getTime() + MIN_NOTICE_HOURS * 3600_000;
  const today = zoneParts(now);
  const slots: Date[] = [];
  for (let i = 0; i <= BOOKING_WINDOW_DAYS; i++) {
    const d = new Date(Date.UTC(today.year, today.month - 1, today.day + i));
    if (!BOOKABLE_WEEKDAYS.includes(d.getUTCDay())) continue;
    for (const t of SLOT_TIMES) {
      const [h, m] = t.split(":").map(Number);
      const start = zonedToUtc(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), h, m);
      if (start.getTime() >= earliest) slots.push(start);
    }
  }
  return slots;
}

const slotEnd = (start: Date) => new Date(start.getTime() + SLOT_MINUTES * 60_000);

// ---------- Connector calls ----------
function connectorKeys() {
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const calendarKey = Deno.env.get("GOOGLE_CALENDAR_API_KEY");
  if (!lovableKey || !calendarKey) throw new Error("Google Calendar connector not configured");
  return { lovableKey, calendarKey };
}

async function calendarFetch(path: string, init: RequestInit = {}) {
  const { lovableKey, calendarKey } = connectorKeys();
  const res = await fetch(`${CALENDAR_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": calendarKey,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const detail = await res.text();
    console.error(`Google Calendar ${path} failed (${res.status}):`, detail);
    throw new Error(`Google Calendar error ${res.status}`);
  }
  return res.json();
}

async function busyTimes(from: Date, to: Date) {
  const data = await calendarFetch("/freeBusy", {
    method: "POST",
    body: JSON.stringify({
      timeMin: from.toISOString(),
      timeMax: to.toISOString(),
      timeZone: TIME_ZONE,
      items: [{ id: CALENDAR_ID }],
    }),
  });
  const cal = data?.calendars?.[CALENDAR_ID] ?? Object.values(data?.calendars ?? {})[0];
  if (cal?.errors?.length) throw new Error(`Google Calendar busy check failed: ${JSON.stringify(cal.errors)}`);
  return ((cal?.busy ?? []) as { start: string; end: string }[]).map((b) => ({
    start: new Date(b.start).getTime(),
    end: new Date(b.end).getTime(),
  }));
}

const overlaps = (start: Date, busy: { start: number; end: number }[]) => {
  const s = start.getTime();
  const e = slotEnd(start).getTime();
  return busy.some((b) => s < b.end && e > b.start);
};

// ---------- Email ----------
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const b64 = (s: string) => btoa(unescape(encodeURIComponent(s)));

function formatWhen(start: Date) {
  const date = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(start);
  const time = (d: Date) =>
    new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, hour: "numeric", minute: "2-digit" }).format(d);
  return { date, time: `${time(start)} – ${time(slotEnd(start))}` };
}

const gcalDate = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

async function sendConfirmationEmail(b: {
  name: string;
  email: string;
  phone: string | null;
  meetingType: "google_meet" | "phone";
  start: Date;
  meetLink: string | null;
}) {
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const gmailKey = Deno.env.get("GOOGLE_MAIL_API_KEY");
  if (!lovableKey || !gmailKey) return false;

  const { date, time } = formatWhen(b.start);
  const howLine =
    b.meetingType === "google_meet"
      ? b.meetLink
        ? `Join on Google Meet: <a href="${esc(b.meetLink)}" style="color:#865814;">${esc(b.meetLink)}</a>`
        : "We'll send you the Google Meet link before the meeting."
      : `We'll call you on <strong>${esc(b.phone ?? "")}</strong> (phone or WhatsApp).`;
  const addToCalendar =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    `&text=${encodeURIComponent("Auréa Invites — Physical cards consultation")}` +
    `&dates=${gcalDate(b.start)}/${gcalDate(slotEnd(b.start))}` +
    `&details=${encodeURIComponent(b.meetLink ? `Google Meet: ${b.meetLink}` : "We'll call you at this time.")}`;

  const html = `<!doctype html><html><body style="margin:0;background:#faf6f1;font-family:Georgia,'Times New Roman',serif;color:#2b2b2b;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <div style="background:#ffffff;border:1px solid #ead9bf;border-radius:20px;padding:36px 28px;text-align:center;">
      <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#9a8a76;">Auréa Invites</p>
      <h1 style="margin:0 0 6px;font-size:26px;font-weight:bold;color:#2b2b2b;">Your consultation is booked</h1>
      <p style="margin:0 0 24px;font-style:italic;color:#865814;font-size:17px;">Let's design your cards together</p>
      <div style="height:1px;background:linear-gradient(to right,transparent,#d4b483,transparent);margin:0 0 24px;"></div>
      <p style="margin:0 0 18px;font-family:Arial,sans-serif;font-size:15px;line-height:1.6;">Dear ${esc(b.name)},<br/>thank you for booking a physical cards consultation with us.</p>
      <div style="background:#faf6f1;border-radius:14px;padding:18px;margin:0 0 18px;font-family:Arial,sans-serif;">
        <p style="margin:0 0 4px;font-size:16px;font-weight:bold;color:#2b2b2b;">${esc(date)}</p>
        <p style="margin:0 0 10px;font-size:15px;color:#555;">${esc(time)} (Beirut time)</p>
        <p style="margin:0;font-size:14px;color:#555;line-height:1.6;">${howLine}</p>
      </div>
      <a href="${addToCalendar}" style="display:inline-block;background:#b8925a;color:#ffffff;text-decoration:none;font-family:Arial,sans-serif;font-size:14px;padding:12px 24px;border-radius:999px;">Add to my calendar</a>
      <p style="margin:24px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#9a8a76;line-height:1.6;">Need to change the time? Simply reply to this email.</p>
    </div>
  </div>
</body></html>`;

  const subject = `Your Auréa consultation — ${date}`;
  const message = [
    `From: =?UTF-8?B?${b64("Auréa Invites")}?= <${AUREA_EMAIL}>`,
    `To: ${b.email}`,
    `Bcc: ${AUREA_EMAIL}`,
    `Reply-To: ${AUREA_EMAIL}`,
    `Subject: =?UTF-8?B?${b64(subject)}?=`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset="UTF-8"`,
    `Content-Transfer-Encoding: base64`,
    ``,
    b64(html),
  ].join("\r\n");
  const raw = b64(message).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const res = await fetch(GMAIL_SEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": gmailKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw }),
  });
  if (!res.ok) {
    console.error("Booking email failed:", await res.text());
    return false;
  }
  return true;
}

// ---------- Handlers ----------
const supabaseAdmin = () =>
  createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

async function confirmedStarts(supabase: ReturnType<typeof supabaseAdmin>, from: Date, to: Date) {
  const { data, error } = await supabase
    .from("bookings")
    .select("start_time")
    .eq("status", "confirmed")
    .gte("start_time", from.toISOString())
    .lte("start_time", to.toISOString());
  if (error) throw error;
  return new Set((data ?? []).map((r) => new Date(r.start_time).getTime()));
}

async function handleAvailability() {
  const slots = candidateSlots();
  if (!slots.length) return json({ timeZone: TIME_ZONE, slotMinutes: SLOT_MINUTES, slots: [] });

  const from = slots[0];
  const to = slotEnd(slots[slots.length - 1]);
  const [busy, booked] = await Promise.all([busyTimes(from, to), confirmedStarts(supabaseAdmin(), from, to)]);

  const free = slots.filter((s) => !booked.has(s.getTime()) && !overlaps(s, busy)).map((s) => s.toISOString());
  return json({ timeZone: TIME_ZONE, slotMinutes: SLOT_MINUTES, slots: free });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

async function handleBook(body: Record<string, unknown>, authHeader: string | null) {
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const phone = String(body.phone ?? "").trim() || null;
  const notes = String(body.notes ?? "").trim() || null;
  const meetingType = body.meeting_type;
  const start = new Date(String(body.start ?? ""));

  if (!name || name.length > 120) return json({ error: "Please enter your name." }, 400);
  if (!EMAIL_RE.test(email) || email.length > 254) return json({ error: "Please enter a valid email." }, 400);
  if (meetingType !== "google_meet" && meetingType !== "phone") return json({ error: "Please choose a meeting type." }, 400);
  if (meetingType === "phone" && (!phone || phone.replace(/\D/g, "").length < 7))
    return json({ error: "Please enter a phone number we can call." }, 400);
  if (phone && phone.length > 40) return json({ error: "Phone number is too long." }, 400);
  if (notes && notes.length > 1000) return json({ error: "Notes are too long." }, 400);
  if (isNaN(start.getTime()) || !candidateSlots().some((s) => s.getTime() === start.getTime()))
    return json({ error: "This time can't be booked. Please choose another.", code: "invalid_slot" }, 400);

  const end = slotEnd(start);
  const supabase = supabaseAdmin();

  // Who is booking (optional; the page is behind login).
  let userId: string | null = null;
  const token = authHeader?.replace(/^Bearer\s+/i, "");
  if (token) {
    const { data } = await supabase.auth.getUser(token);
    userId = data?.user?.id ?? null;
  }

  // Re-check Google Calendar right before booking.
  if (overlaps(start, await busyTimes(start, end)))
    return json({ error: "Sorry, this time was just taken. Please pick another.", code: "slot_taken" }, 409);

  const { data: row, error: insertError } = await supabase
    .from("bookings")
    .insert({ user_id: userId, name, email, phone, meeting_type: meetingType, notes, start_time: start.toISOString(), end_time: end.toISOString() })
    .select("id")
    .single();
  if (insertError) {
    if (insertError.code === "23505")
      return json({ error: "Sorry, this time was just taken. Please pick another.", code: "slot_taken" }, 409);
    throw insertError;
  }

  // Add to Google Calendar.
  let eventId: string | null = null;
  let meetLink: string | null = null;
  try {
    const description = [
      `Physical cards consultation`,
      ``,
      `Name: ${name}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : null,
      `Meeting: ${meetingType === "google_meet" ? "Google Meet" : "Phone / WhatsApp call"}`,
      notes ? `\nNotes:\n${notes}` : null,
    ]
      .filter((l) => l !== null)
      .join("\n");

    const event = await calendarFetch(
      `/calendars/${encodeURIComponent(CALENDAR_ID)}/events?conferenceDataVersion=1&sendUpdates=none`,
      {
        method: "POST",
        body: JSON.stringify({
          summary: `Auréa consultation — ${name}${meetingType === "phone" ? " (call)" : ""}`,
          description,
          start: { dateTime: start.toISOString(), timeZone: TIME_ZONE },
          end: { dateTime: end.toISOString(), timeZone: TIME_ZONE },
          ...(meetingType === "google_meet"
            ? { conferenceData: { createRequest: { requestId: row.id, conferenceSolutionKey: { type: "hangoutsMeet" } } } }
            : {}),
        }),
      },
    );
    eventId = event?.id ?? null;
    meetLink =
      event?.hangoutLink ??
      event?.conferenceData?.entryPoints?.find((e: { entryPointType: string }) => e.entryPointType === "video")?.uri ??
      null;
  } catch (e) {
    // Couldn't add to the calendar: undo the booking so the slot stays free.
    await supabase.from("bookings").delete().eq("id", row.id);
    throw e;
  }

  await supabase.from("bookings").update({ google_event_id: eventId, meet_link: meetLink }).eq("id", row.id);

  let emailSent = false;
  try {
    emailSent = await sendConfirmationEmail({ name, email, phone, meetingType, start, meetLink });
  } catch (e) {
    console.error("Booking email error:", e);
  }

  return json({
    ok: true,
    booking: { id: row.id, start: start.toISOString(), end: end.toISOString(), meeting_type: meetingType, meet_link: meetLink },
    emailSent,
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    if (body.action === "availability") return await handleAvailability();
    if (body.action === "book") return await handleBook(body, req.headers.get("authorization"));
    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    console.error("physical-booking error:", e);
    return json({ error: "Something went wrong. Please try again, or book through the link below.", code: "server_error" }, 500);
  }
});
