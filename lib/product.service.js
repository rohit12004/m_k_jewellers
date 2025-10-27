import prisma from "../lib/prisma.js";
import { response } from "./helperFunction.js";
import { validate as isValidUUID } from "uuid";

// =============================
// 1) Create Product
// =============================
export async function createProduct(data) {
  try {
    const {
      name,
      slug,
      subCategoryId,
      weight,
      gst,
      labourCharge,
      purityFactor,
      hallmarkCharges,
      gender,
      description,
      media,
    } = data;

    const newProduct = await prisma.product.create({
      data: {
        name,
        slug,
        subCategoryId,
        weight: parseFloat(weight),
        gst: parseFloat(gst),
        labourCharge: parseFloat(labourCharge),
        purityFactor: parseFloat(purityFactor),
        hallmarkCharges: parseFloat(hallmarkCharges),
        gender,
        description,
      },
    });

    if (media?.length) {
      await prisma.media.updateMany({
        where: { id: { in: media } },
        data: { productId: newProduct.id },
      });
    }

    return response(true, 201, "Product created successfully.", newProduct);
  } catch (error) {
    if (error.code === "P2002") {
      return response(false, 400, "Product with this name or slug already exists.");
    }
    return response(false, 500, error.message);
  }
}

// =============================
// 2) Filtered List (same as getFilteredCategories)
// =============================
export async function getFilteredProducts({ matchQuery, orderBy, start, size }) {
  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where: matchQuery,
      orderBy: Object.keys(orderBy).length ? orderBy : { createdAt: "desc" },
      skip: start,
      take: size,
      include: {
        subCategory: { include: { category: true } },
        media: true,
      },
    }),
    prisma.product.count({ where: matchQuery }),
  ]);

  // ✅ Flattening for Datatable
  const data = rows.map((p) => ({
    ...p,
    subCategoryName: p.subCategory?.name || "",
    categoryName: p.subCategory?.category?.name || "",
  }));

  return { data, total };
}


// =============================
// 3) Get multiple products by IDs (Used in bulk ops)
// =============================
export async function getProductById(id) {
  try {
    if (!isValidUUID(id)) {
      return response(false, 400, "Invalid UUID.");
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        subCategory: { include: { category: true } },
        media: true,
      },
    });

    if (!product) {
      return response(false, 404, "Product not found.");
    }

    return response(true, 200, "Product fetched successfully.", product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return response(false, 500, "Failed to fetch product");
  }
}


// =============================
// 4) Soft Delete Product
// =============================
export async function softDeleteProduct(ids) {
  try {
    return await prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { deletedAt: new Date() },
    });
  } catch (error) {
    throw new Error("Failed to soft delete product");
  }
}

// =============================
// 5) Restore Product
// =============================
export async function restoreProduct(ids) {
  try {
    return await prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { deletedAt: null },
    });
  } catch (error) {
    throw new Error("Failed to restore product");
  }
}

// =============================
// 6) Permanently Delete Product
// =============================
export async function deleteManyProduct(ids) {
  try {
    return await prisma.product.deleteMany({
      where: { id: { in: ids } },
    });
  } catch (error) {
    throw new Error("Failed to permanently delete product");
  }
}

// =============================
// 7) Get Single Product (view page)
// =============================
export async function getSingleProduct(id) {
  try {
    if (!isValidUUID(id)) return response(false, 400, "Invalid UUID.");

    const product = await prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: {
        media: true,
        subCategory: { include: { category: true } },
      },
    });

    if (!product) return response(false, 404, "Product not found.");

    return response(true, 200, "Product fetched successfully", product);
  } catch (error) {
    return response(false, 500, "Failed to fetch product");
  }
}

// =============================
// 8) Update Product
// =============================
export async function updateProduct(id, data) {
  try {
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        subCategoryId: data.subCategoryId,
        weight: parseFloat(data.weight),
        gst: parseFloat(data.gst),
        labourCharge: parseFloat(data.labourCharge),
        purityFactor: parseFloat(data.purityFactor),
        hallmarkCharges: parseFloat(data.hallmarkCharges),
        gender: data.gender,
        description: data.description,
      },
    });

    if (data.media?.length) {
      await prisma.media.updateMany({
        where: { productId: id },
        data: { productId: null },
      });

      await prisma.media.updateMany({
        where: { id: { in: data.media } },
        data: { productId: id },
      });
    }

    return response(true, 200, "Product updated successfully.", updatedProduct);
  } catch (error) {
    if (error.code === "P2002") {
      return response(false, 400, "Product with this name or slug already exists.");
    }
    return response(false, 500, "Failed to update product.");
  }
}

// =============================
// 9) Export Products (Excel / CSV Screens)
// =============================
export async function getProductsforExport() {
  try {
    const products = await prisma.product.findMany({
      include: {
        subCategory: { include: { category: true } },
        media: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // ✅ Flatten nested fields so CSV supports them
    const flattened = products.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      subCategoryName: p.subCategory?.name || "",
      categoryName: p.subCategory?.category?.name || "",
      weight: p.weight,
      gst: p.gst,
      labourCharge: p.labourCharge,
      purityFactor: p.purityFactor,
      hallmarkCharges: p.hallmarkCharges,
      gender: p.gender,
      description: p.description ?? "",
      // ✅ Convert media array to a comma-separated string
      images: p.media?.map(m => m.url).join(", ") || "",
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    return flattened;
  } catch (error) {
    throw error;
  }
}

