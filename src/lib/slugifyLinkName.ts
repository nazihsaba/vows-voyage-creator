/**
 * Slugify an invitation link name into a URL-safe Latin-letter slug.
 * Arabic characters are transliterated to ASCII so URLs are readable
 * and shareable instead of showing percent-encoded gibberish.
 */

// Arabic letter → Latin transliteration map.
const ARABIC_TRANSLIT: Record<string, string> = {
  "ا": "a", "أ": "a", "إ": "i", "آ": "a", "ٱ": "a",
  "ب": "b", "ت": "t", "ث": "th", "ج": "j", "ح": "h",
  "خ": "kh", "د": "d", "ذ": "dh", "ر": "r", "ز": "z",
  "س": "s", "ش": "sh", "ص": "s", "ض": "d", "ط": "t",
  "ظ": "z", "ع": "a", "غ": "gh", "ف": "f", "ق": "q",
  "ك": "k", "ل": "l", "م": "m", "ن": "n", "ه": "h",
  "و": "w", "ي": "y", "ى": "a", "ة": "a", "ء": "",
  "ئ": "y", "ؤ": "w", "ـ": "",
  // Persian/Urdu variants that may appear
  "پ": "p", "چ": "ch", "ژ": "zh", "گ": "g", "ک": "k", "ی": "y",
  // Arabic-Indic digits
  "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
  "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
};

// Diacritics (harakat) and tatweel to strip before transliteration.
const ARABIC_DIACRITICS = /[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g;

function transliterateArabic(input: string): string {
  const stripped = input.replace(ARABIC_DIACRITICS, "");
  let out = "";
  for (const ch of stripped) {
    if (ARABIC_TRANSLIT[ch] !== undefined) {
      out += ARABIC_TRANSLIT[ch];
    } else {
      out += ch;
    }
  }
  return out;
}

export function slugifyLinkName(name: string): string {
  if (!name) return "";
  const decoded = decodeLinkSlug(name);
  const transliterated = transliterateArabic(decoded.normalize("NFKC"));

  return transliterated
    .toString()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

export function decodeLinkSlug(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function normalizeLinkSlug(value: string): string {
  return decodeLinkSlug(value).normalize("NFKC").trim().toLowerCase();
}

export function getInvitationLinkSlug(link: { unique_slug?: string | null; link_name?: string | null }): string {
  // Prefer the transliterated link_name so the URL reflects the invitee.
  // Only fall back to unique_slug when link_name produces nothing usable.
  const fromName = slugifyLinkName(link.link_name || "");
  if (fromName) return fromName;
  return slugifyLinkName(link.unique_slug || "");
}

export function invitationLinkSlugMatches(
  link: { unique_slug?: string | null; link_name?: string | null },
  incomingSlug: string,
): boolean {
  const target = normalizeLinkSlug(incomingSlug);
  const targetSlug = slugifyLinkName(incomingSlug);

  const candidates = [
    getInvitationLinkSlug(link),
    slugifyLinkName(link.link_name || ""),
    slugifyLinkName(link.unique_slug || ""),
    link.link_name || "",
    link.unique_slug || "",
  ];

  return candidates.some((candidate) => {
    if (!candidate) return false;
    const normalized = normalizeLinkSlug(candidate);
    const candidateSlug = slugifyLinkName(candidate);
    return (
      normalized === target ||
      candidateSlug === target ||
      candidateSlug === targetSlug
    );
  });
}
