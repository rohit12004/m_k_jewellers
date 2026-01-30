import React from 'react'
import HeaderClient from './HeaderClient'
import prisma from '@/lib/prisma'

const Header = async () => {
    // ✅ Fetch categories on server during SSR - eliminates client-side delay
    let categories = [];
    try {
        categories = await prisma.category.findMany({
            where: { deletedAt: null },
            take: 8,
            orderBy: { createdAt: 'asc' },
            select: {
                id: true,
                name: true,
                slug: true,
            },
        });
    } catch (error) {
        console.error('❌ Failed to fetch categories in Header:', error);
        // Fail gracefully - empty array will be used
    }

    return <HeaderClient initialCategories={categories} />
}

export default Header