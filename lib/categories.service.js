import prisma from "../lib/prisma.js";
import { response } from "./helperFunction.js";

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
