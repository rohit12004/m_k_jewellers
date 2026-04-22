import { getProductBySlug, getSimilarProducts } from '@/lib/product.service'
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

        // Fetch similar products based on subcategory
        const similarProductsResponse = await getSimilarProducts(
            response.data.product.subCategory?.id,
            response.data.product.id
        )

        return NextResponse.json({
            ...response,
            data: {
                ...response.data,
                similarProducts: similarProductsResponse.success ? similarProductsResponse.data : []
            }
        })

    } catch (error) {
        console.error('Error fetching product details API:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to fetch product details' },
            { status: 500 }
        )
    }
}
