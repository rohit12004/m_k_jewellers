import prisma from "../lib/prisma.js";
import cloudinary from "./cloudinary.js";
import { validate as isValidUUID } from "uuid";
import { response } from "@/lib/helperFunction";

export async function createManyMedia(payload) {
  const result = await prisma.Media.createMany({
    data: payload,
  });
  return result; // Prisma returns { count: number }
}

export async function getMedia(filter = {}, page = 0, limit = 10) {
  try {
    // 1️⃣ Query records
    const mediaData = await prisma.media.findMany({
      where: filter,
      orderBy: { createdAt: "desc" },
      skip: page * limit,
      take: limit,
    });

    // 2️⃣ Get total count for pagination info
    const totalRecords = await prisma.media.count({ where: filter });

    // 3️⃣ Return formatted response
    return {
      mediaData,
      pagination: {
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
        currentPage: page,
        limit,
      },
    };
  } catch (error) {
    console.error("❌ Error fetching media:", error);
    throw error;
  }
}

export async function getMediaByIds(ids) {
  try {
    const media = await prisma.media.findMany({
      where: {
        id: { in: ids },
      },
    });
    return media;
  } catch (error) {
    throw new Error("Failed to fetch media by IDs");
  }
}

export async function softDeleteMedia(ids) {
  try {
    const result = await prisma.media.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return result;
  } catch (error) {
    throw new Error("Failed to soft delete media");
  }
}

export async function restoreMedia(ids) {
  try {
    const result = await prisma.media.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        deletedAt: null,
      },
    });

    return result;
  } catch (error) {
    throw new Error("Failed to soft delete media");
  }
}

export async function deleteManyMedia(ids) {
  const media = await getMediaByIds(ids);
  if (!media.length) throw new Error("No media found for the provided IDs");

  const publicIds = media.map(m => m.public_id);

  // Transaction ensures DB deletion is rolled back if Cloudinary fails
  return await prisma.$transaction(async (tx) => {
    // 1️⃣ Delete from DB
    const deleted = await tx.media.deleteMany({
      where: { id: { in: ids } },
    });

    // 2️⃣ Delete from Cloudinary
    try {
      await cloudinary.api.delete_resources(publicIds);
    } catch (error) {
      throw new Error("Failed to delete media from Cloudinary: " + error.message);
    }

    return deleted;
  });
}

export async function getSingleMedia(id) {
  try {
    // ✅ Validate ID format (UUID)
    if (!isValidUUID(id)) {
      return response(false, 400, "Invalid UUID.");
    }

    // ✅ Fetch single record from MySQL
    const media = await prisma.media.findFirst({
      where: {
        id,
        deletedAt: null, // same as your filter
      },
    });

    if (!media) {
      return response(false, 404, "Media not found.");
    }

    return response(true, 200, "Media fetched successfully", media);
  } catch (error) {
    console.error("Error fetching media:", error);
    return response(false, 500, "Failed to fetch media");
  }
}

export async function updateMedia(id, data) {
  try {
    const { alt, title } = data;

    // ✅ Update record
    const updatedMedia = await prisma.media.update({
      where: { id },
      data: {
        alt,
        title,
        updatedAt: new Date(),
      },
    });

    return response(true, 200, "Media updated successfully.", updatedMedia);
  } catch (error) {
    console.error("Error updating media:", error);
    return response(false, 500, "Failed to update media.");
  }
}