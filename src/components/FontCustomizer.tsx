import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Type, ChevronDown, RotateCcw } from "lucide-react";

export type TemplateFontKey = "title" | "subtitle" | "heading" | "body" | "monogram" | "countdown";

export interface TemplateFonts {
  title?: string;
  subtitle?: string;
  heading?: string;
  body?: string;
  monogram?: string;
  countdown?: string;
}

const FONT_OPTIONS: { label: string; stack: string }[] = [
  { label: "Playfair Display", stack: '"Playfair Display", serif' },
  { label: "Dancing Script", stack: '"Dancing Script", cursive' },
  { label: "Cormorant Garamond", stack: '"Cormorant Garamond", serif' },
  { label: "Great Vibes", stack: '"Great Vibes", cursive' },
  { label: "Cinzel", stack: '"Cinzel", serif' },
  { label: "Montserrat", stack: '"Montserrat", sans-serif' },
  { label: "Inter", stack: '"Inter", sans-serif' },
];

export const DEFAULT_TEMPLATE_FONTS: Required<TemplateFonts> = {
  title: '"Dancing Script", cursive',
  subtitle: '"Dancing Script", cursive',
  heading: '"Dancing Script", cursive',
  body: '"Playfair Display", serif',
  monogram: '"Playfair Display", serif',
  countdown: '"Playfair Display", serif',
};

const VAR_MAP: Record<TemplateFontKey, string[]> = {
  title: ["--font-template-title"],
  subtitle: ["--font-template-subtitle"],
  heading: ["--font-template-heading"],
  body: ["--font-template-body", "--font-template-small"],
  monogram: ["--font-template-monogram"],
  countdown: ["--font-template-countdown"],
};

/** Apply a TemplateFonts object to document.documentElement (or reset to defaults).
 *  Optionally pass per-template defaults so each template falls back to its own
 *  typography when a slot is unset. */
export function applyTemplateFonts(
  fonts: TemplateFonts | null | undefined,
  defaults: TemplateFonts = DEFAULT_TEMPLATE_FONTS,
) {
  const base = { ...DEFAULT_TEMPLATE_FONTS, ...defaults };
  const merged = { ...base, ...(fonts || {}) };
  (Object.keys(VAR_MAP) as TemplateFontKey[]).forEach((key) => {
    const value = (merged as any)[key] || (base as any)[key];
    VAR_MAP[key].forEach((cssVar) => {
      document.documentElement.style.setProperty(cssVar, value);
    });
  });
}

/** Reset all template font CSS variables (e.g. when leaving the page). */
export function resetTemplateFonts() {
  (Object.keys(VAR_MAP) as TemplateFontKey[]).forEach((key) => {
    VAR_MAP[key].forEach((cssVar) => {
      document.documentElement.style.removeProperty(cssVar);
    });
  });
}

interface FontCustomizerProps {
  value: TemplateFonts;
  onChange: (next: TemplateFonts) => void;
  /** Per-template default font stacks. When omitted, falls back to DEFAULT_TEMPLATE_FONTS. */
  defaults?: TemplateFonts;
}

const FIELDS: { key: TemplateFontKey; label: string; hint?: string }[] = [
  { key: "title", label: "Couple Name Font", hint: 'The big names (e.g. "Adrian & Elena")' },
  { key: "subtitle", label: "Subtitle Font", hint: 'Family names (e.g. "The Smith Family")' },
  { key: "heading", label: "Section Heading Font", hint: 'Section titles (e.g. "Our Gallery", "Save The Date")' },
  { key: "body", label: "Body Text Font", hint: 'Paragraphs (e.g. "Cordially invite you...")' },
  { key: "monogram", label: "Monogram Font", hint: 'The initials at the top (e.g. "A & E")' },
  { key: "countdown", label: "Countdown Numbers Font", hint: "The numbers in the countdown timer" },
];

const FontCustomizer = ({ value, onChange, defaults }: FontCustomizerProps) => {
  const [open, setOpen] = useState(false);
  const effectiveDefaults: TemplateFonts = { ...DEFAULT_TEMPLATE_FONTS, ...(defaults || {}) };

  // Live-apply to CSS variables whenever value changes
  useEffect(() => {
    applyTemplateFonts(value, effectiveDefaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, defaults]);

  // On unmount, reset so other pages aren't affected
  useEffect(() => {
    return () => resetTemplateFonts();
  }, []);

  const handleChange = (key: TemplateFontKey, stack: string) => {
    onChange({ ...value, [key]: stack });
  };

  const handleReset = () => {
    // Force-apply per-template defaults synchronously so the change is
    // immediately visible (and overrides any stale inline CSS vars), then
    // notify the parent to clear the saved overrides.
    resetTemplateFonts();
    applyTemplateFonts({}, effectiveDefaults);
    onChange({});
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="rounded-lg border bg-muted/30">
      <div className="flex items-center justify-between gap-2 p-4">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2 flex-1 text-left"
            aria-label={open ? "Collapse typography" : "Expand typography"}
          >
            <Type className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Typography</h3>
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>
        </CollapsibleTrigger>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="h-8 px-2 text-xs gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </Button>
      </div>

      <CollapsibleContent>
        <div className="px-4 pb-4 space-y-4">
          <p className="text-xs text-muted-foreground">
            Pick fonts for your invitation. Changes apply live in the preview and are saved with your event.
          </p>

          <div className="space-y-3">
            {FIELDS.map(({ key, label, hint }) => {
              const current = (value?.[key] as string) || (effectiveDefaults as any)[key];
              return (
                <div key={key} className="space-y-1.5">
                  <Label className="text-sm font-medium">{label}</Label>
                  <Select value={current} onValueChange={(v) => handleChange(key, v)}>
                    <SelectTrigger className="h-11 sm:h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_OPTIONS.map((opt) => (
                        <SelectItem key={opt.label} value={opt.stack}>
                          <span style={{ fontFamily: opt.stack }}>{opt.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default FontCustomizer;
