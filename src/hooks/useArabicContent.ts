import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';

/**
 * Hook that provides a function to get dynamic content 
 * in the current language (EN or AR) from field_customizations.arabic
 */
export const useArabicContent = (wedding: any) => {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const arabicData = wedding?.field_customizations?.arabic || {};

  const hasArabic = Object.keys(arabicData).length > 0;

  /** 
   * Returns Arabic value if language is AR and Arabic data exists for that key,
   * otherwise returns the fallback (English) value.
   */
  const getLocalizedValue = useCallback(
    (arabicKey: string, fallbackValue: string): string => {
      if (isArabic && arabicData[arabicKey]) {
        return arabicData[arabicKey];
      }
      return fallbackValue;
    },
    [isArabic, arabicData]
  );

  /**
   * Format a family name according to wedding.field_customizations.family_name_format.
   * - "family" (default): "{name} Family" / "عائلة {name}"
   * - "mr_mrs": "Mr. & Mrs. {name}" / "السيد والسيدة {name}"
   * - "none": just "{name}" (uses what user typed)
   */
  const formatFamily = useCallback(
    (arabicKey: string, fallbackName: string): string => {
      const name = isArabic && arabicData[arabicKey] ? arabicData[arabicKey] : fallbackName;
      const format = wedding?.field_customizations?.family_name_format || "family";
      const t = (key: string, opts: any) => {
        if (key === "family.theFamily") {
          return isArabic ? `عائلة ${opts.name}` : `${opts.name} Family`;
        }
        if (key === "family.mrAndMrs") {
          return isArabic ? `السيد والسيدة ${opts.name}` : `Mr. & Mrs. ${opts.name}`;
        }
        return opts.name;
      };
      if (format === "mr_mrs") return t("family.mrAndMrs", { name });
      if (format === "none") return name;
      return t("family.theFamily", { name });
    },
    [isArabic, arabicData, wedding?.field_customizations?.family_name_format],
  );

  return { isArabic, hasArabic, getLocalizedValue, formatFamily };
};
