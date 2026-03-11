import { getProductBySlug } from '@/lib/product.service'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
    try {
        const { slug } = await params
        const { searchParams } = new URL(request.url)

        const filters = {
            purity: searchParams.get('purity'),
            size: searchParams.get('size'),
            weight: searchParams.get('weight')
        }

        const response = await getProductBySlug(slug, filters)

        if (!response.success) {
            return NextResponse.json(
                { success: false, message: response.message },
                { status: response.status || 404 }
            )
        }

        return NextResponse.json(response)

    } catch (error) {
        console.error('Error fetching product details API:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to fetch product details' },
            { status: 500 }
        )
    }
}
