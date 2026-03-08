import { getAuthData } from '../storage/authStorage';

const BASE_URL = 'http://192.168.1.64:5232';

interface RequestOptions extends RequestInit {
    // Custom options can be added here if needed
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}, auth: boolean = false): Promise<T> {
    const url = `${BASE_URL}${path}`;

    const headers: Record<string, string> = {
        Accept: '*/*',
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (auth) {
        const session = await getAuthData();
        if (session && session.token) {
            headers.Authorization = `Bearer ${session.token}`;
        }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    let response;
    try {
        response = await fetch(url, {
            ...options,
            headers,
            signal: controller.signal,
        });
    } catch (error: any) {
        if (error.name === 'AbortError') {
            throw new Error('Network request timed out. Please check your connection and the BASE_URL.');
        }
        throw new Error(`Network request failed: ${error.message || 'Check your connection'}`);
    } finally {
        clearTimeout(timeoutId);
    }

    // Handle generic non-2xx responses
    if (!response.ok) {
        let errorMessage = 'An unexpected error occurred';
        try {
            const errorData = await response.json();
            // Adjust based on how your .NET backend structures errors.
            // E.g., ValidationProblemDetails returns errors object or message array
            errorMessage = errorData.message || errorData.title || JSON.stringify(errorData.errors) || `Error ${response.status}`;
        } catch {
            errorMessage = `HTTP Error ${response.status}`;
        }
        throw new Error(errorMessage);
    }

    const text = await response.text();
    // Sometimes API returns 200/204 with no content
    if (!text) {
        return {} as T;
    }

    return JSON.parse(text) as T;
}
