import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enTranslations from '../locales/en.json';
import frTranslations from '../locales/fr.json';

const resources = {
  en: {
    translation: enTranslations
  },
  fr: {
    translation: frTranslations
  }
};

// Fonction pour obtenir la langue depuis localStorage de manière sûre
const getStoredLanguage = () => {
  try {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('language') || 'fr';
    }
  } catch (error) {
    console.warn('Could not access localStorage:', error);
  }
  return 'fr';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getStoredLanguage(),
    fallbackLng: 'fr',
    debug: false,
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  });

export default i18n;