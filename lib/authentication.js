import { jwtVerify } from "jose"
import { cookies } from "next/headers"

export const isAuthenticated = async (role) => {
    try {
        const cookieStore = await cookies();
        // console.log('cookieStore',cookieStore)
        if (!cookieStore.has('access_token')) {
            return {
                isAuth: false,
            }
        }

        const access_token = cookieStore.get('access_token');
        // console.log('access_token',access_token)

        const { payload } = await jwtVerify(
            access_token.value,
            new TextEncoder().encode(process.env.SECRET_KEY)
        )

        if (payload.role !== role) {
            return {
                isAuth: false,
            }
        }

        return {
            isAuth: true,
            userId: payload.userId,
        }
    } catch (error) {
        return { isAuth: false };
    }
}

/**
 * Get user session from JWT token
 * @returns {Object|null} User session data or null if not authenticated
 */
export const getUserSession = async () => {
    try {
        const cookieStore = await cookies();

        if (!cookieStore.has('access_token')) {
            return null
        }

        const access_token = cookieStore.get('access_token');

        const { payload } = await jwtVerify(
            access_token.value,
            new TextEncoder().encode(process.env.SECRET_KEY)
        )

        return {
            userId: payload.id,  // JWT stores as 'id', return as 'userId'
            email: payload.email,
            role: payload.role,
            name: payload.name,
            phone: payload.phone,
            address: payload.address,
            avatarUrl: payload.avatarUrl
        }
    } catch (error) {
        return null
    }
}