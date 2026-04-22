import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { cookies, headers } from "next/headers";
import { findRefreshToken, rotateRefreshToken } from "@/lib/refreshToken.service";
import { response, catchError } from "@/lib/helperFunction";

export async function POST(request) {
    try {
        const cookieStore = await cookies();
        const headersList = await headers();
        let refreshToken = cookieStore.get('refresh_token')?.value;

        // 1. Try to get from headers (for mobile/middleware)
        if (!refreshToken) {
            refreshToken = headersList.get('x-refresh-token');
        }

        // 2. Try to get from body (fallback for some mobile implementations)
        if (!refreshToken) {
            try {
                const body = await request.json();
                refreshToken = body.refreshToken;
            } catch (e) {
                // Body is not JSON or empty, ignore
            }
        }

        if (!refreshToken) {
            return response(false, 401, "Refresh token required");
        }

        // Find refresh token in database
        const tokenData = await findRefreshToken(refreshToken);

        if (!tokenData) {
            return response(false, 401, "Invalid refresh token");
        }

        // Check if token is expired
        if (new Date() > tokenData.expiresAt) {
            return response(false, 401, "Refresh token expired");
        }

        // Get user data
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

        // Generate new access token (15 minutes)
        const secret = new TextEncoder().encode(process.env.SECRET_KEY);
        const newAccessToken = await new SignJWT(userData)
            .setIssuedAt()
            .setExpirationTime('15m') // 15 minutes
            .setProtectedHeader({ alg: 'HS256' })
            .sign(secret);

        // Rotate refresh token (security best practice)
        const newRefreshToken = await rotateRefreshToken(refreshToken);

        // Update cookies (web)
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

        // Return new tokens and user data
        return response(true, 200, "Token refreshed successfully", {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            user: userData,
        });

    } catch (error) {
        return catchError(error);
    }
}
