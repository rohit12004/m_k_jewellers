import prisma from "../lib/prisma.js";
import { response, catchError } from "./helperFunction.js";
import { validate as isValidUUID } from "uuid";

export async function createCategory(data) {
  try {
    const { name, slug, mediaId } = data

    // Create category first
    const newCategory = await prisma.category.create({
      data: {
        name,
        slug,
      },
    })

    // If mediaId is provided, update the media record to link it to this category
    if (mediaId) {
      await prisma.media.update({
        where: { id: mediaId },
        data: { categoryId: newCategory.id }
      })
    }

    // Fetch the category with media to return
    const categoryWithMedia = await prisma.category.findUnique({
      where: { id: newCategory.id },
      include: {
        media: {
          select: {
            id: true,
            secure_url: true,
            alt: true,
            title: true,
          },
          orderBy: { order: "asc" },
        },
      }
    })

    return response(true, 201, 'Category created successfully.', categoryWithMedia)
  } catch (error) {
    return catchError(error)
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

  return { data: data || [], total: total || 0 }
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
    throw error // Let the caller catch and use catchError
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
    throw error
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
      include: {
        media: {
          select: {
            id: true,
            secure_url: true,
            alt: true,
            title: true,
          },
          orderBy: { order: "asc" },
        },
      }
    });

    if (!category) {
      return response(false, 404, "Category not found.");
    }

    return response(true, 200, "Category fetched successfully", category);
  } catch (error) {
    console.error("Error fetching category:", error);
    return catchError(error, "Failed to fetch category");
  }
}

export async function updateCategory(id, data) {
  try {
    const { name, slug, mediaId } = data;

    const updateData = {
      name,
      slug,
      updatedAt: new Date(),
    };

    // Handle media update
    if (mediaId !== undefined) {
      if (mediaId) {
        // Disconnect all existing media and connect new one
        updateData.media = {
          set: [], // Disconnect all
          connect: { id: mediaId } // Connect new one
        };
      } else {
        // If mediaId is null/empty, disconnect all media
        updateData.media = {
          set: []
        };
      }
    }

    // ✅ Update category record
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: updateData,
      include: {
        media: {
          select: {
            id: true,
            secure_url: true,
            alt: true,
            title: true,
          },
          orderBy: { order: "asc" },
        },
      }
    });

    return response(true, 200, "Category updated successfully.", updatedCategory);
  } catch (error) {
    console.error("Error updating category:", error);
    return catchError(error, "Failed to update category.");
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
    throw error;
  }
}
