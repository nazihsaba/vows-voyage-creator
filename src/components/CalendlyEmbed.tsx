import { useMemo, useState } from "react";
import { CalendarDays, Loader2 } from "lucide-react";

interface CalendlyEmbedProps {
  url: string;
  /** Pre-fills the booking form, so the customer doesn't retype it. */
  prefill?: { name?: string; email?: string };
  className?: string;
}

/**
 * Shows a Calendly booking calendar inside the page.
 * Uses Calendly's inline iframe, so no extra script is needed.
 */
const CalendlyEmbed = ({ url, prefill, className = "" }: CalendlyEmbedProps) => {
  const [loaded, setLoaded] = useState(false);

  const src = useMemo(() => {
    if (!url) return "";
    try {
      const u = new URL(url);
      u.searchParams.set("embed_type", "Inline");
      u.searchParams.set("embed_domain", window.location.hostname);
      u.searchParams.set("hide_gdpr_banner", "1");
      u.searchParams.set("hide_landing_page_details", "1");
      // Match the Auréa gold (a deeper shade so white button text stays readable).
      u.searchParams.set("primary_color", "b8925a");
      if (prefill?.name) u.searchParams.set("name", prefill.name);
      if (prefill?.email) u.searchParams.set("email", prefill.email);
      return u.toString();
    } catch {
      return "";
    }
  }, [url, prefill?.name, prefill?.email]);

  if (!src) {
    return (
      <div
        className={`flex flex-col items-center justify-center text-center gap-3 py-16 px-6 rounded-2xl border border-dashed border-border bg-muted/30 ${className}`}
      >
        <CalendarDays className="w-8 h-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground max-w-sm">
          Booking calendar is not available right now. Please check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden bg-white ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading calendar…
        </div>
      )}
      <iframe
        src={src}
        title="Book your meeting"
        onLoad={() => setLoaded(true)}
        className="w-full h-[700px] sm:h-[760px] border-0"
        loading="lazy"
      />
    </div>
  );
};

export default CalendlyEmbed;
