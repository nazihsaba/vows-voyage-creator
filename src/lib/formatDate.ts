/**
 * Localized date formatting with Levantine (Lebanese) Arabic month names.
 *
 * When isArabic is true, we replace the standard MSA month name produced by
 * Intl.DateTimeFormat (e.g. "أغسطس") with the Levantine/Syriac calendar name
 * commonly used in Lebanon (e.g. "آب").
 */

const LEVANTINE_MONTHS_AR: Record<number, string> = {
  0: "كانون الثاني",
  1: "شباط",
  2: "آذار",
  3: "نيسان",
  4: "أيار",
  5: "حزيران",
  6: "تموز",
  7: "آب",
  8: "أيلول",
  9: "تشرين الأول",
  10: "تشرين الثاني",
  11: "كانون الأول",
};

export const formatLocalizedDate = (
  date: Date,
  options: Intl.DateTimeFormatOptions,
  isArabic: boolean,
): string => {
  if (!isArabic) {
    return date.toLocaleDateString("en-US", options);
  }

  const locale = "ar-SA-u-ca-gregory";
  // If month isn't part of the requested options, just return the standard format.
  if (!options.month) {
    return date.toLocaleDateString(locale, options);
  }

  try {
    const parts = new Intl.DateTimeFormat(locale, options).formatToParts(date);
    const levantine = LEVANTINE_MONTHS_AR[date.getMonth()];
    return parts
      .map((p) => (p.type === "month" ? levantine : p.value))
      .join("");
  } catch {
    return date.toLocaleDateString(locale, options);
  }
};
