/**
 * Converts a time string like "18:00:00" or "18:00" to "6:00 PM" format.
 * If already in 12-hour format or invalid, returns as-is.
 */
/**
 * Adds minutes to a time string like "18:00:00" or "18:00" and returns the new time in the same format.
 */
export const addMinutesToTime = (time: string | null | undefined, minutes: number): string => {
  if (!time) return "";
  const match = time.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return time;
  const date = new Date(2000, 0, 1, parseInt(match[1], 10), parseInt(match[2], 10));
  date.setMinutes(date.getMinutes() + minutes);
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
};

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
