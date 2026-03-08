import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_KEY = 'App_Auth_Session';

export interface UserSession {
    token: string;
    userType: number;
    email: string;
    createdAt: number;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    age?: number;
    profileImage?: string;
}

/**
 * Saves both session and token centrally.
 */
export async function saveAuthData(sessionData: UserSession): Promise<void> {
    try {
        await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(sessionData));
    } catch (error) {
        console.error('Failed to save auth data', error);
    }
}

/**
 * Retrieves the unified auth session.
 */
export async function getAuthData(): Promise<UserSession | null> {
    try {
        const data = await AsyncStorage.getItem(AUTH_KEY);
        if (data) {
            return JSON.parse(data) as UserSession;
        }
        return null;
    } catch (error) {
        console.error('Failed to retrieve auth data', error);
        return null;
    }
}

/**
 * Clears the auth session completely on logout.
 */
export async function clearAuthData(): Promise<void> {
    try {
        await AsyncStorage.removeItem(AUTH_KEY);
    } catch (error) {
        console.error('Failed to clear auth data', error);
    }
}
