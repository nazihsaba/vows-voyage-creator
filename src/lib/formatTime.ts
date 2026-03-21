/**
 * Converts a time string like "18:00:00" or "18:00" to "6:00 PM" format.
 * If already in 12-hour format or invalid, returns as-is.
 */
export const formatTimeTo12Hour = (time: string | null | undefined): string => {
  if (!time) return "";
  
  // Check if already in 12-hour format (contains AM/PM)
  if (/am|pm/i.test(time)) return time;

  const match = time.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return time;

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = hours >= 12 ? "PM" : "AM";
  
  if (hours === 0) hours = 12;
  else if (hours > 12) hours -= 12;

  return `${hours}:${minutes} ${period}`;
};
