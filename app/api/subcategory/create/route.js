import { isAuthenticated } from "@/lib/authentication"
import { catchError, response } from "@/lib/helperFunction"
import { createSubCategory } from "@/lib/subcategories.service"
import { zSchema } from "@/lib/zodSchema"

export async function POST(request) {
    try {
        // Check admin authentication
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        const payload = await request.json()

        // Pick the fields required for sub-category
        const schema = zSchema.pick({
            name: true,
            slug: true,
            categoryId: true  // <-- include parent category
        })

        // Validate payload
        const validate = schema.safeParse(payload)
        if (!validate.success) {
            return response(false, 400, 'Invalid or missing fields.', validate.error)
        }

        const { name, slug, categoryId } = validate.data

        // Call sub-category creation service
        const newCreatedSubCategory = await createSubCategory({ name, slug, categoryId })

        return newCreatedSubCategory
    } catch (error) {
        return catchError(error)
    }
}
