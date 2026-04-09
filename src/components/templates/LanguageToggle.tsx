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
      className={`fixed top-4 left-4 z-50 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md bg-white/80 text-foreground shadow-md border border-border/50 hover:bg-white transition-colors ${className}`}
      aria-label="Switch language"
    >
      <span className={`transition-opacity ${isArabic ? 'opacity-50' : 'opacity-100'}`}>EN</span>
      <span className="text-muted-foreground">/</span>
      <span className={`transition-opacity ${isArabic ? 'opacity-100' : 'opacity-50'}`}>AR</span>
    </button>
  );
};

export default LanguageToggle;
