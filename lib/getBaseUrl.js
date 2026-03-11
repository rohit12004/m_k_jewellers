/**
 * Utility to get the base URL of the application.
 * Handles both client-side and server-side environments.
 */
export const getBaseUrl = () => {
    // 1. Client-side: use relative path
    if (typeof window !== 'undefined') return '';

    // 2. Vercel deployment: use VERCEL_URL if NEXT_PUBLIC_BASE_URL is missing
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

    // 3. Fallback: use environment variable or localhost
    // Note: NEXT_PUBLIC_BASE_URL is usually http://localhost:3000 in local .env
    return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
};
