'use client'

import React from 'react'
import { useSearchParams } from 'next/navigation'
import { useProductsBySubcategory } from '@/hooks/useWebsiteData'
import ProductCard from '@/components/Application/website/ProductCard'
import Link from 'next/link'
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io'

const ShopPage = () => {
    const searchParams = useSearchParams()
    const subcategory = searchParams.get('subcategory')
    const page = parseInt(searchParams.get('page') || '1', 10)

    // Fetch products using TanStack Query with caching
    const { data, isLoading, error } = useProductsBySubcategory(subcategory, page, 12)

    // Loading state
    if (isLoading) {
        return (
            <div className='min-h-screen lg:px-32 px-4 py-10'>
                <div className='flex items-center justify-center h-96'>
                    <div className='text-center'>
                        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
                        <p className='text-gray-600 dark:text-gray-400'>Loading products...</p>
                    </div>
                </div>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className='min-h-screen lg:px-32 px-4 py-10'>
                <div className='flex items-center justify-center h-96'>
                    <div className='text-center'>
                        <p className='text-red-600 dark:text-red-400 text-lg mb-2'>Error loading products</p>
                        <p className='text-gray-600 dark:text-gray-400'>{error?.message || 'Something went wrong'}</p>
                    </div>
                </div>
            </div>
        )
    }

    // No subcategory selected
    if (!subcategory) {
        return (
            <div className='min-h-screen lg:px-32 px-4 py-10'>
                <div className='flex items-center justify-center h-96'>
                    <div className='text-center'>
                        <p className='text-gray-600 dark:text-gray-400 text-lg'>Please select a subcategory to view products</p>
                        <Link href="/" className='text-primary hover:underline mt-4 inline-block'>
                            Go to Homepage
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    const products = data?.data?.products || []
    const subcategoryData = data?.data?.subcategory
    const meta = data?.meta || {}

    // Empty state
    if (products.length === 0) {
        return (
            <div className='min-h-screen lg:px-32 px-4 py-10'>
                <div className='mb-8'>
                    <h1 className='text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200'>
                        {subcategoryData?.name || 'Products'}
                    </h1>
                </div>
                <div className='flex items-center justify-center h-96'>
                    <div className='text-center'>
                        <p className='text-gray-600 dark:text-gray-400 text-lg mb-4'>No products found in this category</p>
                        <Link href="/" className='text-primary hover:underline'>
                            Go to Homepage
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className='min-h-screen lg:px-32 px-4 py-10'>
            {/* Page Header */}
            <div className='mb-8'>
                <h1 className='text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2'>
                    {subcategoryData?.name || 'Products'}
                </h1>
                <p className='text-gray-600 dark:text-gray-400'>
                    Showing {products.length} of {meta.totalProducts} products
                </p>
            </div>

            {/* Products Grid */}
            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 mb-10'>
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            {/* Pagination */}
            {meta.totalPages > 1 && (
                <div className='flex items-center justify-center gap-4 mt-8'>
                    {/* Previous Button */}
                    <Link
                        href={`/shop?subcategory=${subcategory}&page=${Math.max(1, meta.currentPage - 1)}`}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${meta.currentPage === 1
                            ? 'opacity-50 pointer-events-none bg-gray-100 dark:bg-gray-800'
                            : 'hover:bg-primary hover:text-white hover:border-primary'
                            }`}
                    >
                        <IoIosArrowBack />
                        <span>Previous</span>
                    </Link>

                    {/* Page Info */}
                    <div className='px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg'>
                        <span className='text-sm font-medium'>
                            Page {meta.currentPage} of {meta.totalPages}
                        </span>
                    </div>

                    {/* Next Button */}
                    <Link
                        href={`/shop?subcategory=${subcategory}&page=${Math.min(meta.totalPages, meta.currentPage + 1)}`}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${meta.currentPage === meta.totalPages
                            ? 'opacity-50 pointer-events-none bg-gray-100 dark:bg-gray-800'
                            : 'hover:bg-primary hover:text-white hover:border-primary'
                            }`}
                    >
                        <span>Next</span>
                        <IoIosArrowForward />
                    </Link>
                </div>
            )}
        </div>
    )
}

export default ShopPage
