export function prewarmOGCache(inviteUrl: string) {
  // Fire-and-forget — don't await, don't block the user
  console.log("🔥 Pre-warming OG cache for:", inviteUrl);
  fetch(`https://graph.facebook.com/?id=${encodeURIComponent(inviteUrl)}&scrape=true`, {
    method: "POST",
    mode: "no-cors",
  }).catch(() => {});

  fetch(inviteUrl, {
    mode: "no-cors",
    cache: "no-store",
  }).catch(() => {});
}
