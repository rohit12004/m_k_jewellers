import { catchError, response } from "@/lib/helperFunction";
import { isAuthenticated } from "@/lib/authentication";
import { getCategoriesforExport } from "@/lib/categories.service";

export async function GET(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        const getCategory = await getCategoriesforExport()

        if (!getCategory) {
            return response(false, 404, 'Collection empty.')
        }

        return response(true, 200, 'Data found.', getCategory)

    } catch (error) {
        return catchError(error)
    }
}