import { catchError, response } from "@/lib/helperFunction";
import { isAuthenticated } from "@/lib/authentication";
import { getAllCustomers } from "@/lib/customers.service";

export async function GET(request) {
  try {
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized.");
    }

    const customers = await getAllCustomers();

    if (!customers || customers.length === 0) {
      return response(false, 404, "Collection empty.");
    }

    return response(true, 200, "Data found.", customers);
  } catch (error) {
    return catchError(error);
  }
}
