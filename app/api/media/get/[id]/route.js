import { catchError, isAuthenticated, response } from "@/lib/helperFunction";
import { getSingleMedia } from "@/lib/mediaUpload.service";

export async function GET(request, { params }) {
    try {
        // const auth = await isAuthenticated('admin')
        // if (!auth.isAuth) {
        //     return response(false, 403, 'Unauthorized.')
        // }

        const getParams = await params
        const id = getParams.id

       
        const getMedia = await getSingleMedia(id)

        return getMedia

    } catch (error) {
        return catchError(error)
    }
}