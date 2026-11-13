import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/** The couple's Elan photo wall, as returned by the photo-wall server function. */
export interface PhotoWall {
  wedding_id: string;
  status: "pending_payment" | "paid" | "created" | "payment_failed";
  price_amount: number;
  price_currency: string;
  elan_mode: "live" | "test" | null;
  guest_url: string | null;
  qr_png_url: string | null;
  qr_svg_url: string | null;
  camera_opens_at: string | null;
  camera_closes_at: string | null;
  album_deleted_after: string | null;
  last_error: string | null;
}

export interface PhotoWallPrice {
  amount: number;
  currency: string;
}

type Reply = { price?: PhotoWallPrice; wall?: PhotoWall | null; collectUrl?: string; error?: string; message?: string };

async function callPhotoWall(action: "status" | "unlock", weddingId: string): Promise<Reply> {
  const { data, error } = await supabase.functions.invoke("photo-wall", { body: { action, weddingId } });
  if (error) {
    // Non-2xx replies still carry a JSON body with an error code.
    try {
      const body = await (error as { context?: Response }).context?.json();
      if (body) return body as Reply;
    } catch {
      /* not JSON */
    }
    return { error: "network" };
  }
  return (data ?? {}) as Reply;
}

/**
 * Loads the photo wall for an invitation and unlocks it.
 * Unlocking is free while the price is $0 (the wall is created straight away); with a price,
 * it sends the couple to Whish and the wall is created once the payment is confirmed.
 */
export function usePhotoWall(weddingId: string | undefined) {
  const [wall, setWall] = useState<PhotoWall | null>(null);
  const [price, setPrice] = useState<PhotoWallPrice | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apply = (reply: Reply) => {
    if (reply.price) setPrice(reply.price);
    if ("wall" in reply) setWall(reply.wall ?? null);
  };

  const refresh = useCallback(async () => {
    if (!weddingId) return;
    const reply = await callPhotoWall("status", weddingId);
    apply(reply);
    setLoaded(true);
    return reply;
  }, [weddingId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const unlock = useCallback(async () => {
    if (!weddingId || busy) return;
    setBusy(true);
    setError(null);
    try {
      const reply = await callPhotoWall("unlock", weddingId);
      apply(reply);
      if (reply.collectUrl) {
        window.location.href = reply.collectUrl;
        return;
      }
      if (reply.error) setError(reply.error);
    } finally {
      setBusy(false);
    }
  }, [weddingId, busy]);

  const isUnlocked = wall?.status === "created";
  return { wall, price, loaded, busy, error, unlock, refresh, isUnlocked };
}

/** "$0", "$25", "$12.50" */
export const formatPrice = (p: PhotoWallPrice | null) =>
  p ? `${p.currency === "USD" ? "$" : `${p.currency} `}${Number.isInteger(p.amount) ? p.amount : p.amount.toFixed(2)}` : "";
