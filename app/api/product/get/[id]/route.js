import { isAuthenticated } from "@/lib/authentication";
import { catchError, response } from "@/lib/helperFunction";
import { getProductById } from "@/lib/product.service";

export async function GET(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        const getParams = await params
        const id = getParams.id

        const getCategory = await getProductById(id)

        return getCategory
    } catch (error) {
        return catchError(error);
    }
}
