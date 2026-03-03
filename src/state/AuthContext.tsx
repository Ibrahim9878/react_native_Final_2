import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuthData, saveAuthData, clearAuthData, UserSession } from '../storage/authStorage';

interface AuthContextType {
    session: UserSession | null;
    isLoading: boolean;
    login: (sessionData: UserSession) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSessionState] = useState<UserSession | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const loadUser = async () => {
            try {
                const s = await getAuthData();
                if (isMounted) {
                    setSessionState(s);
                }
            } catch (error) {
                console.error("Failed to load session:", error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };
        loadUser();
        return () => { isMounted = false; };
    }, []);

    const login = async (sessionData: UserSession) => {
        await saveAuthData(sessionData);
        setSessionState(sessionData);
    };

    const logout = async () => {
        await clearAuthData();
        setSessionState(null);
    };

    return (
        <AuthContext.Provider value={{ session, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
}
