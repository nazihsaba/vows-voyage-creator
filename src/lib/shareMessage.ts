/**
 * The message shared with each guest when a link is copied or sent by WhatsApp from Manage Links.
 * Couples can write their own in weddings.field_customizations.share_message, using
 * {guest} for the guest/link name and {link} for the personal invitation link.
 * Empty means: use the default message.
 */
export const SHARE_PLACEHOLDER_GUEST = "{guest}";
export const SHARE_PLACEHOLDER_LINK = "{link}";

const parse = (customizations: unknown): Record<string, unknown> => {
  let parsed: unknown = customizations;
  if (typeof customizations === "string") {
    try {
      parsed = JSON.parse(customizations || "{}");
    } catch {
      return {};
    }
  }
  return typeof parsed === "object" && parsed !== null ? (parsed as Record<string, unknown>) : {};
};

export function getShareMessage(customizations: unknown): string {
  const value = parse(customizations).share_message;
  return typeof value === "string" ? value.trim() : "";
}

/** The default message, written with placeholders so couples can start editing from it. */
export function defaultShareMessage(groomName?: string | null, brideName?: string | null): string {
  return `${SHARE_PLACEHOLDER_LINK}\n\nDear ${SHARE_PLACEHOLDER_GUEST},\n\nWith love and joy, we — *${groomName || ""} & ${brideName || ""}* — invite you to celebrate our happily ever after! ❤️\n\nWe would be honored to have you with us on this special day. ✨\n\nWe can't wait to see you!`;
}

/**
 * Fill {guest} and {link}. If the couple left out {link}, the link goes first so WhatsApp
 * still shows the invitation preview and guests can open it.
 */
export function fillShareMessage(template: string, guest: string, link: string): string {
  let message = template.split(SHARE_PLACEHOLDER_GUEST).join(guest);
  if (message.includes(SHARE_PLACEHOLDER_LINK)) {
    message = message.split(SHARE_PLACEHOLDER_LINK).join(link);
  } else {
    message = `${link}\n\n${message}`;
  }
  return message;
}

export function withShareMessage(customizations: unknown, message: string): Record<string, unknown> {
  const next = { ...parse(customizations) };
  const trimmed = message.trim();
  if (trimmed) next.share_message = trimmed;
  else delete next.share_message;
  return next;
}
