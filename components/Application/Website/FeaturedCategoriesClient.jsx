'use client'
import React from 'react'
import Link from 'next/link'
import { IoIosArrowRoundForward } from "react-icons/io";
import CategoryBox from './CategoryBox';
import { useCategories } from '@/hooks/useCategories';

const FeaturedCategoriesClient = () => {
    const { data: categories = [], isLoading } = useCategories()

    if (isLoading) {
        return (
            <section className='lg:px-32 px-4 sm:py-10'>
                <div className='flex justify-between items-center mb-5'>
                    <div className='h-8 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse'></div>
                </div>
                <div className='grid md:grid-cols-4 grid-cols-2 sm:gap-10 gap-2'>
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className='bg-gray-200 dark:bg-gray-700 aspect-square rounded animate-pulse'></div>
                    ))}
                </div>
            </section>
        )
    }

    if (!categories || categories.length === 0) return null

    return (
        <section className='lg:px-32 px-4 sm:py-10'>
            <div className='flex justify-between items-center mb-5'>
                <h2 className='sm:text-2xl text-lg font-semibold'>Shop by Category</h2>
                {/* <Link href="/categories" className='flex items-center gap-2 underline underline-offset-4 hover:text-primary'>
                    View All
                    <IoIosArrowRoundForward />
                </Link> */}
            </div>
            <div className='grid md:grid-cols-4 grid-cols-2 sm:gap-10 gap-2'>
                {categories.map((category) => (
                    <CategoryBox key={category.id} category={category} />
                ))}
            </div>
        </section>
    )
}

export default FeaturedCategoriesClient
