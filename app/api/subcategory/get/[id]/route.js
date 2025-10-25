    import { catchError, response } from "@/lib/helperFunction";
    import { isAuthenticated } from "@/lib/authentication"
import { getSingleSubCategory } from "@/lib/subcategories.service";

    export async function GET(request, { params }) {
        try {
            const auth = await isAuthenticated('admin')
            if (!auth.isAuth) {
                return response(false, 403, 'Unauthorized.')
            }

            const { id } = params

            const subcategory = await getSingleSubCategory(id)

            return subcategory

        } catch (error) {
            return catchError(error)
        }
    }
