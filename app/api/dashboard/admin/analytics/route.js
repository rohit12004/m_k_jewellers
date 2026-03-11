import { getDashboardAnalytics } from "@/lib/adminDashboard.service";
import { isAuthenticated } from "@/lib/authentication";
import { response, catchError } from "@/lib/helperFunction";

export async function GET(request) {
  try {
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized.");
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "30d";

    const analytics = await getDashboardAnalytics(range);
    return response(true, 200, "Dashboard analytics data.", analytics);
  } catch (error) {
    return catchError(error);
  }
}
