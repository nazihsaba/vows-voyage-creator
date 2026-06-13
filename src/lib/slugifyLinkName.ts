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
  const decoded = decodeLinkSlug(name);

  return decoded
    .toString()
    .normalize("NFKC")
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
  const explicitSlug = link.unique_slug?.toString().trim();
  return explicitSlug ? slugifyLinkName(explicitSlug) : slugifyLinkName(link.link_name || "");
}

export function invitationLinkSlugMatches(
  link: { unique_slug?: string | null; link_name?: string | null },
  incomingSlug: string,
): boolean {
  const target = normalizeLinkSlug(incomingSlug);
  const candidates = [
    getInvitationLinkSlug(link),
    slugifyLinkName(link.link_name || ""),
    link.link_name || "",
  ];

  return candidates.some((candidate) => {
    const normalized = normalizeLinkSlug(candidate);
    return normalized === target || slugifyLinkName(normalized) === target;
  });
}
