import { catchError, response } from "@/lib/helperFunction";
import { getUserSession } from "@/lib/authentication";

export async function GET(request) {
    try {
        // Get user session from HTTP-only cookie (JWT payload)
        const session = await getUserSession();


        if (!session) {
            return response(false, 401, 'No active session');
        }

        // Return user data from JWT (same as before to avoid infinite loops)
        // The JWT is updated when profile is updated, so this data should be fresh
        return response(true, 200, 'Session retrieved', session);

    } catch (error) {
        console.error("❌ [SESSION API] Error:", error);
        return catchError(error);
    }
}
