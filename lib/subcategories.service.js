import prisma from "../lib/prisma.js";
import { response } from "./helperFunction.js";
import { validate as isValidUUID } from "uuid";


export async function createSubCategory(data) {
  try {
    const { name, slug, categoryIds } = data

    // Create subcategory first
    const newSubCategory = await prisma.subCategory.create({
      data: {
        name,
        slug,
      },
    })

    // Create junction table entries for each category
    if (categoryIds && categoryIds.length > 0) {
      await prisma.categorySubCategory.createMany({
        data: categoryIds.map(categoryId => ({
          categoryId,
          subCategoryId: newSubCategory.id,
        })),
      })
    }

    // Fetch the subcategory with categories to return
    const subcategoryWithCategories = await prisma.subCategory.findUnique({
      where: { id: newSubCategory.id },
      include: {
        categorySubCategories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              }
            }
          }
        }
      }
    })

    return response(true, 201, 'Sub-category created successfully.', subcategoryWithCategories)
  } catch (error) {
    if (error.code === 'P2002') {
      return response(false, 400, 'Sub-category with this name or slug already exists.')
    }
    return response(false, 500, error.message)
  }
}


export async function getFilteredSubCategories({ matchQuery, orderBy, start, size }) {
  const [data, total] = await Promise.all([
    prisma.subCategory.findMany({
      where: matchQuery,
      orderBy: Object.keys(orderBy).length ? orderBy : { createdAt: "desc" },
      skip: start,
      take: size,
      select: {
        id: true,
        name: true,
        slug: true,
        categorySubCategories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    }),
    prisma.subCategory.count({ where: matchQuery }),
  ])

  return { data, total }
}


export async function getSingleSubCategory(id) {
  try {
    // ✅ Validate ID format (UUID)
    if (!isValidUUID(id)) {
      return response(false, 400, "Invalid UUID.");
    }

    // ✅ Fetch single subcategory
    const subcategory = await prisma.subCategory.findFirst({
      where: {
        id,
        deletedAt: null, // only fetch non-deleted
      },
      include: {
        categorySubCategories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        }
      }
    });

    if (!subcategory) {
      return response(false, 404, "Subcategory not found.");
    }

    return response(true, 200, "Subcategory fetched successfully", subcategory);

  } catch (error) {
    console.error("Error fetching subcategory:", error);
    return response(false, 500, "Failed to fetch subcategory");
  }
}

export async function updateSubCategory(id, data) {
  try {
    const { name, slug, categoryIds } = data;

    // ✅ Update subcategory record
    const updatedSubCategory = await prisma.subCategory.update({
      where: { id },
      data: {
        name,
        slug,
        updatedAt: new Date(),
      },
    });

    // ✅ Update category relationships if categoryIds provided
    if (categoryIds !== undefined) {
      // Delete existing relationships
      await prisma.categorySubCategory.deleteMany({
        where: { subCategoryId: id },
      });

      // Create new relationships
      if (categoryIds.length > 0) {
        await prisma.categorySubCategory.createMany({
          data: categoryIds.map(categoryId => ({
            categoryId,
            subCategoryId: id,
          })),
        });
      }
    }

    // Fetch updated subcategory with categories
    const subcategoryWithCategories = await prisma.subCategory.findUnique({
      where: { id },
      include: {
        categorySubCategories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              }
            }
          }
        }
      }
    });

    return response(true, 200, "Subcategory updated successfully.", subcategoryWithCategories);
  } catch (error) {
    console.error("Error updating subcategory:", error);
    return response(false, 500, "Failed to update subcategory.");
  }
}


export async function getSubCategoryById(ids) {
  try {
    const subcategories = await prisma.subCategory.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        name: true,
        slug: true,
        categorySubCategories: {
          include: {
            category: {
              select: { id: true, name: true }
            }
          }
        },
        createdAt: true,
        updatedAt: true,
      },
    })

    return subcategories
  } catch (error) {
    console.error("Error fetching subcategory by ID:", error)
    throw new Error("Failed to fetch subcategory by ID")
  }
}


export async function softDeleteSubCategory(ids) {
  try {
    const result = await prisma.subCategory.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        deletedAt: new Date(),
      },
    })

    return result
  } catch (error) {
    console.error("Error soft deleting subcategory:", error)
    throw new Error("Failed to soft delete subcategory")
  }
}

export async function restoreSubCategory(ids) {
  try {
    const result = await prisma.subCategory.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        deletedAt: null,
      },
    })

    return result
  } catch (error) {
    console.error("Error restoring subcategory:", error)
    throw new Error("Failed to restore subcategory")
  }
}

export async function deleteManySubCategory(ids) {
  try {
    // First, delete all junction table entries for these subcategories
    // This is necessary because even though we have cascade delete in schema,
    // we need to ensure clean deletion
    await prisma.categorySubCategory.deleteMany({
      where: {
        subCategoryId: { in: ids },
      },
    })

    // Now delete the subcategories
    // Note: If there are products referencing these subcategories, this will still fail
    // In that case, products should be deleted or their subCategoryId should be set to null first
    const result = await prisma.subCategory.deleteMany({
      where: {
        id: { in: ids },
      },
    })

    return result
  } catch (error) {
    console.error("Error permanently deleting subcategory:", error)
    throw new Error("Failed to permanently delete subcategory. Make sure no products are referencing these subcategories.")
  }
}


export async function getSubCategoriesForExport({ filter = { deletedAt: null }, orderBy = { createdAt: 'desc' } } = {}) {
  try {
    const subcategories = await prisma.subCategory.findMany({
      where: filter,
      orderBy,
      select: {
        id: true,
        name: true,
        slug: true,
        categorySubCategories: {
          include: {
            category: {
              select: { id: true, name: true }
            }
          }
        },
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });
    return subcategories;
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    throw new Error("Failed to fetch subcategories");
  }
}
