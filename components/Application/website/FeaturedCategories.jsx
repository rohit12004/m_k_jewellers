import Link from 'next/link'
import React from 'react'
import { IoIosArrowRoundForward } from "react-icons/io";
import CategoryBox from './CategoryBox';
import { API_CATEGORY_GET_FEATURED } from '@/routes/websiteRoutes'

// Helper to get base URL for server-side fetching
const getBaseUrl = () => {
    // For production: use environment variable or default to localhost
    return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
}

// Fetch categories with caching - revalidate every hour
async function getCategories() {
    try {
        const res = await fetch(`${getBaseUrl()}${API_CATEGORY_GET_FEATURED}`, {
            next: {
                revalidate: 3600, // Cache for 1 hour (3600 seconds)
                tags: ['categories'] // Tag for on-demand revalidation
            }
        })

        if (!res.ok) {
            throw new Error('Failed to fetch categories')
        }

        return res.json()
    } catch (error) {
        console.error('Error fetching categories:', error)
        return null
    }
}

const FeaturedCategories = async () => {
    const categoryData = await getCategories()

    if (!categoryData || !categoryData.success) return null

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
                {categoryData.data.map((category) => (
                    <CategoryBox key={category.id} category={category} />
                ))}
            </div>
        </section>
    )
}

export default FeaturedCategories
