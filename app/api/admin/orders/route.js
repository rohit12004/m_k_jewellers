import { isAuthenticated } from "@/lib/authentication";
import { response, catchError } from "@/lib/helperFunction";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        // ✅ Authentication
        const auth = await isAuthenticated("admin");
        if (!auth.isAuth) {
            return response(false, 403, "Unauthorized.");
        }

        const searchParams = request.nextUrl.searchParams;

        const start = parseInt(searchParams.get("start") || "0", 10);
        const size = parseInt(searchParams.get("size") || "10", 10);
        const filters = JSON.parse(searchParams.get("filters") || "[]");
        const globalFilter = searchParams.get("globalFilter") || "";
        const sorting = JSON.parse(searchParams.get("sorting") || "[]");
        const todayOnly = searchParams.get("today") === "true";

        // =====================================
        // ✅ Base match query builder
        // =====================================
        let matchQuery = { AND: [] };

        // =====================================
        // ✅ Filter by today's date if requested
        // =====================================
        if (todayOnly) {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);

            matchQuery.AND.push({
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            });
        }

        // =====================================
        // ✅ Global Search
        // =====================================
        if (globalFilter) {
            const numericValue = Number(globalFilter);

            matchQuery.AND.push({
                OR: [
                    // Search in user fields (text fields that support contains)
                    { user: { name: { contains: globalFilter } } },
                    { user: { email: { contains: globalFilter } } },
                    { user: { phone: { contains: globalFilter } } },
                    // Search by total amount if numeric
                    !isNaN(numericValue) ? { total: numericValue } : undefined,
                ].filter(Boolean)
            });
        }

        // =====================================
        // ✅ Column Filters
        // =====================================
        filters.forEach((f) => {
            if (f.id === "total") {
                matchQuery.AND.push({ total: Number(f.value) });
            } else if (f.id === "customerName") {
                matchQuery.AND.push({
                    user: { name: { contains: f.value } },
                });
            } else if (f.id === "customerEmail") {
                matchQuery.AND.push({
                    user: { email: { contains: f.value } },
                });
            } else if (f.id === "customerPhone") {
                matchQuery.AND.push({
                    user: { phone: { contains: f.value } },
                });
            } else {
                matchQuery.AND.push({
                    [f.id]: { contains: f.value },
                });
            }
        });

        // =====================================
        // ✅ Sorting
        // =====================================
        let orderBy = sorting.map((s) => {
            if (s.id === "customerName") {
                return { user: { name: s.desc ? "desc" : "asc" } };
            }
            if (s.id === "customerEmail") {
                return { user: { email: s.desc ? "desc" : "asc" } };
            }
            return { [s.id]: s.desc ? "desc" : "asc" };
        });

        if (orderBy.length === 0) orderBy = [{ createdAt: "desc" }];

        // =====================================
        // ✅ Fetch data & count
        // =====================================

        // Clean up matchQuery - if AND array has only one item, simplify
        let finalQuery = matchQuery;
        if (matchQuery.AND && matchQuery.AND.length === 1) {
            finalQuery = matchQuery.AND[0];
        } else if (matchQuery.AND && matchQuery.AND.length === 0) {
            finalQuery = {};
        }

        // Debug: Log the query for troubleshooting
        console.log('Orders API Query:', JSON.stringify(finalQuery, null, 2));
        console.log('Global Filter:', globalFilter);

        const [orders, totalRowCount] = await Promise.all([
            prisma.order.findMany({
                where: finalQuery,
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                            phone: true
                        }
                    }
                },
                orderBy,
                skip: start,
                take: size,
            }),
            prisma.order.count({ where: finalQuery })
        ]);

        console.log('Orders found:', orders.length);

        return NextResponse.json({
            success: true,
            data: orders,
            meta: { totalRowCount },
        });

    } catch (error) {
        return catchError(error);
    }
}
