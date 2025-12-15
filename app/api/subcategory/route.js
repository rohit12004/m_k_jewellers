import { isAuthenticated } from "@/lib/authentication"
import { getFilteredSubCategories } from "@/lib/subcategories.service"
import { catchError, response } from "@/lib/helperFunction"
import { NextResponse } from "next/server"

export async function GET(request) {
    try {
        // ✅ Authentication check
        const auth = await isAuthenticated("admin")
        if (!auth.isAuth) {
            return response(false, 403, "Unauthorized.")
        }

        const searchParams = request.nextUrl.searchParams

        // ✅ Extract query parameters
        const start = parseInt(searchParams.get("start") || "0", 10)
        const size = parseInt(searchParams.get("size") || "10", 10)
        const filters = JSON.parse(searchParams.get("filters") || "[]")
        const globalFilter = searchParams.get("globalFilter") || ""
        const sorting = JSON.parse(searchParams.get("sorting") || "[]")
        const deleteType = searchParams.get("deleteType")

        // ✅ Build match query
        let matchQuery = {}

        if (deleteType === "SD") {
            matchQuery.deletedAt = null
        } else if (deleteType === "PD") {
            matchQuery.NOT = { deletedAt: null }
        }

        // ✅ Global search (including related categories via junction table)
        if (globalFilter) {
            matchQuery.OR = [
                { name: { contains: globalFilter } },
                { slug: { contains: globalFilter } },
                {
                    categorySubCategories: {
                        some: {
                            category: {
                                name: { contains: globalFilter }
                            }
                        }
                    }
                }
            ]
        }

        // ✅ Column-based filtering
        filters.forEach((filter) => {
            if (filter.id === "categories") {
                // filter by related category names via junction table
                matchQuery.categorySubCategories = {
                    some: {
                        category: {
                            name: { contains: filter.value }
                        }
                    }
                }
            } else {
                matchQuery[filter.id] = { contains: filter.value }
            }
        })

        // ✅ Sorting
        let orderBy = {}
        sorting.forEach((sort) => {
            // Note: Sorting by categories is complex with many-to-many
            // We'll skip category sorting for now
            if (sort.id !== "categories") {
                orderBy[sort.id] = sort.desc ? "desc" : "asc"
            }
        })

        // ✅ Fetch filtered data
        const { data: subCategories, total: totalRowCount } = await getFilteredSubCategories({
            matchQuery,
            orderBy,
            start,
            size,
        })

        // ✅ Response
        return NextResponse.json({
            success: true,
            data: subCategories,
            meta: { totalRowCount },
        })
    } catch (error) {
        return catchError(error)
    }
}
