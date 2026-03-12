import Image from 'next/image'
import React from 'react'
import imgPlaceholder from '@/public/assets/img-placeholder.jpg'
import Link from 'next/link'

const SubcategoryCard = ({ subcategory }) => {
    const imageUrl = subcategory?.media && subcategory.media.length > 0
        ? subcategory.media[0].secure_url
        : imgPlaceholder.src

    return (
        <Link href={`/shop?subcategory=${subcategory.slug}`} className='group block w-full'>
            <div className='flex flex-col items-center text-center w-full max-w-[140px] mx-auto'>
                {/* Clean image container without border/background */}
                <div className='w-full aspect-square rounded-xl mb-2 transition-transform duration-300 group-hover:scale-105 overflow-hidden'>
                    <div className='w-full h-full relative'>
                        <Image
                            src={imageUrl}
                            fill
                            alt={subcategory?.media && subcategory.media.length > 0 ? (subcategory.media[0].alt || subcategory.name) : subcategory.name}
                            title={subcategory?.media && subcategory.media.length > 0 ? (subcategory.media[0].title || subcategory.name) : subcategory.name}
                            className='object-cover rounded-lg'
                            sizes="(max-width: 768px) 25vw, (max-width: 1024px) 16vw, 12vw"
                        />
                    </div>
                </div>
                {/* Fixed height text container */}
                <div className='h-10 sm:h-10 flex items-center justify-center w-full px-1'>
                    <h4 className='text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors duration-300 line-clamp-2 text-center'>
                        {subcategory?.name}
                    </h4>
                </div>
            </div>
        </Link>
    )
}

export default SubcategoryCard
