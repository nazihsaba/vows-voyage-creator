import { supabase } from "@/integrations/supabase/client";

type Status = "idle" | "uploading" | "polling" | "done" | "error";

interface State {
  status: Status;
  weddingId: string | null;
  message: string;
  error?: string;
}

const WEBHOOK_URL = "https://aurea-invites.app.n8n.cloud/webhook/read-invitees-csv";

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

  // Poll DB until rows show up OR webhook finishes + grace period
  const start = Date.now();
  const maxMs = 5 * 60 * 1000; // 5 min hard cap
  let lastCount = initialCount;
  let stableTicks = 0;

  while (Date.now() - start < maxMs) {
    await new Promise((r) => setTimeout(r, 2000));
    const currentCount = await getLinksCount(weddingId);

    if (currentCount > initialCount) {
      // Wait for count to stabilize (no new rows for ~6s) so all links are in
      if (currentCount === lastCount) {
        stableTicks++;
      } else {
        stableTicks = 0;
        lastCount = currentCount;
      }
      if (stableTicks >= 3 && webhookDone) break;
    } else if (webhookDone) {
      // Give webhook a few extra polls after it returned
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
