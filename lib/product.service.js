import prisma from "../lib/prisma.js";
import { response } from "./helperFunction.js";
import { validate as isValidUUID } from "uuid";
import { addCalculatedPrices } from "./pricingHelper.js";

// =============================
// 1) Create Product
// =============================
export async function createProduct(data) {
  try {
    const {
      name,
      slug,
      categoryId,
      subCategoryId,
      gender,
      description,
      media,
      variants, // ✅ Now extracting variants array
    } = data;

    // ✅ Validate Category & SubCategory Relation
    if (categoryId && subCategoryId) {
      const isValidRelation = await prisma.categorySubCategory.findUnique({
        where: {
          categoryId_subCategoryId: {
            categoryId,
            subCategoryId,
          },
        },
      });

      if (!isValidRelation) {
        return response(false, 400, "Invalid Category and SubCategory combination.");
      }
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        slug,
        categoryId,
        subCategoryId,
        gender,
        description,
        // ✅ Create variants
        variants: {
          create: variants.map((v) => ({
            weight: parseFloat(v.weight),
            purity: v.purity,
            gst: parseFloat(v.gst),
            labourCharge: parseFloat(v.labourCharge),
            hallmarkCharges: parseFloat(v.hallmarkCharges),
            size: v.size || null,
            length: v.length || null, // for chains/mangalsutra
          })),
        },
      },
      include: { variants: true }, // Return with variants
    });

    if (media?.length) {
      await prisma.media.updateMany({
        where: { id: { in: media } },
        data: { productId: newProduct.id },
      });
    }

    return response(true, 201, "Product created successfully.", newProduct);
  } catch (error) {
    console.log(error); // Log error for debugging
    return catchError(error)
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
        subCategory: true,
        category: true,
        media: true,
        variants: true,
      },
    }),
    prisma.product.count({ where: matchQuery }),
  ]);

  // ✅ Flattening for Datatable
  const data = rows.map((p) => ({
    ...p,
    subCategoryName: p.subCategory?.name || "",
    subCategoryName: p.subCategory?.name || "",
    categoryName: p.category?.name || "",
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
        subCategory: true,
        category: true,
        media: true,
        variants: true,
      },
    });

    if (!product) {
      return response(false, 404, "Product not found.");
    }

    // Add calculated prices to variants
    const productWithPrices = await addCalculatedPrices(product);

    return response(true, 200, "Product fetched successfully.", productWithPrices);
  } catch (error) {
    return catchError(error, "Failed to fetch product");
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
    throw error
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
    throw error
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
    throw error
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
        subCategory: true,
        category: true,
        variants: true,
      },
    });

    if (!product) return response(false, 404, "Product not found.");

    // Add calculated prices to variants
    const productWithPrices = await addCalculatedPrices(product);

    return response(true, 200, "Product fetched successfully", productWithPrices);
  } catch (error) {
    return catchError(error, "Failed to fetch product");
  }
}

// =============================
// 7.5) Get Product By Slug (website view)
// =============================
export async function getProductBySlug(slug, filters = {}) {
  try {
    const { purity, size, weight } = filters;

    // Fetch product by slug with all relations
    const product = await prisma.product.findFirst({
      where: {
        slug: slug,
        deletedAt: null
      },
      include: {
        media: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'asc' }
        },
        variants: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        subCategory: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    if (!product) {
      return { success: false, status: 404, message: 'Product not found' }
    }

    // Add calculated prices to all variants
    const productWithPrices = await addCalculatedPrices(product)

    // Extract unique variant options
    const purities = [...new Set(productWithPrices.variants.map(v => v.purity))].filter(Boolean)
    const sizes = [...new Set(productWithPrices.variants.map(v => v.size))].filter(Boolean)
    const weights = [...new Set(productWithPrices.variants.map(v => v.weight))].filter(Boolean)

    // Find selected variant based on filters or default to first variant
    let selectedVariant = productWithPrices.variants[0]

    if (purity || size || weight) {
      const matchedVariant = productWithPrices.variants.find(variant => {
        const purityMatch = !purity || variant.purity === purity
        const sizeMatch = !size || variant.size === size
        const weightMatch = !weight || variant.weight === parseFloat(weight)

        return purityMatch && sizeMatch && weightMatch
      })

      if (matchedVariant) {
        selectedVariant = matchedVariant
      }
    }

    return {
      success: true,
      status: 200,
      message: "Product fetched successfully",
      data: {
        product: {
          id: productWithPrices.id,
          name: productWithPrices.name,
          slug: productWithPrices.slug,
          description: productWithPrices.description,
          gender: productWithPrices.gender,
          category: productWithPrices.category,
          subCategory: productWithPrices.subCategory
        },
        selectedVariant,
        allVariants: productWithPrices.variants,
        purities,
        sizes,
        weights,
        media: productWithPrices.media
      }
    }

  } catch (error) {
    console.error('Error in getProductBySlug:', error)
    return { 
      success: false, 
      status: (error.statusCode || 500), 
      message: error.message || 'Failed to fetch product details' 
    }
  }
}

// =============================
// 7.6) Get Similar Products (by subcategory)
// =============================
export async function getSimilarProducts(subCategoryId, currentProductId, limit = 5) {
  try {
    if (!subCategoryId) return { success: true, data: [] };

    const products = await prisma.product.findMany({
      where: {
        subCategoryId: subCategoryId,
        id: { not: currentProductId },
        deletedAt: null
      },
      take: 20, // Fetch more to randomize
      include: {
        media: {
          where: { deletedAt: null },
          take: 1,
          orderBy: { createdAt: 'asc' }
        },
        variants: {
          select: {
            id: true,
            weight: true,
            purity: true,
            labourCharge: true,
            hallmarkCharges: true,
            gst: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        subCategory: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Randomize and take the requested limit
    const shuffled = products.sort(() => 0.5 - Math.random());
    const selectedProducts = shuffled.slice(0, limit);

    const productsWithPrices = await addCalculatedPrices(selectedProducts);

    return {
      success: true,
      data: productsWithPrices
    };
  } catch (error) {
    console.error('Error in getSimilarProducts:', error);
    return { success: false, message: 'Failed to fetch similar products' };
  }
}

// =============================
// 8) Update Product
// =============================
export async function updateProduct(id, data) {
  try {
    // ✅ Validate Category & SubCategory Relation if updated
    if (data.categoryId && data.subCategoryId) {
      const isValidRelation = await prisma.categorySubCategory.findUnique({
        where: {
          categoryId_subCategoryId: {
            categoryId: data.categoryId,
            subCategoryId: data.subCategoryId,
          },
        },
      });

      if (!isValidRelation) {
        return response(false, 400, "Invalid Category and SubCategory combination.");
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        categoryId: data.categoryId,
        subCategoryId: data.subCategoryId,
        gender: data.gender,
        description: data.description,
      },
    });

    // ✅ Handle Variants Update
    if (data.variants && Array.isArray(data.variants)) {
      // 1. Get existing variant IDs
      const existingVariants = await prisma.productVariant.findMany({
        where: { productId: id },
        select: { id: true }
      });
      const existingIds = existingVariants.map(v => v.id);

      // 2. Identify variants to delete (present in DB but not in payload)
      const payloadIds = data.variants.map(v => v.id).filter(Boolean);
      const toDelete = existingIds.filter(eid => !payloadIds.includes(eid));

      if (toDelete.length > 0) {
        await prisma.productVariant.deleteMany({
          where: { id: { in: toDelete } }
        });
      }

      // 3. Upsert variants (Create or Update)
      for (const v of data.variants) {
        const variantData = {
          weight: parseFloat(v.weight),
          purity: v.purity,
          gst: parseFloat(v.gst),
          labourCharge: parseFloat(v.labourCharge),
          hallmarkCharges: parseFloat(v.hallmarkCharges),
          size: v.size || null,
          length: v.length || null, // for chains/mangalsutra
        };

        if (v.id && existingIds.includes(v.id)) {
          // Update
          await prisma.productVariant.update({
            where: { id: v.id },
            data: variantData
          });
        } else {
          // Create
          await prisma.productVariant.create({
            data: {
              ...variantData,
              productId: id
            }
          });
        }
      }
    }

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
    return catchError(error, "Failed to update product.");
  }
}

// =============================
// 9) Export Products (Excel / CSV Screens)
// =============================
export async function getProductsforExport() {
  try {
    const products = await prisma.product.findMany({
      include: {
        subCategory: true,
        category: true,
        media: true,
        variants: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // ✅ Flatten nested fields so CSV supports them
    const flattened = products.flatMap(p => {
      // If no variants, return product info with empty variant fields (or skip?)
      // Let's return one row per variant
      if (!p.variants || p.variants.length === 0) {
        return [{
          id: p.id,
          name: p.name,
          slug: p.slug,
          subCategoryName: p.subCategory?.name || "",
          categoryName: p.category?.name || "",
          variant: "N/A",
          weight: "",
          gst: "",
          labourCharge: "",
          purity: "",
          hallmarkCharges: "",
          gender: p.gender,
          description: p.description ?? "",
          images: p.media?.map(m => m.url).join(", ") || "",
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        }];
      }

      return p.variants.map(v => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        subCategoryName: p.subCategory?.name || "",
        categoryName: p.category?.name || "",
        variant: v.name || `${v.weight}g`,
        weight: v.weight,
        gst: v.gst,
        labourCharge: v.labourCharge,
        purity: v.purity,
        hallmarkCharges: v.hallmarkCharges,
        gender: p.gender,
        description: p.description ?? "",
        images: p.media?.map(m => m.url).join(", ") || "",
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }));
    });

    return flattened;
  } catch (error) {
    throw error;
  }
}

