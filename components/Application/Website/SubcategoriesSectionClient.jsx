'use client'
import React from 'react'
import SubcategoryCard from './SubcategoryCard'
import { useSubCategories } from '@/hooks/useSubCategories'

const SubcategoriesSectionClient = () => {
    const { data: subcategories = [], isLoading, isError } = useSubCategories()

    if (isLoading) {
        return (
            <section className='lg:px-32 px-2 sm:px-4 sm:py-10 py-5 bg-gray-50 dark:bg-gray-900'>
                <div className='grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-7 gap-3 sm:gap-4 md:gap-6'>
                    {/* Loading skeleton */}
                    {[...Array(7)].map((_, i) => (
                        <div key={i} className='animate-pulse'>
                            <div className='bg-gray-200 dark:bg-gray-700 rounded-lg aspect-square'></div>
                            <div className='bg-gray-200 dark:bg-gray-700 h-4 mt-2 rounded'></div>
                        </div>
                    ))}
                </div>
            </section>
        )
    }

    if (isError || !subcategories || subcategories.length === 0) {
        return null
    }

    return (
        <section className='lg:px-32 px-2 sm:px-4 sm:py-10 py-2 bg-gray-50 dark:bg-gray-900'>
            <div className='grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-7 gap-3 sm:gap-4 md:gap-6'>
                {subcategories.map((subcategory) => (
                    <SubcategoryCard key={subcategory.id} subcategory={subcategory} />
                ))}
            </div>
        </section>
    )
}

export default SubcategoriesSectionClient
