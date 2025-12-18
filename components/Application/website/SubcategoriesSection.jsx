import React from 'react'
import SubcategoryCard from './SubcategoryCard'
import { API_SUBCATEGORY_GET_ALL } from '@/routes/websiteRoutes'

// Helper to get base URL for server-side fetching
const getBaseUrl = () => {
    // For production: use environment variable or default to localhost
    return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
}

// Fetch subcategories with caching - revalidate every hour
async function getSubcategories() {
    try {
        const res = await fetch(`${getBaseUrl()}${API_SUBCATEGORY_GET_ALL}`, {
            next: {
                revalidate: 3600, // Cache for 1 hour (3600 seconds)
                tags: ['subcategories'] // Tag for on-demand revalidation
            }
        })

        if (!res.ok) {
            throw new Error('Failed to fetch subcategories')
        }

        return res.json()
    } catch (error) {
        console.error('Error fetching subcategories:', error)
        return null
    }
}

const SubcategoriesSection = async () => {
    const subcategoryData = await getSubcategories()

    if (!subcategoryData || !subcategoryData.success) {
        return null
    }

    return (
        <section className='lg:px-32 px-4 sm:py-10 py-8 bg-gray-50 dark:bg-gray-900'>
            <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6'>
                {subcategoryData.data.map((subcategory) => (
                    <SubcategoryCard key={subcategory.id} subcategory={subcategory} />
                ))}
            </div>
        </section>
    )
}

export default SubcategoriesSection
