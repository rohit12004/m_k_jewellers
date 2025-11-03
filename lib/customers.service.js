import prisma from "../lib/prisma.js";
import { response } from "./helperFunction.js";

export async function getCustomersFromDB({ matchQuery, sortQuery, start, size }) {
  const customers = await prisma.user.findMany({
    where: matchQuery,
    orderBy: Object.keys(sortQuery).length
      ? sortQuery
      : { createdAt: "desc" },
    skip: start,
    take: size,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      avatarUrl: true,
      isEmailVerified: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
    },
  });

  const totalRowCount = await prisma.user.count({ where: matchQuery });

  return { customers, totalRowCount };
}

// Soft delete or restore (SD / RSD)
export async function updateCustomerDeleteStatus(ids, deleteType) {
  if (deleteType === "SD") {
    await prisma.user.updateMany({
      where: { id: { in: ids } },
      data: { deletedAt: new Date() },
    });
  } else if (deleteType === "RSD") {
    await prisma.user.updateMany({
      where: { id: { in: ids } },
      data: { deletedAt: null },
    });
  }
}

// Permanent delete (PD)
export async function deleteCustomersPermanently(ids) {
  await prisma.user.deleteMany({
    where: { id: { in: ids } },
  });
}

// Fetch customers by IDs
export async function findCustomersByIds(ids) {
  return prisma.user.findMany({
    where: { id: { in: ids } },
  });
}

export async function getAllCustomers() {
  const customers = await prisma.user.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      avatarUrl: true,
      isEmailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return customers;
}