import Image from 'next/image'
import React from 'react'
import imgPlaceholder from '@/public/assets/img-placeholder.jpg'
import Link from 'next/link'

const CategoryBox = ({ category }) => {
    return (
        <div className='rounded-lg hover:shadow-lg border overflow-hidden group'>
            <Link href={`/shop?category=${category.slug}`}>
                <div className='relative'>
                    <Image
                        src={category?.media && category.media.length > 0 ? category.media[0].secure_url : imgPlaceholder.src}
                        width={300}
                        height={300}
                        alt={category?.media && category.media.length > 0 ? (category.media[0].alt || category.name) : category.name}
                        title={category?.media && category.media.length > 0 ? (category.media[0].title || category.name) : category.name}
                        className='w-full lg:h-[250px] sm:h-[200px] h-[150px] object-cover transition-transform duration-300 group-hover:scale-105'
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                        <div className="p-4 w-full">
                            <h4 className='text-white text-lg font-semibold'>{category?.name}</h4>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    )
}

export default CategoryBox
