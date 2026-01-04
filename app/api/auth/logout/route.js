import { catchError, response } from "@/lib/helperFunction";
import { cookies } from "next/headers";
import { deleteRefreshToken } from "@/lib/refreshToken.service";

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
                // No body provided, that's okay
            }
        }

        // Delete specific refresh token from database
        if (refreshToken) {
            try {
                await deleteRefreshToken(refreshToken);
            } catch (error) {
                // Token might not exist, continue with logout
                console.log("Refresh token not found in database");
            }
        }

        // Clear cookies (web)
        cookieStore.delete('access_token')
        cookieStore.delete('refresh_token')

        return response(true, 200, "Logout Successful.")
    } catch (error) {
        return catchError(error)
    }
}