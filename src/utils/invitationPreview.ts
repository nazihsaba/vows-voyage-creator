/**
 * Invitation Preview Data Generator
 * Produces display name, title, description, and image URL
 * for UI display and WhatsApp/social link previews.
 */

const PREVIEW_DESCRIPTIONS = [
  "You are invited to celebrate a beautiful wedding 💍",
  "Join us in celebrating this special moment ✨",
  "Together with joy, we invite you to share in our celebration 💐",
  "You're cordially invited to witness a love story unfold 🤍",
];

const DEFAULT_OG_IMAGE = "https://aureainvites.com/og/default.jpg";

function capitalize(str: string): string {
  return str
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function slugFromName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function formatSlug(slug: string): string {
  return capitalize(slug.replace(/-/g, " "));
}

export interface InvitationPreviewInput {
  guestName: string;
  weddingSlug: string;
  mainImageUrl?: string | null;
}

export interface InvitationPreviewData {
  displayName: string;
  title: string;
  description: string;
  imageUrl: string;
  guestSlug: string;
}

export function generateInvitationPreview(
  input: InvitationPreviewInput
): InvitationPreviewData {
  const displayName = capitalize(input.guestName.trim());
  const formattedCouple = formatSlug(input.weddingSlug);
  const title = `${displayName} — ${formattedCouple} Wedding Invitation`;
  const description =
    PREVIEW_DESCRIPTIONS[
      Math.floor(Math.random() * PREVIEW_DESCRIPTIONS.length)
    ];
  const imageUrl = input.mainImageUrl || DEFAULT_OG_IMAGE;
  const guestSlug = slugFromName(input.guestName);

  return { displayName, title, description, imageUrl, guestSlug };
}
