import { catchError, response } from "@/lib/helperFunction";
import { getUserSession } from "@/lib/authentication";

/**
 * GET /api/auth/me
 * Returns the authenticated user's profile from their JWT access token.
 * Maps to the skill's getMe controller.
 */
export async function GET(request) {
    try {
        const session = await getUserSession();

        if (!session) {
            return response(false, 401, "Unauthorized. Please login to continue.");
        }

        return response(true, 200, "User fetched successfully.", session);

    } catch (error) {
        return catchError(error);
    }
}
