import { getProductBySlug, getSimilarProducts } from '@/lib/product.service'
import Link from 'next/link'
import ProductDetails from '@/components/Application/Website/ProductDetails'

const ProductPage = async ({ params, searchParams }) => {
    const { slug } = await params
    const filters = await searchParams

    try {
        const response = await getProductBySlug(slug, filters)

        if (!response.success) {
            return (
                <div className='flex justify-center items-center py-10 min-h-[400px]'>
                    <div className='text-center'>
                        <h1 className='text-4xl font-semibold mb-4'>Product not found</h1>
                        <p className='text-gray-600 dark:text-gray-400 mb-6'>
                            The product you're looking for doesn't exist or has been removed.
                        </p>
                        <a
                            href='/shop'
                            className='inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors'
                        >
                            Go to Shop
                        </a>
                    </div>
                </div>
            )
        }

        // Fetch similar products in parallel with any other possible data needs
        const similarProductsPromise = getSimilarProducts(
            response.data.product.subCategory?.id,
            response.data.product.id
        )

        const [similarProductsResponse] = await Promise.all([similarProductsPromise])

        return (
            <ProductDetails
                product={response.data.product}
                selectedVariant={response.data.selectedVariant}
                allVariants={response.data.allVariants}
                purities={response.data.purities}
                sizes={response.data.sizes}
                weights={response.data.weights}
                media={response.data.media}
                similarProducts={similarProductsResponse.success ? similarProductsResponse.data : []}
            />
        )


    } catch (error) {
        console.error('Error fetching product:', error)

        return (
            <div className='flex justify-center items-center py-10 min-h-[400px]'>
                <div className='text-center'>
                    <h1 className='text-4xl font-semibold mb-4 text-red-600 dark:text-red-400'>
                        Error Loading Product
                    </h1>
                    <p className='text-gray-600 dark:text-gray-400 mb-6'>
                        {error.message || 'Failed to load product details. Please try again.'}
                    </p>
                    <Link
                        href={`/product/${slug}`}
                        className='inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors'
                    >
                        Retry
                    </Link>
                </div>
            </div>
        )
    }
}

export default ProductPage
