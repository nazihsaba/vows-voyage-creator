import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { elanSignature, wallRequest, type Wedding } from "./index.ts";

const wedding: Wedding = {
  id: "45c9352a-ec71-46d5-aa2f-db98b6991319",
  user_id: "00000000-0000-4000-8000-000000000001",
  groom_name: " Jason ", bride_name: " Sara ",
  wedding_date: "2027-06-12T00:00:00Z", template_type: "etoile-carousel",
  event_title: null, field_customizations: { arabic_only: true },
};

Deno.test("create uses the same invitation ID on retries to avoid duplicate billing", () => {
  assertEquals(wallRequest(wedding).id, "45c9352a-ec71-46d5-aa2f-db98b6991319");
  assertEquals(wallRequest({ ...wedding }).id, wallRequest(wedding).id);
});

Deno.test("partner wedding payload uses owner, Gregorian date, Beirut timezone and Arabic language", () => {
  const body = wallRequest(wedding);
  assertEquals(body.customer.id, wedding.user_id);
  assertEquals(body.date, "2027-06-12");
  assertEquals(body.timezone, "Asia/Beirut");
  assertEquals(body.language, "ar");
  if (!("name_a" in body)) throw new Error("Expected wedding names");
  assertEquals(body.name_a, "Jason");
  assertEquals(body.name_b, "Sara");
});

Deno.test("signature matches exact five-line HMAC with serialized body and no trailing newline", async () => {
  // Synthetic test credential only; never read deployed credentials in tests.
  const raw = '{"id":"inv-8812"}';
  const encoder = new TextEncoder();
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(raw));
  const bodyHash = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
  const key = await crypto.subtle.importKey("raw", encoder.encode("synthetic-test-only"), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const expected = await crypto.subtle.sign("HMAC", key, encoder.encode(`1794903720\n0123456789abcdef\nPOST\n/api/partner/v1/events\n${bodyHash}`));
  assertEquals(await elanSignature("synthetic-test-only", "1794903720", "0123456789abcdef", "POST", "/api/partner/v1/events", raw), Array.from(new Uint8Array(expected), b => b.toString(16).padStart(2, "0")).join(""));
});