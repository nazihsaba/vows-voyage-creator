import { useEffect, useRef, useState } from "react";
import { CalendarDays, ExternalLink, Loader2 } from "lucide-react";

interface CalendlyEmbedProps {
  url: string;
  /** Pre-fills the booking form, so the customer doesn't retype it. */
  prefill?: { name?: string; email?: string };
  className?: string;
}

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: {
        url: string;
        parentElement: HTMLElement;
        prefill?: { name?: string; email?: string };
      }) => void;
    };
  }
}

const WIDGET_SCRIPT = "https://assets.calendly.com/assets/external/widget.js";
const WIDGET_CSS = "https://assets.calendly.com/assets/external/widget.css";

/** Loads Calendly's official embed script once for the whole site. */
let scriptPromise: Promise<void> | null = null;
const loadCalendly = () => {
  if (window.Calendly) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  if (!document.querySelector(`link[href="${WIDGET_CSS}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = WIDGET_CSS;
    document.head.appendChild(link);
  }

  scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = WIDGET_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Calendly failed to load"));
    };
    document.body.appendChild(script);
  });
  return scriptPromise;
};

/** Adds the page options Auréa uses (gold color, no cookie banner). */
const buildUrl = (url: string) => {
  try {
    const u = new URL(url);
    u.searchParams.set("hide_gdpr_banner", "1");
    // Hide Calendly's own side panel; our page shows the meeting details instead.
    u.searchParams.set("hide_event_type_details", "1");
    u.searchParams.set("hide_landing_page_details", "1");
    // Auréa colors. Calendly only applies these on paid plans; free plans ignore them.
    u.searchParams.set("background_color", "ffffff");
    u.searchParams.set("text_color", "2b2b2b");
    // A deeper shade of the Auréa gold, so white button text stays readable.
    u.searchParams.set("primary_color", "b8925a");
    return u.toString();
  } catch {
    return "";
  }
};

/**
 * Shows a Calendly booking calendar inside the page, using
 * Calendly's official inline widget, with a backup link underneath.
 */
const CalendlyEmbed = ({ url, prefill, className = "" }: CalendlyEmbedProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const fullUrl = buildUrl(url);

  useEffect(() => {
    if (!fullUrl || !containerRef.current) return;
    let cancelled = false;
    const container = containerRef.current;
    setStatus("loading");

    loadCalendly()
      .then(() => {
        if (cancelled || !window.Calendly) return;
        container.innerHTML = "";
        window.Calendly.initInlineWidget({
          url: fullUrl,
          parentElement: container,
          prefill: prefill?.email || prefill?.name ? prefill : undefined,
        });
        setStatus("ready");
      })
      .catch(() => !cancelled && setStatus("error"));

    return () => {
      cancelled = true;
      container.innerHTML = "";
    };
  }, [fullUrl, prefill?.email, prefill?.name]);

  if (!fullUrl) {
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
    <div className={className}>
      <div className="relative w-full rounded-2xl overflow-hidden bg-white">
        {status === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-muted-foreground pointer-events-none">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading calendar…
          </div>
        )}
        {status === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center px-6 text-sm text-muted-foreground">
            <CalendarDays className="w-8 h-8" />
            The calendar couldn't load here. Please use the link below to book.
          </div>
        )}
        <div ref={containerRef} className="w-full h-[680px] sm:h-[700px]" />
      </div>

      <a
        href={fullUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Calendar not showing? Open it in a new tab
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  );
};

export default CalendlyEmbed;
