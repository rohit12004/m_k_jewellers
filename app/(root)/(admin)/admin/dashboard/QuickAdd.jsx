import Link from 'next/link'
import React from 'react'
import { BiCategory } from "react-icons/bi";
import { TbCategory2 } from "react-icons/tb";
import { RiProductHuntLine } from "react-icons/ri";
import { MdOutlinePermMedia } from "react-icons/md";
import { ADMIN_CATEGORY_ADD, ADMIN_COUPON_ADD, ADMIN_COUPON_SHOW, ADMIN_MEDIA_SHOW, ADMIN_PRODUCT_ADD, ADMIN_SUB_CATEGORY_ADD } from '@/routes/adminPanelRoutes';
const QuickAdd = () => {
    return (
        <div className='grid lg:grid-cols-4 sm:grid-cols-2 sm:gap-10 gap-5 mt-5'>
            <Link href={ADMIN_CATEGORY_ADD}>
                <div className='flex items-center justify-between p-3 rounded-lg shadow bg-white dark:bg-card bg-gradient-to-tr from-green-400 via-green-500 to-green-600'>
                    <h4 className='font-medium text-white dark:text-black'>Add Category</h4>
                    <span className='w-12 h-12 border dark:border-green-800 flex justify-center items-center rounded-full text-white'>
                        <BiCategory size={20} />
                    </span>
                </div>
            </Link>
            <Link href={ADMIN_SUB_CATEGORY_ADD}>
                <div className='flex items-center justify-between p-3 rounded-lg shadow bg-white dark:bg-card bg-gradient-to-tr from-green-400 via-green-500 to-green-600'>
                    <h4 className='font-medium text-white dark:text-black'>Add Sub-Category</h4>
                    <span className='w-12 h-12 border dark:border-green-800 flex justify-center items-center rounded-full text-white'>
                        <TbCategory2 size={20} />
                    </span>
                </div>
            </Link>
            <Link href={ADMIN_PRODUCT_ADD}>
                <div className='flex items-center justify-between p-3 rounded-lg shadow bg-white dark:bg-card bg-gradient-to-tr from-blue-400 via-blue-500 to-blue-600'>
                    <h4 className='font-medium text-white dark:text-black'>Add Product</h4>
                    <span className='w-12 h-12 border dark:border-blue-800 flex justify-center items-center rounded-full text-white'>
                        <RiProductHuntLine size={20} />
                    </span>
                </div>
            </Link>
            <Link href={ADMIN_MEDIA_SHOW}>
                <div className='flex items-center justify-between p-3 rounded-lg shadow bg-white dark:bg-card bg-gradient-to-tr from-cyan-400 via-cyan-500 to-cyan-600'>
                    <h4 className='font-medium text-white dark:text-black'>Upload Media</h4>
                    <span className='w-12 h-12 border dark:border-cyan-800 flex justify-center items-center rounded-full text-white'>
                        <MdOutlinePermMedia size={20} />
                    </span>
                </div>
            </Link>
        </div>
    )
}

export default QuickAdd