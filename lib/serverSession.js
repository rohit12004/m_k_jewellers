import { cookies } from "next/headers";
import { jwtVerify } from "jose";

/**
 * Server-side session check
 * Use this in Server Components to get user session without API calls
 * 
 * @returns {Promise<Object|null>} User session data or null
 */
export async function getServerSession() {
    try {
        const cookieStore = await cookies();

        if (!cookieStore.has('access_token')) {
            return null;
        }

        const token = cookieStore.get('access_token').value;

        const { payload } = await jwtVerify(
            token,
            new TextEncoder().encode(process.env.SECRET_KEY)
        );

        return {
            userId: payload.id,
            email: payload.email,
            role: payload.role,
            name: payload.name,
            phone: payload.phone,
            address: payload.address,
            avatarUrl: payload.avatarUrl
        };
    } catch (error) {
        // Token expired or invalid
        return null;
    }
}

/**
 * Check if user is authenticated (server-side)
 * @returns {Promise<boolean>}
 */
export async function isServerAuthenticated() {
    const session = await getServerSession();
    return session !== null;
}

/**
 * Get user role (server-side)
 * @returns {Promise<string|null>} 'admin' | 'user' | null
 */
export async function getServerUserRole() {
    const session = await getServerSession();
    return session?.role || null;
}
