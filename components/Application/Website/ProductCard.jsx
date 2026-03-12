import Image from 'next/image'
import React from 'react'
import imgPlaceholder from '@/public/assets/img-placeholder.jpg'
import Link from 'next/link'

const ProductCard = ({ product }) => {
    const imageUrl = product?.media && product.media.length > 0
        ? product.media[0].secure_url
        : imgPlaceholder.src

    const imageAlt = product?.media && product.media.length > 0
        ? (product.media[0].alt || product.name)
        : product.name

    return (
        <Link
            href={`/product/${product.slug}`}
            className='group block w-full'
        >
            <div className='flex flex-col w-full'>
                {/* Product Image Container */}
                <div className='w-full aspect-square rounded-lg bg-white dark:bg-gray-800 p-1.5 sm:p-2 mb-2 shadow-sm hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02] overflow-hidden'>
                    <div className='w-full h-full relative rounded-md overflow-hidden'>
                        {/* Image */}
                        <Image
                            src={imageUrl}
                            fill
                            alt={imageAlt}
                            title={product.name}
                            className='object-cover transition-opacity duration-300 group-hover:opacity-30'
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 20vw, 15vw"
                        />

                        {/* Description Overlay - Shows on Hover */}
                        {product.description && (
                            <div className='absolute inset-0 flex items-center justify-center p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                                <p className='text-[10px] sm:text-xs text-gray-800 dark:text-gray-100 text-center font-medium line-clamp-3'>
                                    {product.description}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Product Name & Details */}
                <div className='px-1'>
                    <h3 className='text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-primary transition-colors duration-300 line-clamp-2 text-center'>
                        {product.name}
                    </h3>

                    {/* Product Weight */}
                    {product.variants && product.variants.length > 0 && (
                        <p className='text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center mt-0.5 font-medium'>
                            {product.variants[0].weight}g
                        </p>
                    )}

                    {/* Product Price */}
                    {product.variants && product.variants.length > 0 && product.variants[0].calculatedPrice ? (
                        <div className='mt-1'>
                            <p className='text-sm sm:text-base font-bold text-primary text-center'>
                                ₹{product.variants[0].calculatedPrice.finalPrice.toLocaleString('en-IN')}
                            </p>
                            {product.variants.length > 1 && (
                                <p className='text-[10px] text-gray-500 dark:text-gray-400 text-center mt-0.5'>
                                    +{product.variants.length - 1} more
                                </p>
                            )}
                        </div>
                    ) : (
                        <p className='text-xs text-gray-500 dark:text-gray-400 text-center mt-1'>
                            Price on request
                        </p>
                    )}
                </div>
            </div>
        </Link>
    )
}

export default ProductCard
