import { catchError, response } from "@/lib/helperFunction";
import { isAuthenticated } from "@/lib/authentication"
import { deleteManyCategory, getCategoryById, restoreCategory, softDeleteCategory } from "@/lib/categories.service";
import { revalidateTag } from 'next/cache'

export async function PUT(request) {
  const payload = await request.json()

  try {
    const auth = await isAuthenticated('admin');
    if (!auth.isAuth) {
      return response(false, 403, 'Unauthorized access');
    }

    const ids = payload.ids || [];
    const deleteType = payload.deleteType;

    if (!Array.isArray(ids) || ids.length === 0) {
      return response(false, 400, 'No category IDs provided');
    }

    const category = await getCategoryById(ids);
    if (!category.length) {
      return response(false, 404, 'No category found for the provided IDs');
    }

    if (!['SD', 'RSD'].includes(deleteType)) {
      return response(false, 400, 'Invalid delete type');
    }

    if (deleteType === 'SD') {
      await softDeleteCategory(ids);
      revalidateTag('categories') // Clear cache after soft delete
      return response(true, 200, 'Category Moved Into Trash successfully');
    } else {
      await restoreCategory(ids);
      revalidateTag('categories') // Clear cache after restore
      return response(true, 200, 'Category Restored successfully');
    }

  } catch (error) {
    return catchError(error);
  }
}


export async function DELETE(request) {
  const payload = await request.json();

  try {
    const auth = await isAuthenticated('admin');
    if (!auth.isAuth) {
      return response(false, 403, 'Unauthorized access');
    }

    const ids = payload.ids || [];
    const deleteType = payload.deleteType;

    if (!Array.isArray(ids) || ids.length === 0) {
      return response(false, 400, 'No Category IDs provided');
    }

    if (deleteType !== 'PD') {
      return response(false, 400, 'Invalid delete type for this route');
    }

    try {
      const result = await deleteManyCategory(ids);
      revalidateTag('categories') // Clear cache after permanent delete
      return response(true, 200, 'Category permanently deleted successfully', result);
    } catch (err) {
      // Transaction rolled back — so DB is safe
      return response(false, 500, 'Failed to delete Category. Transaction rolled back.');
    }

  } catch (error) {
    return catchError(error);
  }
}
