import { isAuthenticated } from "@/lib/authentication";
import { response, catchError } from "@/lib/helperFunction";
import { getFilteredProducts } from "@/lib/product.service";
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
    const deleteType = searchParams.get("deleteType");

    // =====================================
    // ✅ Base match query builder
    // =====================================
    let matchQuery = { AND: [] };

    // Deleted filter
    if (deleteType === "SD") {
      matchQuery.AND.push({ deletedAt: null });
    } else if (deleteType === "PD") {
      matchQuery.AND.push({ NOT: { deletedAt: null } });
    }

    // =====================================
    // ✅ Global Search
    // =====================================
    if (globalFilter) {
      const numericValue = Number(globalFilter);
      const genderFilter = ["MEN", "WOMEN"].includes(globalFilter.toUpperCase())
        ? globalFilter.toUpperCase()
        : undefined;

      matchQuery.AND.push({
        OR: [
          { name: { contains: globalFilter } },
          { slug: { contains: globalFilter } },
          { subCategory: { name: { contains: globalFilter } } },
          { subCategory: { name: { contains: globalFilter } } },
          { category: { name: { contains: globalFilter } } },
          !isNaN(numericValue) ? { weight: numericValue } : undefined,
          !isNaN(numericValue) ? { gst: numericValue } : undefined,
          !isNaN(numericValue) ? { labourCharge: numericValue } : undefined,
          !isNaN(numericValue) ? { purityFactor: numericValue } : undefined,
          !isNaN(numericValue) ? { hallmarkCharges: numericValue } : undefined,
          genderFilter ? { gender: genderFilter } : undefined,
        ].filter(Boolean)
      });
    }

    // =====================================
    // ✅ Column Filters
    // =====================================
    filters.forEach((f) => {
      if (["weight", "gst", "labourCharge", "purityFactor", "hallmarkCharges"].includes(f.id)) {
        matchQuery.AND.push({ [f.id]: Number(f.value) });
      } else if (f.id === "subCategoryName") {
        matchQuery.AND.push({
          subCategory: { name: { contains: f.value } },
        });
      } else if (f.id === "categoryName") {
        matchQuery.AND.push({
          category: { name: { contains: f.value } },
        });
      } else if (f.id === "gender") {
        const genderValue = ["MEN", "WOMEN"].includes(f.value.toUpperCase())
          ? f.value.toUpperCase()
          : undefined;
        if (genderValue) matchQuery.AND.push({ gender: genderValue });
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
      if (s.id === "subCategoryName") {
        return { subCategory: { name: s.desc ? "desc" : "asc" } };
      }
      if (s.id === "categoryName") {
        return { category: { name: s.desc ? "desc" : "asc" } };
      }
      return { [s.id]: s.desc ? "desc" : "asc" };
    });

    if (orderBy.length === 0) orderBy = [{ createdAt: "desc" }];

    // =====================================
    // ✅ Fetch data & count
    // =====================================
    const { data: getProduct, total: totalRowCount } = await getFilteredProducts({
      matchQuery,
      orderBy,
      start,
      size,
    });

    return NextResponse.json({
      success: true,
      data: getProduct,
      meta: { totalRowCount },
    });

  } catch (error) {
    return catchError(error);
  }
}
