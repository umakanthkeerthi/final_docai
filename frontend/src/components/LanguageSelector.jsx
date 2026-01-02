import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSelector = ({ variant = 'default' }) => {
    const { i18n } = useTranslation();
    const currentLang = i18n.language || 'en';

    // Change language using react-i18next
    const changeLanguage = (langCode) => {
        i18n.changeLanguage(langCode);

        // Also trigger Google Translate for dynamic content
        const select = document.querySelector('.goog-te-combo');
        if (select) {
            select.value = langCode;
            select.dispatchEvent(new Event('change', { bubbles: true }));
        }
    };

    // Styles based on variant
    const containerStyle = variant === 'minimal'
        ? { display: 'flex', gap: '8px' }
        : { display: 'flex', gap: '8px', background: '#F7FAFC', padding: '4px', borderRadius: '8px', width: 'fit-content' };

    const btnStyle = (lang) => ({
        border: 'none',
        background: currentLang === lang ? '#FFFFFF' : 'transparent',
        padding: '6px 12px',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        color: currentLang === lang ? '#00879E' : '#718096',
        boxShadow: currentLang === lang ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
        transition: 'all 0.2s'
    });

    return (
        <div className="language-selector" style={containerStyle}>
            <button onClick={() => changeLanguage('en')} style={btnStyle('en')}>English</button>
            <button onClick={() => changeLanguage('te')} style={btnStyle('te')}>తెలుగు</button>
            <button onClick={() => changeLanguage('hi')} style={btnStyle('hi')}>हिंदी</button>
        </div>
    );
};

export default LanguageSelector;
