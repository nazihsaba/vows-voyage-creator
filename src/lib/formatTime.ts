/**
 * Formats a time string (e.g. "18:00:00", "18:00", "6:00 PM") to 12-hour format (e.g. "6:00 PM").
 * If already in 12-hour format or unparseable, returns the original string.
 */
export function formatTimeTo12Hour(time: string | null | undefined): string {
  if (!time) return "";
  
  // Already in 12-hour format
  if (/[APap][Mm]/.test(time)) return time;

  const match = time.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return time;

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `${hours}:${minutes} ${period}`;
}
