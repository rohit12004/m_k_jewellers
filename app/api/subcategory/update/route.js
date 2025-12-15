import { catchError, response } from "@/lib/helperFunction"
import { zSchema } from "@/lib/zodSchema"
import { isAuthenticated } from "@/lib/authentication"
import { getSingleSubCategory, updateSubCategory } from "@/lib/subcategories.service"
import { revalidateTag } from 'next/cache'

export async function PUT(request) {
  try {
    const auth = await isAuthenticated("admin")
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized.")
    }

    const payload = await request.json()

    // ✅ Validate only fields needed for update
    const schema = zSchema.pick({
      id: true,
      name: true,
      slug: true,
      mediaId: true,
    }).extend({
      categoryIds: zSchema.shape.categoryIds.optional()  // optional array of category IDs
    })

    const validate = schema.safeParse(payload)

    if (!validate.success) {
      return response(false, 400, "Invalid or missing field.", validate.error)
    }

    const { id, name, slug, categoryIds, mediaId } = validate.data

    // ✅ Ensure subcategory exists before updating
    const existing = await getSingleSubCategory(id)

    // ✅ Perform update
    const updated = await updateSubCategory(id, { name, slug, categoryIds, mediaId })

    // Revalidate subcategories cache to show updated subcategory immediately
    revalidateTag('subcategories')

    return updated

  } catch (error) {
    return catchError(error)
  }
}
