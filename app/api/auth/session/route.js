import { catchError, response } from "@/lib/helperFunction";
import { getUserSession } from "@/lib/authentication";

export async function GET(request) {
    try {
        // Get user session from HTTP-only cookie
        const session = await getUserSession();

        if (!session) {
            return response(false, 401, 'No active session');
        }

        // Return user data (same format as login response)
        return response(true, 200, 'Session retrieved', session);

    } catch (error) {
        return catchError(error);
    }
}
