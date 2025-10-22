import { catchError, isAuthenticated, response } from "@/lib/helperFunction"
import { getSingleMedia, updateMedia } from "@/lib/mediaUpload.service"
import { zSchema } from "@/lib/zodSchema"

export async function PUT(request) {
    try {
        // const auth = await isAuthenticated('admin')
        // if (!auth.isAuth) {
        //     return response(false, 403, 'Unauthorized.')
        // }

        const payload = await request.json()

        const schema = zSchema.pick({
            id: true,
            alt: true,
            title: true
        })

        const validate = schema.safeParse(payload)
        if (!validate.success) {
            return response(false, 400, 'Invalid or missing field.', validate.error)
        }

        const { id, alt, title } = validate.data

        const getMedia = await getSingleMedia(id)

        const updatedData = await updateMedia(id, { alt, title })

        return updatedData

    } catch (error) {
        return catchError(error)
    }
}