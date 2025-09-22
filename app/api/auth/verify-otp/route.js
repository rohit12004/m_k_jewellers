import { catchError, response } from "@/lib/helperFunction"
import { deleteOTPByEmail, verifyOTP } from "@/lib/otp.service"
import { findUserByEmail } from "@/lib/user.service"
import { zSchema } from "@/lib/zodSchema"
import { SignJWT } from "jose"
import { cookies } from "next/headers"
import { record } from "zod"

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

        const loggesInUserData = {
            _id: getUser.id,
            role: getUser.role,
            name: getUser.name,
            avatar: getUser.avatar,
        }

        const secret = new TextEncoder().encode(process.env.SECRET_KEY)
        const token = await new SignJWT(loggesInUserData)
            .setIssuedAt()
            .setExpirationTime('24h')
            .setProtectedHeader({ alg: 'HS256' })
            .sign(secret)

        const cookieStore = await cookies()
        cookieStore.set({
            name : "access_token",
            value : token,
            httpOnly: process.env.NODE_ENV === 'production',
            path:'/',
            secure : process.env.NODE_ENV === 'production',
            sameSite : 'lax',
        })

        // remove otp
        await deleteOTPByEmail(email)

        return response(true, 200, "Login successfully", loggesInUserData)

    } catch (error) {
        return catchError(error)
    }
}