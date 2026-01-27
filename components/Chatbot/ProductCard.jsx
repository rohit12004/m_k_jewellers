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
        shopUrl, // New shop URL with filters
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
        <div className="group bg-white border border-amber-100 rounded-xl overflow-hidden hover:border-amber-300 hover:shadow-lg transition-all duration-300 w-full h-full flex flex-col">
            {/* Product Image - Top - Link to Product Details */}
            <div className="relative w-full h-32 flex-shrink-0 bg-gradient-to-br from-amber-50 to-yellow-50 overflow-hidden">
                <Link href={shopUrl || `/shop`} className="block w-full h-full">
                    {image ? (
                        <Image
                            src={image}
                            alt={imageAlt || name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            sizes="220px"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Tag className="w-8 h-8 text-amber-300" />
                        </div>
                    )}
                </Link>

                {/* Category Badge */}
                {category && (
                    <div className="absolute top-2 right-2 bg-amber-600/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm pointer-events-none">
                        {category}
                    </div>
                )}
            </div>

            {/* Product Details - Bottom */}
            <div className="p-3 flex flex-col flex-1 gap-2">
                {/* Name - Link to Product Details */}

                <h4 className="font-semibold text-gray-800 text-sm line-clamp-2 group-hover:text-amber-700 transition-colors leading-tight min-h-[2.5em]">
                    {name}
                </h4>


                {/* Specifications */}
                {(purity || weight) && (
                    <div className="flex flex-wrap gap-1.5 text-[10px] text-gray-500">
                        {purity && (
                            <span className="bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                                {purity}
                            </span>
                        )}
                        {weight && (
                            <span className="bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                                {weight}g
                            </span>
                        )}
                    </div>
                )}

                <div className="mt-auto pt-2 flex items-center justify-between border-t border-amber-50">
                    <div className="font-bold text-amber-700 text-sm">
                        {formattedPrice}
                    </div>

                    {/* Arrow Button - Link to SHOP with Filters */}
                    <Link
                        href={shopUrl || `/shop`}
                        className="bg-amber-100 p-1.5 rounded-full text-amber-600 hover:bg-amber-600 hover:text-white transition-all transform hover:scale-105"
                        title="View similar items in Shop"
                    >
                        <ExternalLink size={14} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
