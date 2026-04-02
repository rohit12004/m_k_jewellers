import { catchError, response } from "@/lib/helperFunction";
import { cookies } from "next/headers";
import { revokeAllUserRefreshTokens, findRefreshToken } from "@/lib/refreshToken.service";

export async function POST(request) {
    try {
        const cookieStore = await cookies()
        let refreshToken;

        // Get refresh token from cookie (web) or body (mobile)
        if (cookieStore.has('refresh_token')) {
            refreshToken = cookieStore.get('refresh_token').value;
        } else {
            try {
                const body = await request.json();
                refreshToken = body.refreshToken;
            } catch (e) {
                // No body provided
            }
        }

        if (!refreshToken) {
            return response(false, 400, "Refresh token required to logout from all devices.");
        }

        // Find session to get the userId
        const session = await findRefreshToken(refreshToken);

        if (!session) {
            return response(false, 401, "Invalid or expired session.");
        }

        // Soft-revoke ALL sessions for this user (skill pattern: updateMany revoked=true)
        await revokeAllUserRefreshTokens(session.userId);

        // Clear cookies on this device
        cookieStore.delete('access_token')
        cookieStore.delete('refresh_token')

        return response(true, 200, "Logged out from all devices successfully.")
    } catch (error) {
        return catchError(error)
    }
}
