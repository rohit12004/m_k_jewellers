import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET - Fetch all metal rates using predefined purities
export async function GET() {
    try {
        // Predefined purity combinations (matching purityHelper.js)
        const predefinedCombos = [
            // Gold purities
            { categoryName: 'Gold', purity: '18K' },
            { categoryName: 'Gold', purity: '22K' },
            { categoryName: 'Gold', purity: '24K' },
            // Silver purities
            { categoryName: 'Silver', purity: '92.5' },
            { categoryName: 'Silver', purity: '99.9' },
        ]

        // Get existing rates from database
        const existingRates = await prisma.metalRate.findMany({
            orderBy: [
                { categoryName: 'asc' },
                { purity: 'asc' }
            ]
        })

        // Create a map of existing rates
        const ratesMap = new Map()
        existingRates.forEach(rate => {
            const key = `${rate.categoryName}-${rate.purity}`
            ratesMap.set(key, rate)
        })

        // Build response using predefined combos
        const allRates = predefinedCombos.map(({ categoryName, purity }) => {
            const key = `${categoryName}-${purity}`
            const existingRate = ratesMap.get(key)

            if (existingRate) {
                // Rate exists, use it
                return existingRate
            } else {
                // New combo - create placeholder with rate = 0
                return {
                    id: `new-${key}`,
                    categoryName,
                    purity,
                    ratePerGram: 0,
                    updatedAt: new Date(),
                    createdAt: new Date(),
                    isNew: true
                }
            }
        })

        return NextResponse.json({
            success: true,
            data: allRates
        })
    } catch (error) {
        console.error('Error fetching metal rates:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to fetch metal rates' },
            { status: 500 }
        )
    }
}

// POST - Update metal rates (admin only)
export async function POST(request) {
    try {
        const body = await request.json()
        const { rates } = body

        if (!rates || !Array.isArray(rates)) {
            return NextResponse.json(
                { success: false, message: 'Invalid request format. Expected { rates: [...] }' },
                { status: 400 }
            )
        }

        // Update each rate
        const updates = await Promise.all(
            rates.map(rate =>
                prisma.metalRate.upsert({
                    where: {
                        categoryName_purity: {
                            categoryName: rate.categoryName,
                            purity: rate.purity
                        }
                    },
                    update: {
                        ratePerGram: parseFloat(rate.ratePerGram),
                        updatedAt: new Date()
                    },
                    create: {
                        categoryName: rate.categoryName,
                        purity: rate.purity,
                        ratePerGram: parseFloat(rate.ratePerGram)
                    }
                })
            )
        )

        return NextResponse.json({
            success: true,
            message: 'Metal rates updated successfully',
            data: updates
        })
    } catch (error) {
        console.error('Error updating metal rates:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to update metal rates' },
            { status: 500 }
        )
    }
}
