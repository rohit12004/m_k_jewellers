import { isAuthenticated } from "@/lib/authentication";
import { getCustomersFromDB } from "@/lib/customers.service";
import { catchError } from "@/lib/helperFunction";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;

    // Extract query parameters
    const start = parseInt(searchParams.get("start") || "0", 10);
    const size = parseInt(searchParams.get("size") || "10", 10);
    const filters = JSON.parse(searchParams.get("filters") || "[]");
    const globalFilter = searchParams.get("globalFilter") || "";
    const sorting = JSON.parse(searchParams.get("sorting") || "[]");
    const deleteType = searchParams.get("deleteType");

    // Base filter for trash
    let baseFilter = {};
    if (deleteType === "SD") {
      baseFilter.deletedAt = null;
    } else if (deleteType === "PD") {
      baseFilter.NOT = { deletedAt: null };
    }

    // Global filter
    const globalConditions = [];
    if (globalFilter.trim()) {
      // Map verified/unverified to boolean
      let boolValue;
      const filterLower = globalFilter.toLowerCase();
      if (filterLower === "true" || filterLower === "verified") boolValue = true;
      else if (filterLower === "false" || filterLower === "unverified") boolValue = false;

      globalConditions.push(
        { name: { contains: globalFilter } },
        { email: { contains: globalFilter } },
        { phone: { contains: globalFilter } },
        { address: { contains: globalFilter } }
      );

      if (boolValue !== undefined) {
        globalConditions.push({ isEmailVerified: { equals: boolValue } });
      }
    }

    // Column-specific filters
    const columnConditions = filters
      .filter(f => f.value && f.value.trim())
      .map(f => ({
        [f.id]: { contains: f.value },
      }));

    // Combine filters
    const matchQuery = {
      AND: [
        baseFilter,
        ...(globalConditions.length > 0 ? [{ OR: globalConditions }] : []),
        ...columnConditions,
      ],
    };

    // Sorting
    const sortQuery = {};
    sorting.forEach(sort => {
      sortQuery[sort.id] = sort.desc ? "desc" : "asc";
    });

    // Fetch data via Prisma helper
    const { customers, totalRowCount } = await getCustomersFromDB({
      matchQuery,
      sortQuery,
      start,
      size,
    });

    return NextResponse.json({
      success: true,
      data: customers,
      meta: { totalRowCount },
    });
  } catch (error) {
    return catchError(error);
  }
}
