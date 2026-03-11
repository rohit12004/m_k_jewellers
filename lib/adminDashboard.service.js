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

export async function getDashboardAnalytics() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setHours(0, 0, 0, 0);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    revenueData,
    orderStatusData,
    dailySalesData,
    categorySalesData,
    topProducts
  ] = await Promise.all([
    // 1. Overall Revenue & Orders
    prisma.order.aggregate({
      where: { paymentStatus: 'COMPLETED' },
      _sum: { total: true },
      _count: { id: true },
    }),

    // 2. Order Status Distribution
    prisma.order.groupBy({
      by: ['orderStatus'],
      _count: { id: true },
    }),

    // 3. Daily Sales for Charts (Last 30 Days)
    prisma.order.findMany({
      where: {
        paymentStatus: 'COMPLETED',
        createdAt: { gte: thirtyDaysAgo }
      },
      select: {
        createdAt: true,
        total: true
      },
      orderBy: { createdAt: 'asc' }
    }),

    // 4. Category Wise Sales (Only for COMPLETED orders)
    prisma.orderProduct.findMany({
      where: {
        order: { paymentStatus: 'COMPLETED' }
      },
      select: {
        category: true,
        totalPrice: true
      }
    }),

    // 5. Top 5 Products by Revenue (Only for COMPLETED orders)
    prisma.orderProduct.findMany({
      where: {
        order: { paymentStatus: 'COMPLETED' }
      },
      select: {
        name: true,
        productId: true,
        totalPrice: true
      }
    })
  ]);

  // Aggregate Category Sales manually since group-by with relation filter is complex in Prisma
  const catMap = new Map();
  categorySalesData.forEach(item => {
    catMap.set(item.category, (catMap.get(item.category) || 0) + item.totalPrice);
  });
  const processedCategorySales = Array.from(catMap.entries()).map(([category, revenue]) => ({ category, revenue }));

  // Aggregate Top Products manually
  const prodMap = new Map();
  topProducts.forEach(item => {
    const key = `${item.productId}_${item.name}`;
    prodMap.set(key, (prodMap.get(key) || 0) + item.totalPrice);
  });
  const processedTopProducts = Array.from(prodMap.entries())
    .map(([key, revenue]) => ({ name: key.split('_')[1], revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Process Daily Sales into a clean format for AreaChart
  const dailyMap = new Map();
  // Pre-fill with last 30 days to ensure no gaps
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().split('T')[0];
    dailyMap.set(dateKey, 0);
  }

  dailySalesData.forEach(order => {
    const dateKey = order.createdAt.toISOString().split('T')[0];
    if (dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, dailyMap.get(dateKey) + Number(order.total));
    }
  });

  const salesTrend = Array.from(dailyMap.entries())
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const totalRevenue = Number(revenueData._sum.total || 0);
  const totalOrders = revenueData._count.id || 0;
  const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return {
    kpis: {
      totalRevenue,
      totalOrders,
      aov
    },
    charts: {
      salesTrend,
      orderStatus: orderStatusData.map(d => ({ status: d.orderStatus, count: d._count.id })),
      categorySales: processedCategorySales,
    },
    insights: {
      topProducts: processedTopProducts
    }
  };
}