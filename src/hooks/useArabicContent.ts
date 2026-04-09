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

  return { isArabic, hasArabic, getLocalizedValue };
};
