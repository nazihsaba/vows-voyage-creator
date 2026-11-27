import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { prefersReducedMotion, useInView } from "./ReverieEffects";

/**
 * Rêverie gallery: the couple's photos as framed prints on ivory, in two staggered
 * columns, arches on the diagonal. Each print develops (soft blur to sharp) as it
 * scrolls in; tapping one opens it full screen on mocha, with swipe and arrow keys.
 */

export interface ReverieGalleryImage {
  id?: string;
  image_url: string;
  alt_text?: string | null;
  position_y?: number | null;
}

const GOLD = "#c4a274";
const MAT = "#fffdf9";
const OVERLAY = "rgba(38, 27, 23, 0.95)";
const OVERLAY_TEXT = "#efe4d8";
const OVERLAY_MUTED = "#cdb596";

const objectPosition = (img: ReverieGalleryImage) => `50% ${Math.min(100, Math.max(0, img.position_y ?? 50))}%`;

/** Prints 0 and 3 (then 4 and 7…) are arches, so they sit on a diagonal across the two columns. */
const isArch = (index: number) => index % 4 === 0 || index % 4 === 3;

const Print = ({
  image,
  index,
  label,
  onOpen,
}: {
  image: ReverieGalleryImage;
  index: number;
  label: string;
  onOpen: () => void;
}) => {
  const { ref, inView } = useInView<HTMLButtonElement>({ rootMargin: "0px 0px -12% 0px", threshold: 0 });
  const shown = inView || prefersReducedMotion();
  const arch = isArch(index);
  // 999px corners get scaled down to half the width: a true semicircle on top.
  const radius = arch ? "999px 999px 3px 3px" : "3px";
  const delay = (index % 2) * 140;

  return (
    <button
      ref={ref}
      type="button"
      onClick={onOpen}
      aria-label={label}
      className="dt-anim block w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{
        padding: 7,
        background: MAT,
        border: `1px solid ${GOLD}8c`,
        borderRadius: radius,
        boxShadow: "0 26px 44px -30px rgba(60, 40, 30, 0.6), 0 2px 6px -3px rgba(60, 40, 30, 0.18)",
        cursor: "zoom-in",
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(26px)",
        transition: `opacity 1s ease ${delay}ms, transform 1.1s cubic-bezier(.2,.7,.2,1) ${delay}ms`,
      }}
    >
      <span
        className="relative block overflow-hidden"
        style={{ aspectRatio: arch ? "3 / 4.25" : "4 / 5", borderRadius: radius, background: "#efe6dc" }}
      >
        <img
          src={image.image_url}
          alt={image.alt_text || ""}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="dt-anim absolute inset-0 h-full w-full object-cover"
          style={{
            objectPosition: objectPosition(image),
            transform: shown ? "scale(1)" : "scale(1.1)",
            filter: shown ? "none" : "blur(6px) saturate(0.7)",
            transition: `transform 1.8s cubic-bezier(.2,.7,.2,1) ${delay + 120}ms, filter 1.4s ease ${delay + 120}ms`,
          }}
        />
        {/* a fine ivory line just inside the print */}
        <span
          aria-hidden
          className="pointer-events-none absolute"
          style={{ inset: 7, borderRadius: radius, border: "1px solid rgba(255, 250, 240, 0.62)" }}
        />
      </span>
    </button>
  );
};

const Lightbox = ({
  images,
  index,
  onClose,
  onIndex,
  labels,
}: {
  images: ReverieGalleryImage[];
  index: number;
  onClose: () => void;
  onIndex: (i: number) => void;
  labels: { close: string; previous: string; next: string };
}) => {
  const count = images.length;
  const go = useCallback((step: number) => onIndex((index + step + count) % count), [index, count, onIndex]);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true));
    const previousFocus = document.activeElement as HTMLElement | null;
    closeRef.current?.focus({ preventScroll: true });
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = prevOverflow;
      previousFocus?.focus?.({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    // Capture on window runs before a surrounding dialog's Escape handler, so Escape
    // closes only the photo, not the dashboard preview it sits in.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      } else if (e.key === "ArrowRight" && count > 1) go(1);
      else if (e.key === "ArrowLeft" && count > 1) go(-1);
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [go, onClose, count]);

  const image = images[index];
  const arrow: React.CSSProperties = {
    width: 44,
    height: 44,
    borderRadius: 999,
    border: `1px solid ${OVERLAY_MUTED}66`,
    color: OVERLAY_TEXT,
    background: "rgba(255, 250, 243, 0.06)",
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${index + 1} / ${count}`}
      className="fixed inset-0 z-[80] flex items-center justify-center"
      style={{
        background: OVERLAY,
        backdropFilter: "blur(6px)",
        opacity: shown ? 1 : 0,
        transition: "opacity .35s ease",
      }}
      onClick={onClose}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null || count < 2) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 44) go(dx < 0 ? 1 : -1);
      }}
    >
      <button
        ref={closeRef}
        type="button"
        aria-label={labels.close}
        onClick={onClose}
        className="absolute flex items-center justify-center focus-visible:outline-none focus-visible:ring-2"
        style={{ ...arrow, top: 16, right: 16 }}
      >
        <X className="h-5 w-5" />
      </button>

      <figure
        key={index}
        className="dt-anim m-0 flex flex-col items-center"
        style={{ animation: "rv-rise .55s cubic-bezier(.2,.7,.2,1) both" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: 6, background: MAT, borderRadius: 3, boxShadow: "0 40px 80px -30px rgba(0,0,0,.6)" }}>
          <img
            src={image.image_url}
            alt={image.alt_text || ""}
            draggable={false}
            className="block"
            style={{ maxWidth: "min(88vw, 760px)", maxHeight: "76svh", width: "auto", height: "auto", objectFit: "contain" }}
          />
        </div>
        {count > 1 && (
          <figcaption
            dir="ltr"
            style={{
              marginTop: 18,
              fontFamily: "var(--font-template-body)",
              fontSize: 11,
              letterSpacing: "0.32em",
              color: OVERLAY_MUTED,
            }}
          >
            {index + 1} / {count}
          </figcaption>
        )}
      </figure>

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label={labels.previous}
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
            className="absolute hidden items-center justify-center focus-visible:outline-none focus-visible:ring-2 sm:flex"
            style={{ ...arrow, left: 18, top: "50%", marginTop: -22 }}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label={labels.next}
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            className="absolute hidden items-center justify-center focus-visible:outline-none focus-visible:ring-2 sm:flex"
            style={{ ...arrow, right: 18, top: "50%", marginTop: -22 }}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
    </div>
  );
};

export const ReverieGallery = ({
  images,
  labels,
}: {
  images: ReverieGalleryImage[];
  labels: { open: (n: number) => string; close: string; previous: string; next: string };
}) => {
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const prints = images.filter((img) => !!img?.image_url);
  if (prints.length === 0) return null;

  const print = (img: ReverieGalleryImage, i: number) => (
    <Print key={img.id || `${i}-${img.image_url}`} image={img} index={i} label={labels.open(i + 1)} onOpen={() => setOpen(i)} />
  );

  return (
    <>
      {prints.length === 1 ? (
        <div style={{ width: "min(76vw, 340px)", marginInline: "auto" }}>{print(prints[0], 0)}</div>
      ) : (
        // Two staggered columns: evens on the left, odds on the right and set lower.
        <div className="grid grid-cols-2 items-start" style={{ gap: "clamp(14px, 4vw, 22px)" }}>
          {[0, 1].map((col) => (
            <div
              key={col}
              className="flex flex-col"
              style={{ gap: "clamp(14px, 4vw, 22px)", marginTop: col === 1 ? "clamp(40px, 12vw, 72px)" : 0 }}
            >
              {prints.map((img, i) => (i % 2 === col ? print(img, i) : null))}
            </div>
          ))}
        </div>
      )}
      {open !== null && (
        <Lightbox
          images={prints}
          index={open}
          onClose={close}
          onIndex={setOpen}
          labels={{ close: labels.close, previous: labels.previous, next: labels.next }}
        />
      )}
    </>
  );
};
