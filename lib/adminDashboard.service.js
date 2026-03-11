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

export async function getDashboardAnalytics(range = '30d') {
  const now = new Date();
  let startDate = new Date();
  let granularity = 'day'; // 'day' or 'month'

  if (range === '30d') {
    startDate.setDate(now.getDate() - 30);
    granularity = 'day';
  } else if (range === '12m') {
    startDate.setFullYear(now.getFullYear() - 1);
    granularity = 'month';
  } else if (range === 'lifetime') {
    startDate = new Date(0); // Beginning of time
    granularity = 'month';
  }

  const [
    revenueData,
    orderStatusData,
    rangeSalesData,
    categorySalesData,
    topProducts
  ] = await Promise.all([
    // 1. Overall Revenue & Orders (Always lifetime for KPIs usually, but user asked for filters)
    prisma.order.aggregate({
      where: { 
        paymentStatus: 'COMPLETED',
        createdAt: { gte: startDate }
      },
      _sum: { total: true },
      _count: { id: true },
    }),

    // 2. Order Status Distribution (Filtered by range)
    prisma.order.groupBy({
      by: ['orderStatus'],
      where: { createdAt: { gte: startDate } },
      _count: { id: true },
    }),

    // 3. Sales Trend for Charts
    prisma.order.findMany({
      where: {
        paymentStatus: 'COMPLETED',
        createdAt: { gte: startDate }
      },
      select: {
        createdAt: true,
        total: true
      },
      orderBy: { createdAt: 'asc' }
    }),

    // 4. Category Wise Sales (Filtered by range)
    prisma.orderProduct.findMany({
      where: {
        order: { 
          paymentStatus: 'COMPLETED',
          createdAt: { gte: startDate }
        }
      },
      select: {
        category: true,
        totalPrice: true
      }
    }),

    // 5. Top 5 Products by Revenue (Filtered by range)
    prisma.orderProduct.findMany({
      where: {
        order: { 
          paymentStatus: 'COMPLETED',
          createdAt: { gte: startDate }
        }
      },
      select: {
        name: true,
        productId: true,
        totalPrice: true
      }
    })
  ]);

  // Process Trend Data based on granularity
  const trendMap = new Map();
  
  if (granularity === 'day') {
    // Fill last 30 days
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      trendMap.set(d.toISOString().split('T')[0], 0);
    }
    rangeSalesData.forEach(order => {
      const key = order.createdAt.toISOString().split('T')[0];
      if (trendMap.has(key)) {
        trendMap.set(key, trendMap.get(key) + Number(order.total));
      }
    });
  } else {
    // month granularity
    rangeSalesData.forEach(order => {
      const key = `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, '0')}`;
      trendMap.set(key, (trendMap.get(key) || 0) + Number(order.total));
    });
  }

  const salesTrend = Array.from(trendMap.entries())
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Aggregate Category Sales
  const catMap = new Map();
  categorySalesData.forEach(item => {
    catMap.set(item.category, (catMap.get(item.category) || 0) + item.totalPrice);
  });
  const processedCategorySales = Array.from(catMap.entries()).map(([category, revenue]) => ({ category, revenue }));

  // Aggregate Top Products
  const prodMap = new Map();
  topProducts.forEach(item => {
    const key = `${item.productId}_${item.name}`;
    prodMap.set(key, (prodMap.get(key) || 0) + item.totalPrice);
  });
  const processedTopProducts = Array.from(prodMap.entries())
    .map(([key, revenue]) => ({ name: key.split('_')[1], revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

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
      granularity
    },
    insights: {
      topProducts: processedTopProducts
    }
  };
}