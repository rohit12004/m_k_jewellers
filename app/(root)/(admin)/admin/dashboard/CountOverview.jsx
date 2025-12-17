'use client'
import Link from 'next/link'
import React from 'react'
import { BiCategory } from "react-icons/bi";
import { TbCategory2 } from "react-icons/tb";
import { MdOutlineShoppingBag } from "react-icons/md";
import { RiProductHuntLine } from "react-icons/ri";
import useFetch from '@/hooks/useFetch';
import { ADMIN_CATEGORY_SHOW, ADMIN_CUSTOMERS_SHOW, ADMIN_PRODUCT_SHOW, ADMIN_SUB_CATEGORY_SHOW } from '@/routes/adminPanelRoutes';
const CountOverview = () => {

    const { data: countData } = useFetch('/api/dashboard/admin/count')

    console.log(countData)

    return (
        <div className='grid lg:grid-cols-4 grid-cols-2 md:gap-6 gap-3 mt-5'>
            <Link href={ADMIN_CATEGORY_SHOW}>
                <div className='flex items-center justify-between md:p-3 p-2 rounded-lg border shadow border-l-4 border-l-green-400 bg-white dark:bg-card dark:border-gray-800 dark:border-l-green-400'>
                    <div className='flex-1 min-w-0'>
                        <h4 className='font-medium text-gray-500 dark:text-gray-200 md:text-base text-xs truncate'>Total Categories</h4>
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
                <div className='flex items-center justify-between md:p-3 p-2 rounded-lg border shadow border-l-4 border-l-blue-400 bg-white dark:bg-card dark:border-gray-800 dark:border-l-blue-400'>
                    <div className='flex-1 min-w-0'>
                        <h4 className='font-medium text-gray-500 dark:text-gray-200 md:text-base text-xs truncate'>Total Sub-Categories</h4>
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
                <div className='flex items-center justify-between md:p-3 p-2 rounded-lg border shadow border-l-4 border-l-yellow-400 bg-white dark:bg-card dark:border-gray-800 dark:border-l-yellow-400'>
                    <div className='flex-1 min-w-0'>
                        <h4 className='font-medium text-gray-500 dark:text-gray-200 md:text-base text-xs truncate'>Total Products</h4>
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
                <div className='flex items-center justify-between md:p-3 p-2 rounded-lg border shadow border-l-4 border-l-cyan-400 bg-white dark:bg-card dark:border-gray-800 dark:border-l-cyan-400'>
                    <div className='flex-1 min-w-0'>
                        <h4 className='font-medium text-gray-500 dark:text-gray-200 md:text-base text-xs truncate'>Total Customers</h4>
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
    )
}

export default CountOverview