import prisma from "../lib/prisma.js";
import { response } from "./helperFunction.js";
import { validate as isValidUUID } from "uuid";

export async function createCategory(data) {
  try {
    const { name, slug } = data

    const newCategory = await prisma.category.create({
      data: {
        name,
        slug,
      },
    })

    return response(true, 201, 'Category created successfully.', newCategory)
  } catch (error) {
    if (error.code === 'P2002') {
      // Prisma unique constraint error
      return response(false, 400, 'Category with this name or slug already exists.')
    }
    return response(false, 500, error.message)
  }
}


export async function getFilteredCategories({ matchQuery, orderBy, start, size }) {
  const [data, total] = await Promise.all([
    prisma.category.findMany({
      where: matchQuery,
      orderBy: Object.keys(orderBy).length ? orderBy : { createdAt: "desc" },
      skip: start,
      take: size,
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    }),
    prisma.category.count({ where: matchQuery }),
  ])

  return { data, total }
}

export async function getCategoryById(ids) {
  try {
    const category = await prisma.category.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return category
  } catch (error) {
    console.error("Error fetching category by ID:", error)
    throw new Error("Failed to fetch category by ID")
  }
}

export async function softDeleteCategory(ids) {
  try {
    const result = await prisma.category.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        deletedAt: new Date(),
      },
    })

    return result
  } catch (error) {
    throw new Error("Failed to soft delete category")
  }
}


export async function restoreCategory(ids) {
  try {
    const result = await prisma.category.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        deletedAt: null,
      },
    })

    return result
  } catch (error) {
    throw new Error("Failed to restore category")
  }
}


export async function deleteManyCategory(ids) {
  try {
    const result = await prisma.category.deleteMany({
      where: {
        id: { in: ids },
      },
    })

    return result
  } catch (error) {
    throw new Error("Failed to permanently delete category")
  }
}

export async function getSingleCategory(id) {
  try {
    // ✅ Validate ID format (UUID)
    if (!isValidUUID(id)) {
      return response(false, 400, "Invalid UUID.");
    }

    // ✅ Fetch single category from MySQL using Prisma
    const category = await prisma.category.findFirst({
      where: {
        id,
        deletedAt: null, // only fetch non-deleted category
      },
    });

    if (!category) {
      return response(false, 404, "Category not found.");
    }

    return response(true, 200, "Category fetched successfully", category);
  } catch (error) {
    console.error("Error fetching category:", error);
    return response(false, 500, "Failed to fetch category");
  }
}

export async function updateCategory(id, data) {
  try {
    const { name, slug } = data;

    // ✅ Update category record
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        updatedAt: new Date(),
      },
    });

    return response(true, 200, "Category updated successfully.", updatedCategory);
  } catch (error) {
    console.error("Error updating category:", error);
    return response(false, 500, "Failed to update category.");
  }
}


export async function getCategoriesforExport({ filter = { deletedAt: null }, orderBy = { createdAt: 'desc' } } = {}) {
  try {
    const categories = await prisma.category.findMany({
      where: filter,
      orderBy,
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });
    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error("Failed to fetch categories");
  }
}
