/**
 * Slugify an invitation link name into a URL-safe slug that preserves
 * Unicode letters (including Arabic). Lowercases ASCII, collapses any run
 * of non-letter/non-digit characters into a single hyphen, and trims edges.
 *
 * The returned slug may contain non-ASCII characters; callers building URLs
 * MUST pass it through encodeURIComponent.
 */
export function slugifyLinkName(name: string): string {
  if (!name) return "";
  return name
    .toString()
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}
