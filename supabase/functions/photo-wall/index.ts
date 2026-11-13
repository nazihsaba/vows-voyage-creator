import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Elan photo wall add-on (see the Elan partner API).
 *
 *   POST { action: "status", weddingId }  -> { price, wall }
 *   POST { action: "unlock", weddingId }  -> { wall }            when the add-on is free (or already paid)
 *                                          -> { collectUrl }      when a Whish payment is needed first
 *   GET  ?whish=success|failed&weddingId=…   Whish server callback (payment result)
 *
 * The Elan wall is created only once payment is confirmed, because creating it is what
 * adds it to our Elan bill. Requests to Elan are signed here with ELAN_KEY / ELAN_SECRET,
 * which never leave the server.
 */

// ---------- Price (the single source of truth; the app shows what this returns) ----------
const PHOTO_WALL_PRICE_USD = 0;
const CURRENCY = "USD";

// ---------- Connections ----------
const ELAN_BASE = Deno.env.get("ELAN_BASE_URL") ?? "https://elan.stridesoftware.net";
const WHISH_API = "https://api.whish.money/itel-service/api";
const EVENT_TIME_ZONE = "Asia/Beirut";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const admin = (): SupabaseClient =>
  createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

// ---------- Elan request signing ----------
const enc = new TextEncoder();
const hex = (buf: ArrayBuffer | Uint8Array) =>
  Array.from(buf instanceof Uint8Array ? buf : new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");

/** The string Elan asks us to sign: five lines joined by "\n", no trailing newline. */
export async function elanSignature(secret: string, ts: string, nonce: string, method: string, url: string, raw: string) {
  const bodyHash = hex(await crypto.subtle.digest("SHA-256", enc.encode(raw)));
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", key, enc.encode(`${ts}\n${nonce}\n${method}\n${url}\n${bodyHash}`)));
}

class NotConfigured extends Error {}

export async function elan(method: "GET" | "POST", path: string, body?: unknown): Promise<{ status: number; data: any }> {
  const keyId = Deno.env.get("ELAN_KEY");
  const secret = Deno.env.get("ELAN_SECRET");
  if (!keyId || !secret) throw new NotConfigured("Elan keys are not configured");
  const url = `/api/partner/v1${path}`;
  const raw = body === undefined ? "" : JSON.stringify(body); // serialised once; these exact bytes are signed and sent
  const ts = String(Math.floor(Date.now() / 1000));
  const nonce = hex(crypto.getRandomValues(new Uint8Array(16)));
  const signature = await elanSignature(secret, ts, nonce, method, url, raw);
  const res = await fetch(`${ELAN_BASE}${url}`, {
    method,
    headers: {
      "X-Elan-Key": keyId,
      "X-Elan-Timestamp": ts,
      "X-Elan-Nonce": nonce,
      "X-Elan-Signature": signature,
      ...(raw ? { "Content-Type": "application/json" } : {}),
    },
    body: raw || undefined,
  });
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    /* empty or non-JSON body */
  }
  return { status: res.status, data };
}

// ---------- Data ----------
export type Wedding = {
  id: string;
  user_id: string;
  groom_name: string;
  bride_name: string;
  wedding_date: string;
  template_type: string | null;
  event_title: string | null;
  field_customizations: Record<string, unknown> | null;
};

const WALL_FIELDS =
  "wedding_id, status, price_amount, price_currency, elan_mode, guest_url, qr_png_url, qr_svg_url, camera_opens_at, camera_closes_at, album_deleted_after, last_error, updated_at";

async function loadWall(db: SupabaseClient, weddingId: string) {
  const { data } = await db.from("photo_walls").select(`${WALL_FIELDS}, payment_external_id`).eq("wedding_id", weddingId).maybeSingle();
  return data as (Record<string, any> & { payment_external_id: string | null }) | null;
}

const publicWall = (row: Record<string, any> | null) => {
  if (!row) return null;
  const { payment_external_id: _hidden, ...rest } = row;
  return rest;
};

async function saveWall(db: SupabaseClient, wedding: Wedding, fields: Record<string, unknown>) {
  const { error } = await db
    .from("photo_walls")
    .upsert({ wedding_id: wedding.id, user_id: wedding.user_id, updated_at: new Date().toISOString(), ...fields }, { onConflict: "wedding_id" });
  if (error) throw new Error(`Could not save the photo wall: ${error.message}`);
}

/** The Elan "create a wall" body for this invitation. Our wedding id is the idempotency key. */
export function wallRequest(w: Wedding) {
  const isWedding = !/christmas|birthday/i.test(w.template_type || "");
  const couple = [w.groom_name, w.bride_name].map((s) => (s || "").trim()).filter(Boolean).join(" & ");
  return {
    id: w.id,
    customer: { id: w.user_id, name: couple || undefined },
    ...(isWedding
      ? { type: "wedding", name_a: (w.groom_name || "").trim(), name_b: (w.bride_name || "").trim() }
      : { type: "other", title: (w.event_title || couple || "Celebration").trim() }),
    date: String(w.wedding_date).slice(0, 10),
    timezone: EVENT_TIME_ZONE,
    language: w.field_customizations?.arabic_only === true ? "ar" : "en",
  };
}

/** Create the wall on Elan (safe to repeat: the same id returns the same wall, not charged again). */
async function createWall(db: SupabaseClient, wedding: Wedding) {
  const { status, data } = await elan("POST", "/events", wallRequest(wedding));
  if ((status === 200 || status === 201) && data?.guest_url) {
    await saveWall(db, wedding, {
      status: "created",
      elan_event_id: data.event_id ?? null,
      elan_mode: data.mode === "test" ? "test" : "live",
      guest_url: data.guest_url,
      qr_png_url: data.qr_png_url ?? null,
      qr_svg_url: data.qr_svg_url ?? null,
      camera_opens_at: data.camera_opens_at ?? null,
      camera_closes_at: data.camera_closes_at ?? null,
      album_deleted_after: data.album_deleted_after ?? null,
      last_error: null,
    });
    return { ok: true as const };
  }
  // Payment stays confirmed, so the couple (or we) can simply try again later with the same id.
  const code = data?.error === "invalid" ? `invalid:${data?.field ?? ""}` : data?.error || `http_${status}`;
  console.error("Elan create failed", status, JSON.stringify(data));
  await saveWall(db, wedding, { status: "paid", last_error: code });
  return { ok: false as const, code, message: data?.message as string | undefined };
}

/** Elan asks partners to check walls_left before offering the add-on. */
async function wallsAvailable() {
  const { status, data } = await elan("GET", "/me");
  if (status !== 200) {
    console.error("Elan /me failed", status, JSON.stringify(data));
    return false;
  }
  return Number(data?.walls_left ?? 0) > 0;
}

// ---------- Whish ----------
function whishHeaders() {
  const channel = Deno.env.get("WHISH_PAY_CHANNEL");
  const secret = Deno.env.get("WHISH_PAY_SECRET");
  const websiteUrl = Deno.env.get("WHISH_PAY_WEBSITE_URL");
  if (!channel || !secret || !websiteUrl) throw new NotConfigured("Whish Pay credentials not configured");
  return {
    websiteUrl,
    headers: {
      "Content-Type": "application/json",
      channel,
      secret,
      websiteUrl,
      "User-Agent": "Whish/1.0 (https://aureainvites.com; support@aureainvites.com)",
    },
  };
}

/** Ask Whish whether the payment really went through (never trust a redirect or callback URL alone). */
async function whishPaymentSucceeded(externalId: string, currency: string) {
  const { headers } = whishHeaders();
  const res = await fetch(`${WHISH_API}/payment/collect/status`, {
    method: "POST",
    headers,
    body: JSON.stringify({ currency, externalId: Number(externalId) }),
  });
  const result = await res.json().catch(() => null);
  console.log("Whish status:", JSON.stringify(result));
  return result?.status === true && String(result?.data?.collectStatus).toLowerCase() === "success";
}

async function startWhishPayment(db: SupabaseClient, wedding: Wedding) {
  const { websiteUrl, headers } = whishHeaders();
  const externalId = Date.now();
  const fnBase = `${Deno.env.get("SUPABASE_URL")}/functions/v1/photo-wall`;
  const back = `https://${websiteUrl}/dashboard/manage-links/${wedding.id}`;
  const res = await fetch(`${WHISH_API}/payment/whish`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      amount: PHOTO_WALL_PRICE_USD,
      currency: CURRENCY,
      invoice: `Photo wall for ${wedding.groom_name} & ${wedding.bride_name}`,
      externalId,
      successCallbackUrl: `${fnBase}?whish=success&weddingId=${wedding.id}`,
      failureCallbackUrl: `${fnBase}?whish=failed&weddingId=${wedding.id}`,
      successRedirectUrl: `${back}?photo_wall_payment=success`,
      failureRedirectUrl: `${back}?photo_wall_payment=failed`,
    }),
  });
  const result = await res.json().catch(() => null);
  if (!result?.status || !result?.data?.collectUrl) {
    console.error("Whish collect failed", JSON.stringify(result));
    return null;
  }
  await saveWall(db, wedding, {
    status: "pending_payment",
    price_amount: PHOTO_WALL_PRICE_USD,
    price_currency: CURRENCY,
    payment_external_id: String(externalId),
    last_error: null,
  });
  return result.data.collectUrl as string;
}

/** If a Whish payment is pending, confirm it with Whish and, once paid, create the wall. */
async function settlePendingPayment(db: SupabaseClient, wedding: Wedding, row: Record<string, any> | null) {
  if (row?.status !== "pending_payment" || !row.payment_external_id) return;
  if (await whishPaymentSucceeded(row.payment_external_id, row.price_currency || CURRENCY)) {
    await saveWall(db, wedding, { status: "paid", last_error: null });
    await createWall(db, wedding);
  }
}

// ---------- Handlers ----------
async function ownedWedding(db: SupabaseClient, weddingId: unknown, authHeader: string | null) {
  if (!authHeader) return { error: json({ error: "not_authenticated" }, 401) };
  const { data: auth } = await db.auth.getUser(authHeader.replace(/^Bearer\s+/i, ""));
  if (!auth?.user) return { error: json({ error: "not_authenticated" }, 401) };
  if (typeof weddingId !== "string" || !weddingId) return { error: json({ error: "missing_wedding" }, 400) };
  const { data: wedding } = await db
    .from("weddings")
    .select("id, user_id, groom_name, bride_name, wedding_date, template_type, event_title, field_customizations")
    .eq("id", weddingId)
    .maybeSingle();
  if (!wedding) return { error: json({ error: "not_found" }, 404) };
  if (wedding.user_id !== auth.user.id) return { error: json({ error: "forbidden" }, 403) };
  return { wedding: wedding as Wedding };
}

const price = { amount: PHOTO_WALL_PRICE_USD, currency: CURRENCY };

async function handleStatus(db: SupabaseClient, wedding: Wedding) {
  let row = await loadWall(db, wedding.id);
  if (row?.status === "pending_payment") {
    await settlePendingPayment(db, wedding, row);
    row = await loadWall(db, wedding.id);
  }
  return json({ price, wall: publicWall(row) });
}

async function handleUnlock(db: SupabaseClient, wedding: Wedding) {
  let row = await loadWall(db, wedding.id);
  if (row?.status === "created") return json({ price, wall: publicWall(row) });

  // A payment may have gone through since the page loaded.
  if (row?.status === "pending_payment") {
    await settlePendingPayment(db, wedding, row);
    row = await loadWall(db, wedding.id);
    if (row?.status === "created") return json({ price, wall: publicWall(row) });
  }

  // Already paid (or free) but not created yet: just create it.
  if (row?.status === "paid") {
    const r = await createWall(db, wedding);
    return json({ price, wall: publicWall(await loadWall(db, wedding.id)), ...(r.ok ? {} : { error: r.code, message: r.message }) });
  }

  // New purchase: make sure Elan can create a wall before taking any payment.
  if (!(await wallsAvailable())) return json({ price, wall: publicWall(row), error: "unavailable" }, 409);

  if (PHOTO_WALL_PRICE_USD <= 0) {
    await saveWall(db, wedding, { status: "paid", price_amount: 0, price_currency: CURRENCY, last_error: null });
    const r = await createWall(db, wedding);
    return json({ price, wall: publicWall(await loadWall(db, wedding.id)), ...(r.ok ? {} : { error: r.code, message: r.message }) });
  }

  const collectUrl = await startWhishPayment(db, wedding);
  if (!collectUrl) return json({ price, wall: publicWall(row), error: "payment_failed_to_start" }, 502);
  return json({ price, collectUrl });
}

/** Whish calls this when a payment finishes. The result is always re-checked with Whish. */
async function handleWhishCallback(db: SupabaseClient, url: URL) {
  const weddingId = url.searchParams.get("weddingId");
  if (!weddingId) return json({ error: "missing_wedding" }, 400);
  const { data: wedding } = await db
    .from("weddings")
    .select("id, user_id, groom_name, bride_name, wedding_date, template_type, event_title, field_customizations")
    .eq("id", weddingId)
    .maybeSingle();
  if (!wedding) return json({ error: "not_found" }, 404);
  const row = await loadWall(db, weddingId);
  if (row?.status !== "pending_payment") return json({ ok: true, status: row?.status ?? null });
  if (url.searchParams.get("whish") === "failed") {
    // Only mark it failed if Whish agrees it did not succeed.
    if (!(row.payment_external_id && (await whishPaymentSucceeded(row.payment_external_id, row.price_currency || CURRENCY)))) {
      await saveWall(db, wedding as Wedding, { status: "payment_failed" });
      return json({ ok: true, status: "payment_failed" });
    }
  }
  await settlePendingPayment(db, wedding as Wedding, row);
  return json({ ok: true, status: (await loadWall(db, weddingId))?.status ?? null });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const db = admin();
  try {
    const url = new URL(req.url);
    if (url.searchParams.has("whish")) return await handleWhishCallback(db, url);
    if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

    const body = await req.json().catch(() => ({}));
    const owned = await ownedWedding(db, body?.weddingId, req.headers.get("authorization"));
    if (owned.error) return owned.error;
    if (body.action === "status") return await handleStatus(db, owned.wedding);
    if (body.action === "unlock") return await handleUnlock(db, owned.wedding);
    return json({ error: "unknown_action" }, 400);
  } catch (err) {
    if (err instanceof NotConfigured) {
      console.error(err.message);
      return json({ error: "not_configured" }, 503);
    }
    console.error("photo-wall error", err);
    return json({ error: "server_error" }, 500);
  }
});
