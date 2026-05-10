export function prewarmOGCache(inviteUrl: string) {
  // Fire-and-forget — don't await, don't block the user
  fetch(inviteUrl, {
    mode: "no-cors",
    cache: "no-store",
  }).catch(() => {});
}
