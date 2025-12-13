import prisma from "../lib/prisma.js";

export async function getDashboardCounts() {
  const [ category, subCategory, customer, product ] = await Promise.all([
    prisma.category.count({ where: { deletedAt: null } }),
    prisma.subCategory.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.product.count({ where: { deletedAt: null } }),
  ]);

  return { category, subCategory, customer, product };
}