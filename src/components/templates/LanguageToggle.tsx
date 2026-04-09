import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

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
      className={`fixed top-4 left-4 z-50 flex items-center gap-2 h-9 pl-2.5 pr-1 rounded-full backdrop-blur-xl bg-black/60 text-white shadow-lg border border-white/10 hover:bg-black/70 transition-all duration-300 ${className}`}
      aria-label="Switch language"
    >
      <Globe className="w-3.5 h-3.5 opacity-70" />
      <div className="relative flex items-center bg-white/10 rounded-full p-0.5">
        <div
          className={`absolute h-6 w-9 rounded-full bg-white/20 shadow-sm transition-transform duration-300 ease-out ${
            isArabic ? 'translate-x-9' : 'translate-x-0'
          }`}
        />
        <span
          className={`relative z-10 w-9 text-center text-xs font-semibold py-1 rounded-full transition-colors duration-300 ${
            !isArabic ? 'text-white' : 'text-white/50'
          }`}
        >
          EN
        </span>
        <span
          className={`relative z-10 w-9 text-center text-xs font-semibold py-1 rounded-full transition-colors duration-300 ${
            isArabic ? 'text-white' : 'text-white/50'
          }`}
        >
          AR
        </span>
      </div>
    </button>
  );
};

export default LanguageToggle;
