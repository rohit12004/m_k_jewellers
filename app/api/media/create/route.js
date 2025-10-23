import cloudinary from "@/lib/cloudinary";
import { catchError, response } from "@/lib/helperFunction";
import { createManyMedia } from "@/lib/mediaUpload.service";
import { isAuthenticated } from "@/lib/authentication"

export async function POST(request) {
    const payload = await request.json()
    try {
        const auth = await isAuthenticated('admin');
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized access');
        }

        const newMedia = await createManyMedia(payload);
        return response(true, 200, 'Media created successfully', newMedia);
    } catch (error) {
        if (payload && payload.length > 0) {
            const publicIds = payload.map(data => data.public_id);
            try {
                await cloudinary.api.delete_resources(publicIds);
            } catch (deleteError) {
                error.cloudinary = deleteError
            }
        }
        return catchError(error);
    }
}   