import { useTranslation } from 'react-i18next';

interface LanguageToggleProps {
  className?: string;
}

const LanguageToggle = ({ className = '' }: LanguageToggleProps) => {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const toggle = () => {
    const newLang = isArabic ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <button
      onClick={toggle}
      className={`fixed bottom-4 right-4 z-50 rounded-full p-[3px] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.12)] backdrop-blur-2xl transition-all duration-300 hover:shadow-[0_6px_32px_rgba(0,0,0,0.18)] hover:scale-[1.03] active:scale-[0.97] ${className}`}
      dir="ltr"
      aria-label="Switch language"
    >
      <div className="relative flex items-center bg-white rounded-full overflow-hidden">
        {/* Sliding active indicator */}
        <div
          className={`absolute top-0 bottom-0 w-1/2 rounded-full bg-gray-200 transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            isArabic ? 'left-1/2' : 'left-0'
          }`}
        />
        <span
          className={`relative z-10 w-[60px] text-center text-[11px] font-medium py-2 tracking-wide transition-all duration-300 ${
            !isArabic ? 'text-gray-700' : 'text-gray-400'
          }`}
        >
          English
        </span>
        <span
          className={`relative z-10 w-[60px] text-center text-[11px] font-medium py-2 transition-all duration-300 ${
            isArabic ? 'text-gray-700' : 'text-gray-400'
          }`}
          style={{ fontFamily: isArabic ? 'inherit' : undefined }}
        >
          عربي
        </span>
      </div>
    </button>
  );
};

export default LanguageToggle;
