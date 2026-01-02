# Multilingual Feature Implementation

## Overview
The application now supports **three languages**:
- **English (en)** - Default
- **Telugu (te)** - తెలుగు
- **Hindi (hi)** - हिंदी

## Implementation Details

### Technology Stack
- **react-i18next** - React internationalization framework
- **i18next** - Core i18n library
- **i18next-browser-languagedetector** - Automatic language detection
- **Google Translate** - Fallback for dynamic content

### Architecture

#### 1. Translation Files
Located in `frontend/src/locales/`:
- `en.json` - English translations
- `te.json` - Telugu translations
- `hi.json` - Hindi translations

Each file contains organized translation keys for:
- Common UI elements
- Authentication forms
- Navigation labels
- Home view content
- Profile information
- And more...

#### 2. i18n Configuration
File: `frontend/src/i18n.js`

Features:
- Automatic language detection from browser/localStorage
- Fallback to English if selected language unavailable
- Persistent language selection via localStorage

#### 3. Language Selector Component
File: `frontend/src/components/LanguageSelector.jsx`

Features:
- Clean, minimal UI
- Syncs with both react-i18next and Google Translate
- Displays language names in native scripts
- Persistent selection across sessions

### Components Updated

The following components now support multilingual content:

1. **HomeView** - Greetings, symptom input, action cards
2. **Layout** - Navigation labels (desktop & mobile)
3. **AuthView** - Login/signup forms, error messages
4. **LanguageSelector** - Language switching interface

### Usage in Components

```javascript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('home.greeting', { name: 'User' })}</h1>
      <p>{t('home.subtitle')}</p>
    </div>
  );
}
```

### Adding New Translations

1. Add the key-value pair to all three language files:
   - `frontend/src/locales/en.json`
   - `frontend/src/locales/te.json`
   - `frontend/src/locales/hi.json`

2. Use the translation in your component:
   ```javascript
   {t('yourSection.yourKey')}
   ```

### Language Detection Priority

1. **localStorage** - Previously selected language
2. **Browser language** - User's browser preference
3. **Fallback** - English (en)

### Google Translate Integration

The app maintains Google Translate integration as a fallback for:
- Dynamic content from API responses
- User-generated content
- Content not yet translated

The LanguageSelector component syncs both systems for seamless experience.

### Testing

To test different languages:
1. Click the language selector in the top-right corner
2. Select your preferred language (English/తెలుగు/हिंदी)
3. The interface will immediately update
4. Language preference is saved and persists across sessions

### Future Enhancements

To add more components with multilingual support:
1. Import `useTranslation` hook
2. Add translation keys to all three JSON files
3. Replace hardcoded text with `t('key')` calls

### Notes

- All translation files are excluded from gitignore via `!**/locales/*.json`
- The system supports interpolation for dynamic values (e.g., user names)
- RTL (Right-to-Left) languages can be added with additional configuration
- Translation keys use dot notation for organization (e.g., `auth.errors.wrongPassword`)

## Dependencies

```json
{
  "react-i18next": "^latest",
  "i18next": "^latest",
  "i18next-browser-languagedetector": "^latest"
}
```

## File Structure

```
frontend/
├── src/
│   ├── locales/
│   │   ├── en.json
│   │   ├── te.json
│   │   └── hi.json
│   ├── i18n.js
│   ├── components/
│   │   ├── LanguageSelector.jsx
│   │   ├── HomeView.jsx
│   │   ├── Layout.jsx
│   │   └── AuthView.jsx
│   └── main.jsx (imports i18n)
```

## Maintenance

When adding new features:
1. Always add translations for all three languages
2. Use meaningful, hierarchical key names
3. Test in all three languages before deployment
4. Keep translation files in sync
