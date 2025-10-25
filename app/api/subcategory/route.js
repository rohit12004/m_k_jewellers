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

        // ✅ Global search (including related category)
        if (globalFilter) {
            matchQuery.OR = [
                { name: { contains: globalFilter } },
                { slug: { contains: globalFilter } },
                { category: { is: { name: { contains: globalFilter } } } }
            ]
        }

        // ✅ Column-based filtering
        filters.forEach((filter) => {
            if (filter.id === "category") {
                // filter by related category name
                matchQuery.category = {
                    is: { name: { contains: filter.value } }
                }
            } else {
                matchQuery[filter.id] = { contains: filter.value }
            }
        })

        // ✅ Sorting
        let orderBy = {}
        sorting.forEach((sort) => {
            if (sort.id === "category") {
                orderBy.category = { name: sort.desc ? "desc" : "asc" }
            } else {
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
