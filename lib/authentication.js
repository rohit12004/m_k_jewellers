import { jwtVerify } from "jose"
import { cookies, headers } from "next/headers"

export const isAuthenticated = async (role) => {
    try {
        const cookieStore = await cookies();
        let token;

        if (cookieStore.has('access_token')) {
            token = cookieStore.get('access_token').value;
        } else {
            const headersList = await headers();
            const authHeader = headersList.get('authorization');
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.split(' ')[1];
            }
        }

        if (!token) {
            return {
                isAuth: false,
            }
        }

        const { payload } = await jwtVerify(
            token,
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
        let token;

        if (cookieStore.has('access_token')) {
            token = cookieStore.get('access_token').value;
        } else {
            const headersList = await headers();
            const authHeader = headersList.get('authorization');
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.split(' ')[1];
            }
        }

        if (!token) {
            return null
        }

        const { payload } = await jwtVerify(
            token,
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