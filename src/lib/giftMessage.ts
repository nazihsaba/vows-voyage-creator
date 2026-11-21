/**
 * The couple's own sentence above the gift cards, set in the form and stored in
 * weddings.field_customizations.gift_message (its Arabic version in field_customizations.arabic.gift_message).
 * Empty means: use the template's default sentence.
 */
export function getGiftMessage(customizations: unknown): string {
  let parsed: unknown = customizations;
  if (typeof customizations === "string") {
    try {
      parsed = JSON.parse(customizations || "{}");
    } catch {
      return "";
    }
  }
  if (typeof parsed !== "object" || parsed === null) return "";
  const value = (parsed as Record<string, unknown>).gift_message;
  return typeof value === "string" ? value.trim() : "";
}
