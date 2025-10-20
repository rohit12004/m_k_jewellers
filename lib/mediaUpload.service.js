import prisma from "../lib/prisma.js";

export async function createManyMedia(payload) {
  const result = await prisma.Media.createMany({
    data: payload,
  });
  return result; // Prisma returns { count: number }
}