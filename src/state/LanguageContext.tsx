import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations, LanguageCode } from '../i18n/translations';

interface LanguageContextType {
    language: LanguageCode;
    setLanguage: (lang: LanguageCode) => Promise<void>;
    t: (key: keyof typeof translations.en) => any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
const LANG_STORAGE_KEY = '@app_language';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<LanguageCode>('en');

    useEffect(() => {
        const loadLanguage = async () => {
            const storedLang = await AsyncStorage.getItem(LANG_STORAGE_KEY);
            if (storedLang && (storedLang === 'en' || storedLang === 'az' || storedLang === 'tr')) {
                setLanguageState(storedLang as LanguageCode);
            }
        };
        loadLanguage();
    }, []);

    const setLanguage = async (newLang: LanguageCode) => {
        setLanguageState(newLang);
        await AsyncStorage.setItem(LANG_STORAGE_KEY, newLang);
    };

    const t = (key: keyof typeof translations.en) => {
        return translations[language][key] || translations['en'][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
