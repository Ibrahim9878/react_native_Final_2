import { apiRequest } from './client';

export type RegisterRequest = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber: string;
    age: number;
    userType: number; // usually 1 for standard user
};

export type LoginRequest = {
    email: string;
    password: string;
};

export type LoginResponse = {
    token: string;
    refreshToken?: string;
    // include other fields if your API returns them
};

/**
 * Registers a new user.
 */
export async function registerUser(data: RegisterRequest): Promise<void> {
    return apiRequest<void>('/api/Auth/Register', {
        method: 'POST',
        body: JSON.stringify(data),
    }, false);
}

/**
 * Authenticates a user and returns their JWT.
 */
export async function loginUser(data: LoginRequest): Promise<LoginResponse> {
    return apiRequest<LoginResponse>('/api/Auth/Login', {
        method: 'POST',
        body: JSON.stringify(data),
    }, false);
}
