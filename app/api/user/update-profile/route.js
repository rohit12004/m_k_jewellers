import { catchError, response } from "@/lib/helperFunction";
import { getUserSession } from "@/lib/authentication";
import { updateUserProfile } from "@/lib/user.service";
import { zSchema } from "@/lib/zodSchema";
import { z } from "zod";

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

        return response(true, 200, 'Profile updated successfully.', updatedUser)

    } catch (error) {
        return catchError(error)
    }
}
