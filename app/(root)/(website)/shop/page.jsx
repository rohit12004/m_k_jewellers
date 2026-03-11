'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useProductsBySubcategory, useFilterOptions } from '@/hooks/useWebsiteData'
import ProductCard from '@/components/Application/Website/ProductCard'
import ProductFilters from '@/components/Application/Website/ProductFilters'
import FilterModal from '@/components/Application/Website/FilterModal'
import ActiveFilters from '@/components/Application/Website/ActiveFilters'
import Link from 'next/link'
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io'

const ShopPage = () => {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()

    // Store initial subcategory from URL (pre-selected)
    const initialSubcategory = searchParams.get('subcategory') || null

    // Initialize filters from URL
    const [filters, setFilters] = useState({
        subcategory: initialSubcategory,
        category: searchParams.get('category') || null,
        gender: searchParams.get('gender') || null,
        purity: searchParams.get('purity') || null,
        sortBy: searchParams.get('sortBy') || 'newest',
        page: parseInt(searchParams.get('page') || '1', 10),
        limit: 12,
    })

    // Update filters when URL changes
    useEffect(() => {
        setFilters({
            subcategory: searchParams.get('subcategory') || null,
            category: searchParams.get('category') || null,
            gender: searchParams.get('gender') || null,
            purity: searchParams.get('purity') || null,
            sortBy: searchParams.get('sortBy') || 'newest',
            page: parseInt(searchParams.get('page') || '1', 10),
            limit: 12,
        })
    }, [searchParams])

    // Fetch filter options (don't pass current filters to show all options)
    const { data: filterOptionsData } = useFilterOptions({})

    // Fetch products with filters
    const { data, isLoading, error } = useProductsBySubcategory(filters)

    // Update URL when filters change
    const updateURL = (newFilters) => {
        const params = new URLSearchParams()

        Object.entries(newFilters).forEach(([key, value]) => {
            if (value !== null && value !== '' && key !== 'limit') {
                params.set(key, value)
            }
        })

        router.push(`${pathname}?${params.toString()}`, { scroll: false })
    }

    // Handle filter change
    const handleFilterChange = (filterType, value) => {
        const newFilters = {
            ...filters,
            [filterType]: value,
            page: 1, // Reset to page 1 when filters change
        }
        setFilters(newFilters)
        updateURL(newFilters)
    }

    // Handle removing a single filter
    const handleRemoveFilter = (filterType, value) => {
        if (filterType === 'gender') {
            const newFilters = {
                ...filters,
                gender: null,
                page: 1,
            }
            setFilters(newFilters)
            updateURL(newFilters)
        } else {
            // For multi-select filters (subcategory, category, purity)
            const currentValues = filters[filterType]?.split(',').filter(Boolean) || []
            const newValues = currentValues.filter(v => v !== value)
            const newFilters = {
                ...filters,
                [filterType]: newValues.length > 0 ? newValues.join(',') : null,
                page: 1,
            }
            setFilters(newFilters)
            updateURL(newFilters)
        }
    }

    // Clear all filters (including pre-selected subcategory)
    const handleClearAll = () => {
        const newFilters = {
            subcategory: null, // Clear all subcategories
            category: null,
            gender: null,
            purity: null,
            sortBy: 'newest',
            page: 1,
            limit: 12,
        }
        setFilters(newFilters)
        updateURL(newFilters)
    }

    // Count active filters (including pre-selected subcategory)
    const getActiveFilterCount = () => {
        let count = 0

        // Subcategory
        if (filters.subcategory) {
            count += filters.subcategory.split(',').filter(Boolean).length
        }

        // Category
        if (filters.category) {
            count += filters.category.split(',').filter(Boolean).length
        }

        // Gender
        if (filters.gender) count++

        // Purity
        if (filters.purity) {
            count += filters.purity.split(',').filter(Boolean).length
        }

        return count
    }

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

    const products = data?.data?.products || []
    const subcategoryData = data?.data?.subcategory
    const meta = data?.meta || {}

    // Get page title
    const getPageTitle = () => {
        if (subcategoryData) {
            return subcategoryData.name
        }
        if (filters.category) {
            const category = filterOptionsData?.data?.categories?.find(c => c.slug === filters.category)
            return category?.name || 'Products'
        }
        // No filters selected
        if (!filters.subcategory && !filters.category) {
            return 'All Products'
        }
        return 'Products'
    }

    return (
        <div className='min-h-screen lg:px-32 px-4 py-10'>
            {/* Header with Mobile Filter Button */}
            <div className='mb-6'>
                <div className='flex items-center justify-between mb-4'>
                    <h1 className='text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200'>
                        {getPageTitle()}
                    </h1>

                    {/* Mobile Filter Button */}
                    <div className='lg:hidden'>
                        <FilterModal
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            filterOptions={filterOptionsData?.data}
                            onClearAll={handleClearAll}
                            productCount={meta.totalProducts}
                            activeFilterCount={getActiveFilterCount()}
                        />
                    </div>
                </div>

                {/* Active Filters */}
                <ActiveFilters
                    filters={filters}
                    onRemoveFilter={handleRemoveFilter}
                    onClearAll={handleClearAll}
                    filterOptions={filterOptionsData?.data}
                />

                <p className='text-gray-600 dark:text-gray-400'>
                    Showing {products.length} of {meta.totalProducts || 0} products
                </p>
            </div>

            {/* Main Content: Filters + Products */}
            <div className='flex gap-8'>
                {/* Desktop Filter Sidebar */}
                <aside className='hidden lg:block w-64 flex-shrink-0'>
                    <div className='sticky top-24'>
                        <ProductFilters
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            filterOptions={filterOptionsData?.data}
                            onClearAll={handleClearAll}
                            activeFilterCount={getActiveFilterCount()}
                        />
                    </div>
                </aside>

                {/* Products Grid */}
                <div className='flex-1'>
                    {products.length === 0 ? (
                        <div className='flex items-center justify-center h-96'>
                            <div className='text-center'>
                                <p className='text-gray-600 dark:text-gray-400 text-lg mb-4'>No products found</p>
                                <button
                                    onClick={handleClearAll}
                                    className='text-primary hover:underline'
                                >
                                    Clear all filters
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-10'>
                                {products.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {meta.totalPages > 1 && (
                                <div className='flex items-center justify-center gap-4 mt-8'>
                                    {/* Previous Button */}
                                    <button
                                        onClick={() => handleFilterChange('page', Math.max(1, meta.currentPage - 1))}
                                        disabled={meta.currentPage === 1}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${meta.currentPage === 1
                                            ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800'
                                            : 'hover:bg-primary hover:text-white hover:border-primary'
                                            }`}
                                    >
                                        <IoIosArrowBack />
                                        <span>Previous</span>
                                    </button>

                                    {/* Page Info */}
                                    <div className='px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg'>
                                        <span className='text-sm font-medium'>
                                            Page {meta.currentPage} of {meta.totalPages}
                                        </span>
                                    </div>

                                    {/* Next Button */}
                                    <button
                                        onClick={() => handleFilterChange('page', Math.min(meta.totalPages, meta.currentPage + 1))}
                                        disabled={meta.currentPage === meta.totalPages}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${meta.currentPage === meta.totalPages
                                            ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800'
                                            : 'hover:bg-primary hover:text-white hover:border-primary'
                                            }`}
                                    >
                                        <span>Next</span>
                                        <IoIosArrowForward />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ShopPage
