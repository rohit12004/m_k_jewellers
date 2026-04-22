import { catchError, response } from "@/lib/helperFunction";
import { getUserSession } from "@/lib/authentication";
import { cookies, headers } from "next/headers";
import { findRefreshToken, rotateRefreshToken } from "@/lib/refreshToken.service";
import { SignJWT } from "jose";

export async function GET(request) {
    try {
        // Try to get user session from access token
        const session = await getUserSession();

        if (session) {
            // Access token is valid, return session
            return response(true, 200, 'Session retrieved', session);
        }

        // Access token is missing or expired, check for refresh token
        const cookieStore = await cookies();
        const headersList = await headers();
        let refreshToken = cookieStore.get('refresh_token')?.value;

        // If no cookie, check headers (for mobile/native clients)
        if (!refreshToken) {
            refreshToken = headersList.get('x-refresh-token');
        }

        if (!refreshToken) {
            // No refresh token, user needs to login
            return response(false, 401, 'No active session');
        }

        // Validate refresh token in database
        const tokenData = await findRefreshToken(refreshToken);

        if (!tokenData) {
            // Refresh token not found in DB (revoked or invalid)
            return response(false, 401, 'Invalid session');
        }

        // Check if refresh token is expired
        if (new Date() > tokenData.expiresAt) {
            return response(false, 401, 'Session expired');
        }

        // Refresh token is valid, generate new access token
        const user = tokenData.user;
        const userData = {
            id: user.id,
            role: user.role,
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            avatarUrl: user.avatarUrl,
        };

        // Generate new access token
        const secret = new TextEncoder().encode(process.env.SECRET_KEY);
        const newAccessToken = await new SignJWT(userData)
            .setIssuedAt()
            .setExpirationTime('15m')
            .setProtectedHeader({ alg: 'HS256' })
            .sign(secret);

        // Rotate refresh token for security
        const newRefreshToken = await rotateRefreshToken(refreshToken);

        // Update cookies
        cookieStore.set({
            name: "access_token",
            value: newAccessToken,
            httpOnly: true,
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60, // 15 minutes
        });

        cookieStore.set({
            name: "refresh_token",
            value: newRefreshToken,
            httpOnly: true,
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60, // 30 days
        });

        // Return session data. For mobile clients, we also return the new tokens in the body.
        const isMobile = !!headersList.get('x-refresh-token');

        return response(true, 200, 'Session restored', {
            ...userData,
            ...(isMobile && { accessToken: newAccessToken, refreshToken: newRefreshToken })
        });

    } catch (error) {
        console.error("❌ [SESSION API] Error:", error);
        return catchError(error);
    }
}
