'use client'
import Link from 'next/link'
import React from 'react'
import { BiCategory } from "react-icons/bi";
import { TbCategory2 } from "react-icons/tb";
import { MdOutlineShoppingBag } from "react-icons/md";
import { RiProductHuntLine } from "react-icons/ri";
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ADMIN_CATEGORY_SHOW, ADMIN_CUSTOMERS_SHOW, ADMIN_PRODUCT_SHOW, ADMIN_SUB_CATEGORY_SHOW } from '@/routes/adminPanelRoutes';
import { formatINR, formatCompactINR } from '@/lib/formatters';
import { FaIndianRupeeSign } from "react-icons/fa6";
import { AiOutlineRise } from "react-icons/ai";

const CountOverview = () => {
    const { data: analyticsData } = useQuery({
        queryKey: ['adminDashboardAnalytics'],
        queryFn: async () => {
            const { data } = await axios.get('/api/dashboard/admin/analytics')
            return data
        },
        staleTime: 5 * 60 * 1000 // 5 minutes
    })

    const { data: countData } = useQuery({
        queryKey: ['adminDashboardCounts'],
        queryFn: async () => {
            const { data } = await axios.get('/api/dashboard/admin/count')
            return data
        },
        staleTime: 5 * 60 * 1000
    })

    const kpis = analyticsData?.data?.kpis || {};

    return (
        <div className='flex flex-col gap-6 mt-5'>
            {/* Business KPI Section */}
            <div className='grid lg:grid-cols-2 grid-cols-1 md:gap-6 gap-3'>
                <div className='flex items-center justify-between md:p-5 p-3 rounded-xl border shadow-sm border-l-4 border-l-indigo-500 bg-white dark:bg-card dark:border-gray-800 dark:border-l-indigo-500'>
                    <div className='flex-1 min-w-0'>
                        <h4 className='font-semibold text-gray-500 dark:text-gray-200 md:text-base text-sm uppercase tracking-wider'>Total Revenue</h4>
                        <div className='flex items-baseline gap-2'>
                            <span className='md:text-3xl text-2xl font-bold text-gray-900 dark:text-white'>
                                {formatINR(kpis.totalRevenue, false)}
                            </span>
                        </div>
                        <p className='text-xs text-gray-400 mt-1'>Lifetime completed orders</p>
                    </div>
                    <div className='ml-4'>
                        <span className='md:w-14 md:h-14 w-10 h-10 border flex justify-center items-center rounded-2xl bg-indigo-500 text-white md:text-2xl text-lg shadow-lg shadow-indigo-200 dark:shadow-none'>
                            <FaIndianRupeeSign />
                        </span>
                    </div>
                </div>

                <div className='flex items-center justify-between md:p-5 p-3 rounded-xl border shadow-sm border-l-4 border-l-rose-500 bg-white dark:bg-card dark:border-gray-800 dark:border-l-rose-500'>
                    <div className='flex-1 min-w-0'>
                        <h4 className='font-semibold text-gray-500 dark:text-gray-200 md:text-base text-sm uppercase tracking-wider'>Avg. Order Value</h4>
                        <div className='flex items-baseline gap-2'>
                            <span className='md:text-3xl text-2xl font-bold text-gray-900 dark:text-white'>
                                {formatINR(kpis.aov, false)}
                            </span>
                        </div>
                        <p className='text-xs text-gray-400 mt-1'>Average spend per customer</p>
                    </div>
                    <div className='ml-4'>
                        <span className='md:w-14 md:h-14 w-10 h-10 border flex justify-center items-center rounded-2xl bg-rose-500 text-white md:text-2xl text-lg shadow-lg shadow-rose-200 dark:shadow-none'>
                            <AiOutlineRise />
                        </span>
                    </div>
                </div>
            </div>

            {/* Inventory Count Section */}
            <div className='grid lg:grid-cols-4 grid-cols-2 md:gap-6 gap-3'>
                <Link href={ADMIN_CATEGORY_SHOW}>
                    <div className='flex items-center justify-between md:p-3 p-2 rounded-lg border shadow border-l-4 border-l-green-400 bg-white dark:bg-card dark:border-gray-800 dark:border-l-green-400 hover:scale-[1.02] transition-transform'>
                        <div className='flex-1 min-w-0'>
                            <h4 className='font-medium text-gray-500 dark:text-gray-200 md:text-base text-xs truncate'>Categories</h4>
                            <span className='md:text-xl text-lg font-bold'>{countData?.data?.category || 0}</span>
                        </div>
                        <div className='ml-2'>
                            <span className='md:w-12 md:h-12 w-8 h-8 border flex justify-center items-center rounded-full bg-green-500 text-white md:text-base text-sm'>
                                <BiCategory />
                            </span>
                        </div>
                    </div>
                </Link>
                <Link href={ADMIN_SUB_CATEGORY_SHOW}>
                    <div className='flex items-center justify-between md:p-3 p-2 rounded-lg border shadow border-l-4 border-l-blue-400 bg-white dark:bg-card dark:border-gray-800 dark:border-l-blue-400 hover:scale-[1.02] transition-transform'>
                        <div className='flex-1 min-w-0'>
                            <h4 className='font-medium text-gray-500 dark:text-gray-200 md:text-base text-xs truncate'>Sub-Categories</h4>
                            <span className='md:text-xl text-lg font-bold'>{countData?.data?.subCategory || 0}</span>
                        </div>
                        <div className='ml-2'>
                            <span className='md:w-12 md:h-12 w-8 h-8 border flex justify-center items-center rounded-full bg-blue-500 text-white md:text-base text-sm'>
                                <TbCategory2 />
                            </span>
                        </div>
                    </div>
                </Link>
                <Link href={ADMIN_PRODUCT_SHOW}>
                    <div className='flex items-center justify-between md:p-3 p-2 rounded-lg border shadow border-l-4 border-l-yellow-400 bg-white dark:bg-card dark:border-gray-800 dark:border-l-yellow-400 hover:scale-[1.02] transition-transform'>
                        <div className='flex-1 min-w-0'>
                            <h4 className='font-medium text-gray-500 dark:text-gray-200 md:text-base text-sm truncate'>Products</h4>
                            <span className='md:text-xl text-lg font-bold'>{countData?.data?.product || 0}</span>
                        </div>
                        <div className='ml-2'>
                            <span className='md:w-12 md:h-12 w-8 h-8 border flex justify-center items-center rounded-full bg-yellow-500 text-white md:text-base text-sm'>
                                <RiProductHuntLine />
                            </span>
                        </div>
                    </div>
                </Link>
                <Link href={ADMIN_CUSTOMERS_SHOW}>
                    <div className='flex items-center justify-between md:p-3 p-2 rounded-lg border shadow border-l-4 border-l-cyan-400 bg-white dark:bg-card dark:border-gray-800 dark:border-l-cyan-400 hover:scale-[1.02] transition-transform'>
                        <div className='flex-1 min-w-0'>
                            <h4 className='font-medium text-gray-500 dark:text-gray-200 md:text-base text-xs truncate'>Customers</h4>
                            <span className='md:text-xl text-lg font-bold'>{countData?.data?.customer || 0}</span>
                        </div>
                        <div className='ml-2'>
                            <span className='md:w-12 md:h-12 w-8 h-8 border flex justify-center items-center rounded-full bg-cyan-500 text-white md:text-base text-sm'>
                                <MdOutlineShoppingBag />
                            </span>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    )
}

export default CountOverview