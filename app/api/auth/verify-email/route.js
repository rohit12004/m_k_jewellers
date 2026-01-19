import { catchError, response } from "@/lib/helperFunction"
import { findUserById, updateUserEmailVerifiedStatus } from "@/lib/user.service"
import { jwtVerify, SignJWT } from "jose"
import { cookies } from "next/headers"
import { generateRefreshToken, saveRefreshToken } from "@/lib/refreshToken.service"

export async function POST(request) {
    try {
        const { token } = await request.json()

        if (!token) {
            return response(false, 400, "Invalid or Missing Token")
        }

        const secret = new TextEncoder().encode(process.env.SECRET_KEY)
        const decoded = await jwtVerify(token, secret)

        const userId = decoded.payload.id

        const user = await findUserById(userId)

        if (!user) {
            return response(false, 404, "User not found")
        }

        if (user.isEmailVerified) {
            return response(true, 200, "Email verified successfully", { isAlreadyVerified: true })
        }

        // Update email verification status
        await updateUserEmailVerifiedStatus(userId)

        // Create user data for tokens
        const loggedInUserData = {
            id: user.id,
            role: user.role,
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            avatarUrl: user.avatarUrl,
        }

        // Generate Access Token (15 minutes) - Industry standard
        const accessToken = await new SignJWT(loggedInUserData)
            .setIssuedAt()
            .setExpirationTime('15m') // Short-lived
            .setProtectedHeader({ alg: 'HS256' })
            .sign(secret)

        // Generate Refresh Token (30 days)
        const refreshToken = generateRefreshToken()
        const refreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

        // Get user agent and IP for tracking
        const userAgent = request.headers.get('user-agent')
        const ipAddress = request.headers.get('x-forwarded-for') || request.ip

        // Save refresh token to database
        await saveRefreshToken(
            user.id,
            refreshToken,
            refreshTokenExpiry,
            userAgent,
            ipAddress
        )

        const cookieStore = await cookies()

        // Set access token cookie (web)
        cookieStore.set({
            name: "access_token",
            value: accessToken,
            httpOnly: true,
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60, // 15 minutes
        })

        // Set refresh token cookie (web)
        cookieStore.set({
            name: "refresh_token",
            value: refreshToken,
            httpOnly: true,
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60, // 30 days
        })

        // Return tokens for mobile app
        return response(true, 200, "Email verified successfully! You are now logged in.", {
            ...loggedInUserData,
            token: accessToken, // For mobile deep link compatibility
            accessToken,
            refreshToken,
        })
    } catch (error) {
        return catchError(error)
    }
}
