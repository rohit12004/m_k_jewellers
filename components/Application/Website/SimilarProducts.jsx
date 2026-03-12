'use client'

import React from 'react'
import ProductCard from './ProductCard'

const SimilarProducts = ({ products }) => {
    if (!products || products.length === 0) return null

    return (
        <div className="mt-16 mb-10">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                <span className="w-1.5 h-8 bg-primary rounded-full"></span>
                Similar Products
            </h2>
            <div className="grid grid-cols-5 gap-2 md:gap-5">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    )
}

export default SimilarProducts
