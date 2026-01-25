'use client'
import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink, Tag } from 'lucide-react'

/**
 * ProductCard Component
 * 
 * Displays a compact product card in the chatbot with image, name, price, and link.
 * Styled with gold/amber theme to match the M.K. Jewellers brand.
 */
export default function ProductCard({ product }) {
    const {
        id,
        name,
        slug,
        description,
        category,
        price,
        image,
        imageAlt,
        productUrl,
        purity,
        weight
    } = product;

    // Format price in Indian Rupees
    const formattedPrice = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(price);

    return (
        <div className="group bg-white border-2 border-amber-100 rounded-xl overflow-hidden hover:border-amber-300 hover:shadow-lg transition-all duration-300">
            <div className="flex gap-3 p-3">
                {/* Product Image */}
                <div className="relative w-24 h-24 flex-shrink-0 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg overflow-hidden">
                    {image ? (
                        <Image
                            src={image}
                            alt={imageAlt || name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                            sizes="96px"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Tag className="w-8 h-8 text-amber-300" />
                        </div>
                    )}

                    {/* Category Badge */}
                    {category && (
                        <div className="absolute top-1 right-1 bg-amber-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                            {category}
                        </div>
                    )}
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                    {/* Name and Description */}
                    <div>
                        <h4 className="font-semibold text-gray-800 text-sm line-clamp-1 group-hover:text-amber-700 transition-colors">
                            {name}
                        </h4>
                        {description && (
                            <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                                {description}
                            </p>
                        )}

                        {/* Specifications */}
                        {(purity || weight) && (
                            <div className="flex gap-2 mt-1 text-xs text-gray-600">
                                {purity && (
                                    <span className="bg-amber-50 px-2 py-0.5 rounded">
                                        {purity}
                                    </span>
                                )}
                                {weight && (
                                    <span className="bg-amber-50 px-2 py-0.5 rounded">
                                        {weight}g
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Price and Link */}
                    <div className="flex items-center justify-between mt-2">
                        <div className="font-bold text-amber-700 text-base">
                            {formattedPrice}
                        </div>

                        <Link
                            href={productUrl || `/products/${slug}`}
                            target="_blank"
                            className="flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 hover:gap-2 transition-all"
                        >
                            View Details
                            <ExternalLink size={12} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
