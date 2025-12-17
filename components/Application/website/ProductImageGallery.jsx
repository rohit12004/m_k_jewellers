'use client'

import Image from 'next/image'
import { useState } from 'react'
import imgPlaceholder from '@/public/assets/img-placeholder.jpg'

const ProductImageGallery = ({ media, productName }) => {
    const [activeImage, setActiveImage] = useState(media && media.length > 0 ? media[0].secure_url : imgPlaceholder.src)

    const handleThumbnailClick = (imageUrl) => {
        setActiveImage(imageUrl)
    }

    // If no media, show placeholder
    if (!media || media.length === 0) {
        return (
            <div className="w-full">
                <div className="mb-5">
                    <Image
                        src={imgPlaceholder.src}
                        width={650}
                        height={650}
                        alt={productName}
                        className="border rounded max-w-full"
                    />
                </div>
            </div>
        )
    }

    return (
        <div className="xl:flex xl:justify-center xl:gap-5">
            {/* Main Image */}
            <div className="xl:order-last xl:mb-0 mb-5 xl:w-[calc(100%-144px)]">
                <Image
                    src={activeImage}
                    width={650}
                    height={650}
                    alt={productName}
                    className="border rounded max-w-full object-cover"
                    priority
                />
            </div>

            {/* Thumbnail Strip */}
            <div className="flex xl:flex-col items-center xl:gap-5 gap-3 xl:w-36 overflow-auto xl:pb-0 pb-2 xl:max-h-[600px]">
                {media.map((image) => (
                    <Image
                        key={image.id}
                        src={image.secure_url}
                        width={100}
                        height={100}
                        alt={image.alt || productName}
                        className={`md:max-w-full max-w-16 rounded cursor-pointer transition-all hover:opacity-80 ${image.secure_url === activeImage
                                ? 'border-2 border-primary'
                                : 'border border-gray-300'
                            }`}
                        onClick={() => handleThumbnailClick(image.secure_url)}
                    />
                ))}
            </div>
        </div>
    )
}

export default ProductImageGallery
