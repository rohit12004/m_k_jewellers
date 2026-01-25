import { catchError, response } from "@/lib/helperFunction"
import { deleteOTPByEmail, verifyOTP } from "@/lib/otp.service"
import { findUserByEmail } from "@/lib/user.service"
import { zSchema } from "@/lib/zodSchema"
import { SignJWT } from "jose"
import { cookies } from "next/headers"
import { generateRefreshToken, saveRefreshToken } from "@/lib/refreshToken.service"

export async function POST(request) {
    try {
        const payload = await request.json()

        const validationSchema = zSchema.pick({
            otp: true, email: true
        })

        const validatedData = validationSchema.safeParse(payload)
        if (!validatedData.success) {
            return response(false, 401, "Invalid or Missing Data", validatedData.error)
        }

        const { email, otp } = validatedData.data

        const getOtpData = await verifyOTP(email, otp)

        if (!getOtpData.success) {
            return response(false, 404, 'Invalid or expired OTP', validatedData.error)
        }

        const getUser = await findUserByEmail(email)
        if (!getUser) {
            return response(false, 404, 'User not found')
        }

        const loggedInUserData = {
            id: getUser.id,
            role: getUser.role,
            name: getUser.name,
            email: getUser.email,
            phone: getUser.phone,
            address: getUser.address,
            avatarUrl: getUser.avatarUrl,
        }

        const secret = new TextEncoder().encode(process.env.SECRET_KEY)

        // Generate Access Token (1 day)
        const accessToken = await new SignJWT(loggedInUserData)
            .setIssuedAt()
            .setExpirationTime('1d') // 1 day for better UX
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
            getUser.id,
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
            maxAge: 24 * 60 * 60, // 1 day
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

        // Remove OTP
        await deleteOTPByEmail(email)

        // Return both tokens for mobile
        return response(true, 200, "Login successfully", {
            ...loggedInUserData,
            accessToken,
            refreshToken, // Mobile will store this
        })

    } catch (error) {
        return catchError(error)
    }
}
