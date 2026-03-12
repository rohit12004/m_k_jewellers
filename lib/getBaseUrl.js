import { headers } from 'next/headers';

export const getBaseUrl = async () => {
    // 1. Client-side: use relative path
    if (typeof window !== 'undefined') return '';

    // 2. Try to get host from headers (most reliable for server-side requests)
    try {
        const headerList = await headers();
        const host = headerList.get('host');
        if (host) {
            const protocol = host.includes('localhost') ? 'http' : 'https';
            return `${protocol}://${host}`;
        }
    } catch (e) {
        // headers() might throw during build or outside a request context
    }

    // 3. Prioritize explicitly defined environment variable
    if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;

    // 4. Fallback to Vercel deployment URL
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

    // 5. Ultimate fallback to localhost
    return 'http://localhost:3000';
};
