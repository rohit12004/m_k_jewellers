import { catchError, response } from "@/lib/helperFunction";
import { isAuthenticated } from "@/lib/authentication";
import { getProductsforExport } from "@/lib/product.service";

export async function GET(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        const getProduct = await getProductsforExport()

        if (!getProduct) {
            return response(false, 404, 'Collection empty.')
        }

        return response(true, 200, 'Data found.', getProduct)

    } catch (error) {
        return catchError(error)
    }
}