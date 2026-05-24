import { supabase } from "@/integrations/supabase/client";

type Status = "idle" | "uploading" | "polling" | "done" | "error";

interface State {
  status: Status;
  weddingId: string | null;
  message: string;
  error?: string;
}

const WEBHOOK_URL = "https://aurea-invites.app.n8n.cloud/webhook-test/automatic-links-2";

let state: State = { status: "idle", weddingId: null, message: "" };
const listeners = new Set<(s: State) => void>();

function setState(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l(state));
}

export function getGenerationState(): State {
  return state;
}

export function subscribeGeneration(listener: (s: State) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

async function getLinksCount(weddingId: string): Promise<number> {
  const { count } = await (supabase as any)
    .from("invitation_links")
    .select("*", { count: "exact", head: true })
    .eq("wedding_id", weddingId);
  return count ?? 0;
}

async function getInviteesCount(weddingId: string): Promise<number> {
  const { data: linkRows } = await (supabase as any)
    .from("invitation_links")
    .select("id")
    .eq("wedding_id", weddingId);
  const ids = (linkRows ?? []).map((r: any) => r.id);
  if (ids.length === 0) return 0;
  const { count } = await (supabase as any)
    .from("invitees")
    .select("*", { count: "exact", head: true })
    .in("invitation_link_id", ids);
  return count ?? 0;
}

export async function startLinkGeneration(params: {
  file: File;
  weddingId: string;
  weddingSlug: string;
}): Promise<void> {
  const { file, weddingId, weddingSlug } = params;

  setState({
    status: "uploading",
    weddingId,
    message: "Sending your guest list...",
    error: undefined,
  });

  const initialCount = await getLinksCount(weddingId);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("weddingSlug", weddingSlug);
  formData.append("weddingId", weddingId);

  let webhookDone = false;
  let webhookFailed = false;

  // Fire webhook in background; don't block on slow / dropped connection
  (async () => {
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        webhookFailed = true;
      }
    } catch {
      webhookFailed = true;
    } finally {
      webhookDone = true;
    }
  })();

  setState({ status: "polling", message: "Generating your invitation links..." });

  const initialInvitees = await getInviteesCount(weddingId);

  // Poll DB until rows show up OR webhook finishes + grace period.
  // Stabilize on BOTH links and invitees so the management table renders the full guest list.
  const start = Date.now();
  const maxMs = 5 * 60 * 1000; // 5 min hard cap
  let lastCount = initialCount;
  let lastInvitees = initialInvitees;
  let stableTicks = 0;

  while (Date.now() - start < maxMs) {
    await new Promise((r) => setTimeout(r, 2000));
    const currentCount = await getLinksCount(weddingId);
    const currentInvitees = await getInviteesCount(weddingId);

    const linksChanged = currentCount !== lastCount;
    const inviteesChanged = currentInvitees !== lastInvitees;
    lastCount = currentCount;
    lastInvitees = currentInvitees;

    if (currentCount > initialCount) {
      setState({
        status: "polling",
        message: `Loading guests... (${currentInvitees} so far)`,
      });
      if (!linksChanged && !inviteesChanged) {
        stableTicks++;
      } else {
        stableTicks = 0;
      }
      if (stableTicks >= 3 && webhookDone) break;
    } else if (webhookDone) {
      stableTicks++;
      if (stableTicks >= 5) break;
    }
  }

  if (lastCount > initialCount) {
    setState({ status: "done", message: "Links generated successfully!" });
  } else if (webhookFailed) {
    setState({
      status: "error",
      message: "We couldn't generate your links.",
      error: "The link generation service did not respond.",
    });
  } else {
    setState({
      status: "error",
      message: "No new links were created.",
      error: "Please check your file and try again.",
    });
  }

  // Auto-reset after a short delay so the overlay can clear
  setTimeout(() => {
    if (state.status === "done" || state.status === "error") {
      setState({ status: "idle", weddingId: null, message: "", error: undefined });
    }
  }, 1500);
}
