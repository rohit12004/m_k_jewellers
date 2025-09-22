import { catchError, response } from "@/lib/helperFunction";
import { loginUser, updateUserPassword } from "@/lib/user.service";
import { zSchema } from "@/lib/zodSchema";

export async function PUT(request) {
    try {
        const payload = await request.json();
        const validationSchema = zSchema.pick({
            email: true,
            password: true,
        })

        const validatedData = validationSchema.safeParse(payload)
        if (!validatedData.success) {
            return response(false, 404, "Invalid or Missing Input Field", validatedData.error)
        }

        // get the user
        const { email, password } = validatedData.data

        const getUser = await loginUser(email)

        if (!getUser) {
            return response(false, 404, 'Invalid Login Credentails.')
        }

        getUser.password = password
        const updatedUser = await updateUserPassword(email, password)
        if (!updatedUser) {
            return response(false, 404, "Invalid Login Credentials.");
        }

        // 3️⃣ Return success response
        return response(true, 200, "Password updated successfully.");

    } catch (error) {
         return catchError(error)
    }
}