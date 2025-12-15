import React from 'react'
import HeaderClient from './HeaderClient'

// Fetch categories with caching - revalidate every hour
async function getCategories() {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/category/get-featured-categories`, {
            next: {
                revalidate: 3600, // Cache for 1 hour (3600 seconds)
                tags: ['categories'] // Tag for on-demand revalidation
            }
        })

        if (!res.ok) {
            return []
        }

        const data = await res.json()
        return data.success ? data.data : []
    } catch (error) {
        console.error('Error fetching header categories:', error)
        return []
    }
}

const Header = async () => {
    const categories = await getCategories()

    return <HeaderClient categories={categories} />
}

export default Header