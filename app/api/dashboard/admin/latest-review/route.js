import { isAuthenticated } from "@/lib/authentication";
import { catchError, response } from "@/lib/helperFunction";

export async function GET() {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        // Review model not yet migrated to Prisma. Returning empty array for now to avoid build error.
        return response(true, 200, 'Latest review', [])

    } catch (error) {
        return catchError(error)
    }
}