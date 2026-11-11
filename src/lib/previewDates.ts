/** Future sample dates for previews only; real invitations keep their saved dates. */
export function getPreviewDates(now = new Date()) {
  const weddingDate = new Date(now.getTime() + 90 * 86400000 + 8 * 3600000 + 37 * 60000 + 45000);
  const rsvpDeadline = new Date(weddingDate.getTime() - 15 * 86400000);
  const localDate = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  return {
    weddingDate,
    rsvpDeadline,
    weddingDateString: localDate(weddingDate),
    rsvpDeadlineString: localDate(rsvpDeadline),
    weddingDateLabel: weddingDate.toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric",
    }),
    shortDateLabel: weddingDate.toLocaleDateString("en-GB", { day: "numeric", month: "long" }),
  };
}