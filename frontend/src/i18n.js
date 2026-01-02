import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import te from './locales/te.json';
import hi from './locales/hi.json';

const resources = {
    en: { translation: en },
    te: { translation: te },
    hi: { translation: hi }
};

i18n
    .use(LanguageDetector) // Detects user language
    .use(initReactI18next) // Passes i18n down to react-i18next
    .init({
        resources,
        fallbackLng: 'en', // Use English if detected language is not available
        supportedLngs: ['en', 'te', 'hi'],

        interpolation: {
            escapeValue: false // React already escapes values
        },

        detection: {
            // Order of language detection
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
            lookupLocalStorage: 'i18nextLng'
        }
    });

export default i18n;
