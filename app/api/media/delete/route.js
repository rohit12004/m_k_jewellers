import { isAuthenticated, response } from "@/lib/helperFunction";
import { deleteManyMedia, getMediaByIds, restoreMedia, softDeleteMedia } from "@/lib/mediaUpload.service";

export async function PUT(request) {
    const payload = await request.json()

    try {
        const auth = await isAuthenticated('admin');
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized access');
        }

        const ids = payload.ids || [];
        const deleteType = payload.deleteType;

        if (!Array.isArray(ids) || ids.length === 0) {
            return response(false, 400, 'No media IDs provided');
        }

        const media = await getMediaByIds(ids);
        if (!media.length) {
            return response(false, 404, 'No media found for the provided IDs');
        }

        if (!['SD', 'RSD'].includes(deleteType)) {
            return response(false, 400, 'Invalid delete type');
        }

        if (deleteType === 'SD') {
            await softDeleteMedia(ids);
            return response(true, 200, 'Media Moved Into Trash successfully');
        } else {
            await restoreMedia(ids);
            return response(true, 200, 'Media Restored successfully');
        }

    } catch (error) {
        return catchError(error);
    }
}


export async function DELETE(request) {
  const payload = await request.json();

  try {
    const auth = await isAuthenticated('admin');
    if (!auth.isAuth) {
      return response(false, 403, 'Unauthorized access');
    }

    const ids = payload.ids || [];
    const deleteType = payload.deleteType;

    if (!Array.isArray(ids) || ids.length === 0) {
      return response(false, 400, 'No media IDs provided');
    }

    if (deleteType !== 'PD') {
      return response(false, 400, 'Invalid delete type for this route');
    }

    try {
      const result = await deleteManyMedia(ids);
      return response(true, 200, 'Media permanently deleted successfully', result);
    } catch (err) {
      // Transaction rolled back — so DB is safe
      return response(false, 500, 'Failed to delete media. Transaction rolled back.');
    }

  } catch (error) {
    return catchError(error);
  }
}
