import { catchError, response } from "@/lib/helperFunction"
import { zSchema } from "@/lib/zodSchema"
import { isAuthenticated } from "@/lib/authentication"
import { getSingleCategory, updateCategory } from "@/lib/categories.service"

export async function PUT(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        const payload = await request.json()

        const schema = zSchema.pick({
            id: true,
            name:true,
            slug:true,
        })

        const validate = schema.safeParse(payload)
        
        if (!validate.success) {
            return response(false, 400, 'Invalid or missing field.', validate.error)
        }

        const { id, name, slug } = validate.data

        const getCategory = await getSingleCategory(id)


        const updatedData = await updateCategory(id, { name, slug})

        return updatedData

    } catch (error) {
        return catchError(error)
    }
}