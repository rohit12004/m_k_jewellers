import { otpEmail } from "@/email/otpEmail"
import { generateOTP, response, catchError } from "@/lib/helperFunction"
import { deleteOTPByEmail, saveOTP } from "@/lib/otp.service"
import { sendMail } from "@/lib/sendMail"
import { findUserByEmail } from "@/lib/user.service"
import { zSchema } from "@/lib/zodSchema"

export async function POST(request) {
    try {
        const payload = await request.json()
        const validationSchema = zSchema.pick({ email: true })
        const validatedData = validationSchema.safeParse(payload)
        if (!validatedData.success) {
            return response(false, 404, 'Invalid or Missing Data.', validatedData.error)
        }

        const { email } = validatedData.data

        const getUser = await findUserByEmail(email)
        if (!getUser) {
            return response(false, 404, 'User not found')
        }

        await deleteOTPByEmail(email)
        const otp = generateOTP()

        await saveOTP(email, otp)
        const otpSendStatus = await sendMail('Your OTP for Password Reset', email, otpEmail(otp))

        if (!otpSendStatus.success) {
            return response(false, 400, 'Failed to send OTP, Please try again')
        }

        return response(true, 200, 'OTP sent successfully. Please check your email.')
    } catch (error) {
        return catchError(error)
    }
}