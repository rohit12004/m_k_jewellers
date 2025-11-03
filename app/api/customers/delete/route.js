import { isAuthenticated } from "@/lib/authentication";
import { deleteCustomersPermanently, findCustomersByIds, updateCustomerDeleteStatus } from "@/lib/customers.service";
import { catchError, response } from "@/lib/helperFunction";

export async function PUT(request) {
  try {
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized.");
    }

    const payload = await request.json();
    const ids = payload.ids || [];
    const deleteType = payload.deleteType;

    if (!Array.isArray(ids) || ids.length === 0) {
      return response(false, 400, "Invalid or empty id list.");
    }

    const data = await findCustomersByIds(ids);
    if (!data.length) {
      return response(false, 404, "Data not found.");
    }

    if (!["SD", "RSD"].includes(deleteType)) {
      return response(
        false,
        400,
        "Invalid delete operation. Delete type should be SD or RSD for this route."
      );
    }

    await updateCustomerDeleteStatus(ids, deleteType);

    return response(
      true,
      200,
      deleteType === "SD"
        ? "Data moved into trash."
        : "Data restored successfully."
    );
  } catch (error) {
    return catchError(error);
  }
}

export async function DELETE(request) {
  try {
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized.");
    }

    const payload = await request.json();
    const ids = payload.ids || [];
    const deleteType = payload.deleteType;

    if (!Array.isArray(ids) || ids.length === 0) {
      return response(false, 400, "Invalid or empty id list.");
    }

    const data = await findCustomersByIds(ids);
    if (!data.length) {
      return response(false, 404, "Data not found.");
    }

    if (deleteType !== "PD") {
      return response(
        false,
        400,
        "Invalid delete operation. Delete type should be PD for this route."
      );
    }

    await deleteCustomersPermanently(ids);

    return response(true, 200, "Data deleted permanently.");
  } catch (error) {
    return catchError(error);
  }
}
