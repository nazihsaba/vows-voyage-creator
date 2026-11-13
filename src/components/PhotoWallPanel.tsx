import { Camera, Check, Copy, Download, ExternalLink, Images, Loader2, Lock, QrCode, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatPrice, type PhotoWall, type PhotoWallPrice } from "@/hooks/usePhotoWall";

const DATE_FMT = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Beirut" });
const fmtDate = (iso: string | null) => (iso ? DATE_FMT.format(new Date(iso)) : null);

const ERRORS: Record<string, string> = {
  unavailable: "Photo walls aren't available right now. Please try again a little later.",
  not_configured: "The photo wall isn't switched on yet. Please contact us and we'll set it up.",
  limit_reached: "Your photo wall is reserved and we're finishing setting it up. Please try again in a little while.",
  "invalid:date": "Please check your event date. The photo wall needs an upcoming date.",
  payment_failed_to_start: "We couldn't start the payment. Please try again.",
  network: "We couldn't reach the server. Please check your connection and try again.",
};
const errorText = (code: string | null) => (code ? ERRORS[code] ?? "Something went wrong setting up your photo wall. Please try again." : null);

interface Props {
  wall: PhotoWall | null;
  price: PhotoWallPrice | null;
  loaded: boolean;
  busy: boolean;
  error: string | null;
  onUnlock: () => void;
  onRefresh: () => void;
}

/** Photo Wall tab: locked with its price until unlocked, then the guest link and QR code to print. */
const PhotoWallPanel = ({ wall, price, loaded, busy, error, onUnlock, onRefresh }: Props) => {
  const { toast } = useToast();

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-muted-foreground gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading photo wall…
      </div>
    );
  }

  // ---------- Unlocked: the wall exists ----------
  if (wall?.status === "created" && wall.guest_url) {
    const copy = async () => {
      try {
        await navigator.clipboard.writeText(wall.guest_url!);
        toast({ title: "Link copied", description: "Share it with your guests or add it to your invitation." });
      } catch {
        toast({ title: "Couldn't copy", description: wall.guest_url!, variant: "destructive" });
      }
    };
    const opens = fmtDate(wall.camera_opens_at);
    const until = fmtDate(wall.album_deleted_after);
    return (
      <div className="py-2 sm:py-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-bronze/10 text-bronze">
            <Check className="w-4 h-4" />
          </span>
          <h3 className="text-lg font-semibold text-foreground">Your photo wall is ready</h3>
          {wall.elan_mode === "test" && (
            <span className="ml-1 rounded-full border border-bronze/30 px-2 py-0.5 text-[10px] uppercase tracking-wider text-bronze">Test</span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Print the QR code on your invitation or share the link. Guests scan it and add their photos and videos to one album.
        </p>

        <div className="grid gap-6 md:grid-cols-[220px_minmax(0,1fr)] items-start">
          {wall.qr_png_url && (
            <div className="mx-auto md:mx-0 w-[220px] rounded-2xl border border-bronze/20 bg-white p-4 shadow-sm">
              <img src={wall.qr_png_url} alt="Photo wall QR code" className="w-full aspect-square object-contain" />
              <div className="mt-3 flex gap-2">
                <Button asChild variant="outline" size="sm" className="flex-1 rounded-full text-xs">
                  <a href={wall.qr_png_url} target="_blank" rel="noopener noreferrer">
                    <Download className="w-3.5 h-3.5 mr-1" /> PNG
                  </a>
                </Button>
                {wall.qr_svg_url && (
                  <Button asChild variant="outline" size="sm" className="flex-1 rounded-full text-xs">
                    <a href={wall.qr_svg_url} target="_blank" rel="noopener noreferrer" title="Best for printing">
                      <QrCode className="w-3.5 h-3.5 mr-1" /> SVG
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="space-y-5 min-w-0">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Guest link</p>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2">
                <span className="truncate text-sm text-foreground flex-1">{wall.guest_url}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={copy} title="Copy link">
                  <Copy className="w-4 h-4" />
                </Button>
                <Button asChild variant="ghost" size="icon" className="h-8 w-8 shrink-0" title="Open">
                  <a href={wall.guest_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {opens && (
                <div className="rounded-xl border border-border px-4 py-3">
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Camera className="w-3.5 h-3.5 text-bronze" /> Camera opens</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{opens}</p>
                </div>
              )}
              {until && (
                <div className="rounded-xl border border-border px-4 py-3">
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Images className="w-3.5 h-3.5 text-bronze" /> Download the album by</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{until}</p>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              The camera opens by itself on your event day and closes the day after. Remember to download your album before it's removed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Paid, waiting for payment, or still locked ----------
  const shownError = errorText(error ?? (wall?.status === "paid" ? wall.last_error : null));
  const waitingForPayment = wall?.status === "pending_payment";
  const paidNotCreated = wall?.status === "paid";

  return (
    <div className="flex flex-col items-center justify-center py-14 sm:py-20 text-center">
      <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-bronze/10 text-bronze mb-4">
        {paidNotCreated || waitingForPayment ? <Camera className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
      </span>
      <h3 className="text-lg font-semibold text-foreground mb-2">Photo Wall</h3>
      <p className="text-sm text-muted-foreground mb-5 max-w-md">
        One shared album for your celebration. Guests scan a QR code on your invitation and add their photos and videos, no app needed.
      </p>
      <ul className="text-sm text-foreground/80 space-y-1.5 mb-6 text-left">
        {["A QR code and link to print on your invitation", "The camera opens by itself on your event day", "Download every photo afterwards"].map((t) => (
          <li key={t} className="flex items-start gap-2">
            <Check className="w-4 h-4 mt-0.5 text-bronze shrink-0" />
            {t}
          </li>
        ))}
      </ul>

      {waitingForPayment ? (
        <>
          <p className="text-sm text-muted-foreground mb-3">We're waiting for your payment to be confirmed.</p>
          <Button variant="outline" onClick={onRefresh} className="rounded-full px-6">
            <RefreshCw className="w-4 h-4 mr-2" /> Check again
          </Button>
        </>
      ) : (
        <>
          {!paidNotCreated && price && (
            <p className="text-sm text-muted-foreground mb-3">
              Price: <span className="font-semibold text-foreground">{formatPrice(price)}</span>
            </p>
          )}
          {paidNotCreated && <p className="text-sm text-muted-foreground mb-3">Your photo wall is unlocked. Let's finish setting it up.</p>}
          <Button variant="brand" onClick={onUnlock} disabled={busy} className="rounded-full px-6">
            {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : paidNotCreated ? <Camera className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
            {busy ? "Setting up your photo wall…" : paidNotCreated ? "Create my photo wall" : "Unlock Photo Wall"}
          </Button>
        </>
      )}
      {wall?.status === "payment_failed" && !error && (
        <p className="mt-3 text-xs text-destructive">Your last payment didn't go through. You can try again.</p>
      )}
      {shownError && <p className="mt-4 max-w-md text-sm text-destructive">{shownError}</p>}
    </div>
  );
};

export default PhotoWallPanel;
