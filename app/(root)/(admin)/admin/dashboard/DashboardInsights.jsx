'use client'
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { formatINR } from '@/lib/formatters';
import { FaAward, FaChartLine } from "react-icons/fa6";

const DashboardInsights = () => {
    const { data: analyticsData, isLoading: loading } = useQuery({
        queryKey: ['adminDashboardAnalytics'],
        queryFn: async () => {
            const { data } = await axios.get('/api/dashboard/admin/analytics')
            return data
        },
        staleTime: 5 * 60 * 1000
    });

    if (loading) return <div className="h-48 flex items-center justify-center italic text-gray-400">Analyzing insights...</div>;

    const insights = analyticsData?.data?.insights || {};
    const topProducts = insights.topProducts || [];
    const charts = analyticsData?.data?.charts || {};
    const orderStatus = charts.orderStatus || [];

    return (
        <div className='grid lg:grid-cols-2 grid-cols-1 gap-6 mt-6'>
            {/* Top Selling Products */}
            <div className='bg-white dark:bg-card p-5 rounded-xl border shadow-sm dark:border-gray-800 transition-all'>
                <div className='flex items-center gap-2 mb-4'>
                    <FaAward className='text-yellow-500 text-xl' />
                    <h3 className='text-lg font-bold text-gray-800 dark:text-white'>Top Selling Products</h3>
                </div>
                <div className='space-y-4'>
                    {topProducts.length > 0 ? topProducts.map((product, index) => (
                        <div key={index} className='flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-card-foreground/5 hover:bg-gray-100 dark:hover:bg-card-foreground/10 transition-colors'>
                            <div className='flex items-center gap-3 min-w-0'>
                                <span className='flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-yellow-100 text-yellow-600 font-bold text-xs'>
                                    {index + 1}
                                </span>
                                <p className='font-medium text-gray-700 dark:text-gray-200 truncate'>{product.name}</p>
                            </div>
                            <span className='font-bold text-gray-900 dark:text-white whitespace-nowrap'>
                                {formatINR(product.revenue, false)}
                            </span>
                        </div>
                    )) : (
                        <p className='text-gray-500 text-center py-4'>No sales data available yet.</p>
                    )}
                </div>
            </div>

            {/* Order Status Breakdown */}
            <div className='bg-white dark:bg-card p-5 rounded-xl border shadow-sm dark:border-gray-800'>
                <div className='flex items-center gap-2 mb-4'>
                    <FaChartLine className='text-indigo-500 text-xl' />
                    <h3 className='text-lg font-bold text-gray-800 dark:text-white'>Order Status Overview</h3>
                </div>
                <div className='grid grid-cols-2 gap-4'>
                    {orderStatus.length > 0 ? orderStatus.map((status, index) => (
                        <div key={index} className='p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20'>
                            <p className='text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1'>{status.status}</p>
                            <p className='text-2xl font-bold text-gray-900 dark:text-white'>{status.count}</p>
                        </div>
                    )) : (
                        <p className='text-gray-500 col-span-2 text-center py-4'>No orders tracked.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardInsights;
