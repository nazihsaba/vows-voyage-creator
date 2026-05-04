import type { TemplateFonts } from "@/components/FontCustomizer";

/**
 * Per-template default font stacks.
 *
 * These mirror the typography each template currently ships with, so that
 * unconfigured weddings render exactly as before. The `FontCustomizer` and
 * each template wrapper merge `wedding.template_fonts` on top of these
 * defaults to populate the `--font-template-*` CSS variables.
 */
export const TEMPLATE_FONT_DEFAULTS: Record<string, Required<TemplateFonts>> = {
  // Lumière (Cinematic editorial) — established defaults
  "lumiere-editorial": {
    title: '"Dancing Script", cursive',
    subtitle: '"Dancing Script", cursive',
    heading: '"Dancing Script", cursive',
    body: '"Playfair Display", serif',
    monogram: '"Playfair Display", serif',
    countdown: '"Playfair Display", serif',
  },
  // Aura / Dorée (bible-verse-tabs) — soft serif romance
  "bible-verse-tabs": {
    title: '"Dancing Script", cursive',
    subtitle: '"Dancing Script", cursive',
    heading: '"Playfair Display", serif',
    body: '"Playfair Display", serif',
    monogram: '"Playfair Display", serif',
    countdown: '"Playfair Display", serif',
  },
  // Étoile (carousel)
  "etoile-carousel": {
    title: '"Dancing Script", cursive',
    subtitle: '"Dancing Script", cursive',
    heading: '"Playfair Display", serif',
    body: '"Playfair Display", serif',
    monogram: '"Playfair Display", serif',
    countdown: '"Playfair Display", serif',
  },
  // Éclat (classic-romance)
  "classic-romance": {
    title: '"Dancing Script", cursive',
    subtitle: '"Dancing Script", cursive',
    heading: '"Playfair Display", serif',
    body: '"Playfair Display", serif',
    monogram: '"Playfair Display", serif',
    countdown: '"Playfair Display", serif',
  },
  // Grâce (video-cinematic)
  "video-cinematic": {
    title: '"Dancing Script", cursive',
    subtitle: '"Dancing Script", cursive',
    heading: '"Playfair Display", serif',
    body: '"Playfair Display", serif',
    monogram: '"Playfair Display", serif',
    countdown: '"Playfair Display", serif',
  },
  // Vérité (modern-wedding) — clean serif
  "modern-wedding": {
    title: '"Dancing Script", cursive',
    subtitle: '"Dancing Script", cursive',
    heading: '"Playfair Display", serif',
    body: '"Playfair Display", serif',
    monogram: '"Playfair Display", serif',
    countdown: '"Playfair Display", serif',
  },
  // Opulence (curtain) — luxe Cormorant
  "opulence-curtain": {
    title: '"Cormorant Garamond", serif',
    subtitle: '"Cormorant Garamond", serif',
    heading: '"Cormorant Garamond", serif',
    body: '"Cormorant Garamond", serif',
    monogram: '"Cormorant Garamond", serif',
    countdown: '"Cormorant Garamond", serif',
  },
};

const FALLBACK: Required<TemplateFonts> = {
  title: '"Dancing Script", cursive',
  subtitle: '"Dancing Script", cursive',
  heading: '"Dancing Script", cursive',
  body: '"Playfair Display", serif',
  monogram: '"Playfair Display", serif',
  countdown: '"Playfair Display", serif',
};

/** Resolve the default font set for a given template_type (with legacy aliases). */
export function getTemplateFontDefaults(templateType: string | null | undefined): Required<TemplateFonts> {
  if (!templateType) return FALLBACK;
  // Legacy id aliases
  const aliases: Record<string, string> = {
    template2: "modern-wedding",
    template3: "modern-wedding",
    template4: "modern-wedding",
    template5: "modern-wedding",
    template6: "video-cinematic",
    template1: "classic-romance",
  };
  const key = aliases[templateType] || templateType;
  return TEMPLATE_FONT_DEFAULTS[key] || FALLBACK;
}

/**
 * Build an inline style object that sets all five `--font-template-*` CSS
 * variables on a template's outer wrapper, given the wedding's saved fonts
 * (may be empty) and the active template id.
 */
export function buildTemplateFontStyle(
  templateType: string | null | undefined,
  fonts: TemplateFonts | null | undefined,
): React.CSSProperties {
  const defaults = getTemplateFontDefaults(templateType);
  const merged = { ...defaults, ...(fonts || {}) };
  return {
    "--font-template-title": merged.title,
    "--font-template-subtitle": merged.subtitle,
    "--font-template-heading": merged.heading,
    "--font-template-body": merged.body,
    "--font-template-small": merged.body,
    "--font-template-monogram": merged.monogram,
  } as React.CSSProperties;
}
