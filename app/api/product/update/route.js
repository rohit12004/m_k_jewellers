import { catchError, response } from "@/lib/helperFunction";
import { zSchema } from "@/lib/zodSchema";
import { isAuthenticated } from "@/lib/authentication";
import { getProductById, updateProduct } from "@/lib/product.service";

export async function PUT(request) {
  try {
    // ✅ Check admin authentication
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized.");
    }


    // ✅ Parse request body
    const payload = await request.json();




    // ✅ Product validation schema
    const schema = zSchema.pick({
      id: true,
      name: true,
      slug: true,
      categoryId: true,
      subCategoryId: true,
      gender: true,
      description: true,
      media: true, // array of media IDs
      variants: true,
    });

    const validate = schema.safeParse(payload);
    if (!validate.success) {
      return response(false, 400, "Invalid or missing field.", validate.error);
    }

    // console.log("Validated Data:", validate.data);

    const {
      id,
      name,
      slug,
      categoryId,
      subCategoryId,
      gender,
      description,
      media,
      variants,
    } = validate.data;

    // ✅ Fetch existing product
    const existingProduct = await getProductById(id);


    // ✅ Prepare update object
    const updatedData = {
      name,
      slug,
      categoryId,
      subCategoryId,
      gender,
      description,
      media, // array of media IDs
      variants,
    };

    // ✅ Update product
    const result = await updateProduct(id, updatedData);

    return response(true, 200, "Product updated successfully.", result);
  } catch (error) {
    return catchError(error);
  }
}
