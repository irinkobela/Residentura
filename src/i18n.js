import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ka from './locales/ka.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ka: {
        translation: ka,
      },
    },
    lng: 'ka',
    fallbackLng: 'ka',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
