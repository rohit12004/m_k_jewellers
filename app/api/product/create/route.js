import { isAuthenticated } from "@/lib/authentication"
import { catchError, response } from "@/lib/helperFunction"
import { createProduct } from "@/lib/product.service"
import { zSchema } from "@/lib/zodSchema"

export async function POST(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        const payload = await request.json()

        const schema = zSchema.pick({
            name: true,
            slug: true,
            categoryId: true,
            subCategoryId: true,
            gender: true,
            description: true,
            media: true,
            variants: true,
            tryOnImage: true,
        })


        const validate = schema.safeParse(payload)
        if (!validate.success) {
            return response(false, 400, 'Invalid or missing fields.', validate.error)
        }

        const productData = validate.data

        const newProduct = await createProduct(productData)

        return response(true, 200, 'Product added successfully.')

    } catch (error) {
        return catchError(error)
    }
}