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


        // remove otp
        await deleteOTPByEmail(email)

        return response(true, 200, "OTP Verified.",)

    } catch (error) {
        return catchError(error)
    }
}