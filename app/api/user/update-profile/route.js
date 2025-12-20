import { catchError, response } from "@/lib/helperFunction";
import { getUserSession } from "@/lib/authentication";
import { updateUserProfile } from "@/lib/user.service";
import { zSchema } from "@/lib/zodSchema";
import { z } from "zod";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

export async function PUT(request) {
    try {
        // Verify user is authenticated
        const session = await getUserSession()
        if (!session) {
            return response(false, 401, 'Unauthorized. Please login to continue.')
        }

        const payload = await request.json()

        // Validation schema
        const schema = zSchema.pick({
            name: true
        }).extend({
            phone: z.string()
                .regex(/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number'),
            address: z.string().min(1, 'Address is required')
        })

        const validate = schema.safeParse(payload)
        if (!validate.success) {
            return response(false, 400, 'Invalid or missing fields.', validate.error)
        }

        const { name, phone, address } = validate.data

        // Update user profile
        const updatedUser = await updateUserProfile(session.userId, {
            name,
            phone,
            address
        })

        // Update session cookie with fresh user data
        const loggedInUserData = {
            id: updatedUser.id,
            role: updatedUser.role,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            address: updatedUser.address,
            avatarUrl: updatedUser.avatarUrl,
        }

        const secret = new TextEncoder().encode(process.env.SECRET_KEY)
        const token = await new SignJWT(loggedInUserData)
            .setIssuedAt()
            .setExpirationTime('24h')
            .setProtectedHeader({ alg: 'HS256' })
            .sign(secret)

        const cookieStore = await cookies()
        cookieStore.set({
            name: "access_token",
            value: token,
            httpOnly: process.env.NODE_ENV === 'production',
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        })

        return response(true, 200, 'Profile updated successfully.', updatedUser)

    } catch (error) {
        return catchError(error)
    }
}
