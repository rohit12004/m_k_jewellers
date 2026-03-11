import { emailVerificationLink } from "@/email/emailVerificationLink";
import { catchError, generateOTP, response } from "@/lib/helperFunction";
import { deleteOTPByEmail, saveOTP } from "@/lib/otp.service";
import { sendMail } from "@/lib/sendMail";
import { comparePassword, loginUser } from "@/lib/user.service";
import { zSchema } from "@/lib/zodSchema";
import { SignJWT } from "jose";
import z from "zod";
import { otpEmail } from "@/email/otpEmail";
import { getBaseUrl } from "@/lib/getBaseUrl";

export async function POST(request) {
    try {
        const payload = await request.json()

        const validationSchema = zSchema.pick({
            email: true
        }).extend({
            password: z.string()
        })

        const validatedData = validationSchema.safeParse(payload)
        if (!validatedData.success) {
            return response(false, 401, 'Invalid or Miissing Data.',
                validatedData.error
            )
        }

        // get the user
        const { email, password } = validatedData.data

        const getUser = await loginUser(email)

        if (!getUser) {
            return response(false, 404, 'Invalid Login Credentails.')
        }

        // check if user has a password (prevent bcrypt error with undefined)
        if (!getUser.password) {
            return response(false, 404, 'Invalid Login Credentails.')
        }

        // password comparison - check this BEFORE email verification
        const isPasswordVerified = await comparePassword(password, getUser.password)

        if (!isPasswordVerified) {
            return response(false, 404, 'Invalid Login Credentails.')
        }

        // check if email is verified (only after password is correct)
        if (!getUser.isEmailVerified) {
            const secret = new TextEncoder().encode(process.env.SECRET_KEY);

            const token = await new SignJWT({ id: getUser.id })
                .setIssuedAt()
                .setExpirationTime('1h')
                .setProtectedHeader({ alg: 'HS256' })
                .sign(secret);

            const mailResponse = await sendMail('EMail Verification request from M K Jewellers',
                email, emailVerificationLink(`${getBaseUrl()}/auth/verify-email/${token}`))

            return response(false, 403, "Please verify your email to login. Verification link has been sent to your email.");
        }

        // otp generation
        await deleteOTPByEmail(email)

        const generatedotp = generateOTP()

        // save otp to db
        await saveOTP(email, generatedotp)

        // send otp to mail
        const otpEmailStatus = await sendMail('Your One Time Password (OTP) for M K Jewellers',
            email,
            otpEmail(generatedotp))

        if (!otpEmailStatus.success) {
            return response(false, 400, 'Failed to send OTP to your email. Please try again later.')
        }

        return response(true, 200, 'OTP has been sent to your email. Please verify to complete login process.')

    } catch (error) {
        return catchError(error)
    }
}