import Image from 'next/image'
import React from 'react'
import imgPlaceholder from '@/public/assets/img-placeholder.jpg'
import Link from 'next/link'
import { WEBSITE_PRODUCT_DETAILS } from '@/routes/websiteRoutes'
const ProductBox = ({ product }) => {

    return (
        <div className='rounded-lg hover:shadow-lg border overflow-hidden'>
            <Link href={WEBSITE_PRODUCT_DETAILS(product.slug)}>
                <Image
                    src={product?.media[0]?.secure_url || imgPlaceholder.src}
                    width={400}
                    height={400}
                    alt={product?.media[0]?.alt || product?.name}
                    title={product?.media[0]?.title || product?.name}
                    className='w-full lg:h-[300px] sm:h-[250px] h-[150px] object-cover object-top'
                />
                <div className="p-3 border-t">
                    <h4>{product?.name}</h4>
                </div>
            </Link>
        </div>
    )
}

export default ProductBox