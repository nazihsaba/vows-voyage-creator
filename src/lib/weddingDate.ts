/**
 * Timezone-safe wedding date helpers.
 *
 * Why this exists:
 *  - `weddings.wedding_date` is a Postgres `DATE` and arrives as a "YYYY-MM-DD" string.
 *  - `new Date("YYYY-MM-DD")` is parsed as UTC midnight, so viewers in the Americas
 *    see the *previous* day in their local time. Same for the countdown.
 *
 * Conventions:
 *  - Display dates are parsed as the viewer's local date (no UTC shift),
 *    so the printed "Aug 16" is always Aug 16 everywhere on Earth.
 *  - Countdown anchors the event to its wall-clock time in Lebanon (Asia/Beirut),
 *    falling back to 19:00 if no ceremony time is provided.
 */

export const WEDDING_TZ = "Asia/Beirut";

/** Parse "YYYY-MM-DD" as a Date in the viewer's local timezone (no UTC shift). */
export const parseLocalDate = (
  input: string | Date | null | undefined,
): Date => {
  if (!input) return new Date(NaN);
  if (input instanceof Date) return input;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(input);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return new Date(input);
};

/**
 * Build a Date representing `dateStr` + `time` interpreted in Asia/Beirut.
 * Returns an absolute instant in time, so countdowns are correct from any timezone.
 */
export const beirutWallClockToDate = (
  dateStr: string,
  time: string = "19:00:00",
): Date => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr || "");
  if (!m) return new Date(dateStr);
  const [, ys, ms, ds] = m;
  const [hh = "19", mm = "00", ss = "00"] = (time || "19:00:00").split(":");
  const utcGuess = Date.UTC(+ys, +ms - 1, +ds, +hh, +mm, +ss);
  // Compute the offset Asia/Beirut had at that wall-clock moment.
  const beirutLocal = new Date(utcGuess).toLocaleString("en-US", {
    timeZone: WEDDING_TZ,
  });
  const offset = utcGuess - new Date(beirutLocal).getTime();
  return new Date(utcGuess + offset);
};

/**
 * Resolve the countdown target for a wedding.
 * - "YYYY-MM-DD" → Asia/Beirut ceremony time (defaults to 19:00).
 * - Anything with an explicit time/Date is returned as-is.
 */
export const getCountdownTarget = (
  input: string | Date | null | undefined,
  ceremonyTime?: string | null,
): Date => {
  if (!input) return new Date(NaN);
  if (input instanceof Date) return input;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input);
  if (m) return beirutWallClockToDate(input, ceremonyTime || "19:00:00");
  return new Date(input);
};
