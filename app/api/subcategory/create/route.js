import { isAuthenticated } from "@/lib/authentication"
import { catchError, response } from "@/lib/helperFunction"
import { createSubCategory } from "@/lib/subcategories.service"
import { zSchema } from "@/lib/zodSchema"
import { revalidateTag } from 'next/cache'

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
            mediaId: true,
        }).extend({
            categoryIds: zSchema.shape.categoryIds  // array of category IDs
        })

        // Validate payload
        const validate = schema.safeParse(payload)
        if (!validate.success) {
            return response(false, 400, 'Invalid or missing fields.', validate.error)
        }

        const { name, slug, categoryIds, mediaId } = validate.data

        // Call sub-category creation service
        const newCreatedSubCategory = await createSubCategory({ name, slug, categoryIds, mediaId })

        // Revalidate subcategories cache to show new subcategory immediately
        revalidateTag('subcategories')

        return newCreatedSubCategory
    } catch (error) {
        return catchError(error)
    }
}
