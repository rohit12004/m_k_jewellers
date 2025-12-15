import { isAuthenticated } from "@/lib/authentication"
import { createCategory } from "@/lib/categories.service"
import { catchError, response } from "@/lib/helperFunction"
import { zSchema } from "@/lib/zodSchema"
import { revalidateTag } from 'next/cache'

export async function POST(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        const payload = await request.json()

        const schema = zSchema.pick({
            name: true, slug: true
        })


        const validate = schema.safeParse(payload)
        if (!validate.success) {
            return response(false, 400, 'Invalid or missing fields.', validate.error)
        }

        const { name, slug } = validate.data;
        const { mediaId } = payload; // Get mediaId from original payload
        const newCreatedCategory = await createCategory({ name, slug, mediaId })

        // Revalidate categories cache to show new category immediately
        revalidateTag('categories')

        return newCreatedCategory
    } catch (error) {
        return catchError(error)
    }
}