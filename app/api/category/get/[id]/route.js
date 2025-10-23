import { catchError, response } from "@/lib/helperFunction";
import { isAuthenticated } from "@/lib/authentication"
import { getSingleCategory } from "@/lib/categories.service";

export async function GET(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        const getParams = await params
        const id = getParams.id

        const getCategory = await getSingleCategory(id)

        return getCategory

    } catch (error) {
        return catchError(error)
    }
}