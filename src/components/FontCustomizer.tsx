import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Type, ChevronDown, RotateCcw } from "lucide-react";

export type TemplateFontKey = "title" | "subtitle" | "heading" | "body" | "monogram";

export interface TemplateFonts {
  title?: string;
  subtitle?: string;
  heading?: string;
  body?: string;
  monogram?: string;
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
};

const VAR_MAP: Record<TemplateFontKey, string[]> = {
  title: ["--font-template-title"],
  subtitle: ["--font-template-subtitle"],
  heading: ["--font-template-heading"],
  body: ["--font-template-body", "--font-template-small"],
  monogram: ["--font-template-monogram"],
};

/** Apply a TemplateFonts object to document.documentElement (or reset to defaults). */
export function applyTemplateFonts(fonts: TemplateFonts | null | undefined) {
  const merged = { ...DEFAULT_TEMPLATE_FONTS, ...(fonts || {}) };
  (Object.keys(VAR_MAP) as TemplateFontKey[]).forEach((key) => {
    const value = (merged as any)[key] || (DEFAULT_TEMPLATE_FONTS as any)[key];
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
}

const FIELDS: { key: TemplateFontKey; label: string; hint?: string }[] = [
  { key: "title", label: "Couple Name Font", hint: "The big names (e.g. Adrian & Elena)" },
  { key: "subtitle", label: "Subtitle Font", hint: "Family names and the “&” separator" },
  { key: "heading", label: "Section Heading Font" },
  { key: "body", label: "Body Text Font", hint: "Used for paragraphs and small caption text" },
  { key: "monogram", label: "Monogram Font", hint: "The single initials at the top" },
];

const FontCustomizer = ({ value, onChange }: FontCustomizerProps) => {
  // Live-apply to CSS variables whenever value changes
  useEffect(() => {
    applyTemplateFonts(value);
  }, [value]);

  // On unmount, reset so other pages aren't affected
  useEffect(() => {
    return () => resetTemplateFonts();
  }, []);

  const handleChange = (key: TemplateFontKey, stack: string) => {
    onChange({ ...value, [key]: stack });
  };

  return (
    <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Type className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Typography</h3>
      </div>
      <p className="text-xs text-muted-foreground">
        Pick fonts for your invitation. Changes apply live in the preview and are saved with your event.
      </p>

      <div className="space-y-3">
        {FIELDS.map(({ key, label, hint }) => {
          const current = (value?.[key] as string) || (DEFAULT_TEMPLATE_FONTS as any)[key];
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
  );
};

export default FontCustomizer;
