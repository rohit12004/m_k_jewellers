import { catchError, response } from "@/lib/helperFunction";
import { isAuthenticated } from "@/lib/authentication";
import { deleteManyProduct, getSingleProduct, restoreProduct, softDeleteProduct } from "@/lib/product.service";


export async function PUT(request) {
    const payload = await request.json();

    try {
        const auth = await isAuthenticated('admin');
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized access');
        }

        const ids = payload.ids || [];
        const deleteType = payload.deleteType;

        if (!Array.isArray(ids) || ids.length === 0) {
            return response(false, 400, 'No product IDs provided');
        }

        const products = await getSingleProduct(ids);

        if (!['SD', 'RSD'].includes(deleteType)) {
            return response(false, 400, 'Invalid delete type');
        }

        if (deleteType === 'SD') {
            await softDeleteProduct(ids);
            return response(true, 200, 'Product moved into trash successfully');
        } else {
            await restoreProduct(ids);
            return response(true, 200, 'Product restored successfully');
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
            return response(false, 400, 'No product IDs provided');
        }

        if (deleteType !== 'PD') {
            return response(false, 400, 'Invalid delete type for this route');
        }

        try {
            const result = await deleteManyProduct(ids);
            return response(true, 200, 'Product permanently deleted successfully', result);
        } catch (err) {
            // Transaction rolled back — so DB is safe
            return response(false, 500, 'Failed to delete product. Transaction rolled back.');
        }

    } catch (error) {
        return catchError(error);
    }
}
