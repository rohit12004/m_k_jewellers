import { catchError, response } from "@/lib/helperFunction";
import { isAuthenticated } from "@/lib/authentication";
import { getSubCategoriesForExport } from "@/lib/subcategories.service";

export async function GET(request) {
  try {
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized.");
    }

    const subCategories = await getSubCategoriesForExport();

    if (!subCategories || subCategories.length === 0) {
      return response(false, 404, "Collection empty.");
    }

    return response(true, 200, "Data found.", subCategories);
  } catch (error) {
    return catchError(error);
  }
}
