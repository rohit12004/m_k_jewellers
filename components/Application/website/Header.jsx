import React from 'react'
import HeaderClient from './HeaderClient'
import { API_CATEGORY_GET_FEATURED } from '@/routes/websiteRoutes'

// Helper to get base URL for server-side fetching
const getBaseUrl = () => {
    // For production: use environment variable or default to localhost
    return process.env.NEXT_PUBLIC_BASE_URL
}

// Fetch categories with caching - revalidate every hour
async function getCategories() {
    try {
        const url = `${getBaseUrl()}${API_CATEGORY_GET_FEATURED}`
        console.log('🔍 Fetching categories from:', url)

        const res = await fetch(url, {
            next: {
                revalidate: 3600, // Cache for 1 hour (3600 seconds)
                tags: ['categories'] // Tag for on-demand revalidation
            }
        })

        console.log('📡 Response status:', res.status, res.ok)

        if (!res.ok) {
            console.log('❌ Response not OK, returning empty array')
            return []
        }

        const data = await res.json()
        console.log('📦 API Response:', data)
        console.log('✅ Categories count:', data.success ? data.data?.length : 0)

        return data.success ? data.data : []
    } catch (error) {
        console.error('❌ Error fetching header categories:', error)
        return []
    }
}

const Header = async () => {
    const categories = await getCategories()

    return <HeaderClient categories={categories} />
}

export default Header