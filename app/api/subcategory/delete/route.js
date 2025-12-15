import { catchError, response } from "@/lib/helperFunction"
import { isAuthenticated } from "@/lib/authentication"
import { deleteManySubCategory, getSubCategoryById, restoreSubCategory, softDeleteSubCategory } from "@/lib/subcategories.service"
import { revalidateTag } from 'next/cache'

export async function PUT(request) {
  const payload = await request.json()

  try {
    const auth = await isAuthenticated("admin")
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized access")
    }

    const ids = payload.ids || []
    const deleteType = payload.deleteType

    if (!Array.isArray(ids) || ids.length === 0) {
      return response(false, 400, "No Subcategory IDs provided")
    }

    const subCategories = await getSubCategoryById(ids)

    if (!subCategories.length) {
      return response(false, 404, "No Subcategories found for the provided IDs")
    }

    if (!["SD", "RSD"].includes(deleteType)) {
      return response(false, 400, "Invalid delete type")
    }

    if (deleteType === "SD") {
      await softDeleteSubCategory(ids)
      revalidateTag('subcategories') // Clear cache after soft delete
      return response(true, 200, "Subcategory moved to trash successfully")
    } else {
      await restoreSubCategory(ids)
      revalidateTag('subcategories') // Clear cache after restore
      return response(true, 200, "Subcategory restored successfully")
    }

  } catch (error) {
    return catchError(error)
  }
}

export async function DELETE(request) {
  const payload = await request.json()

  try {
    const auth = await isAuthenticated("admin")
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized access")
    }

    const ids = payload.ids || []
    const deleteType = payload.deleteType

    if (!Array.isArray(ids) || ids.length === 0) {
      return response(false, 400, "No Subcategory IDs provided")
    }

    if (deleteType !== "PD") {
      return response(false, 400, "Invalid delete type for this route")
    }

    try {
      const result = await deleteManySubCategory(ids)
      revalidateTag('subcategories') // Clear cache after permanent delete
      return response(true, 200, "Subcategory permanently deleted successfully", result)
    } catch (err) {
      return response(false, 500, "Failed to delete Subcategory. Transaction rolled back.")
    }

  } catch (error) {
    return catchError(error)
  }
}
