import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeContextType {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = 'sg_theme_preference';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

    useEffect(() => {
        
        const loadTheme = async () => {
            try {
                const value = await AsyncStorage.getItem(THEME_KEY);
                if (value !== null) {
                    setIsDarkMode(value === 'dark');
                }
            } catch (e) {
                console.error('Failed to load theme preference', e);
            }
        };
        loadTheme();
    }, []);

    const toggleDarkMode = async () => {
        try {
            const newMode = !isDarkMode;
            setIsDarkMode(newMode);
            await AsyncStorage.setItem(THEME_KEY, newMode ? 'dark' : 'light');
        } catch (e) {
            console.error('Failed to save theme preference', e);
        }
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
