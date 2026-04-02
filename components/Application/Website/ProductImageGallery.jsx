'use client'

import Image from 'next/image'
import { useState } from 'react'
import imgPlaceholder from '@/public/assets/img-placeholder.jpg'
import { Button } from '@/components/ui/button'
import { ScanFace } from 'lucide-react'

const ProductImageGallery = ({ media, productName, tryOnImage, onTryOn }) => {
    const [activeImage, setActiveImage] = useState(media && media.length > 0 ? media[0].secure_url : imgPlaceholder.src)

    const handleThumbnailClick = (imageUrl) => {
        setActiveImage(imageUrl)
    }

    // If no media, show placeholder
    if (!media || media.length === 0) {
        return (
            <div className="w-full">
                <div className="mb-5">
                <div className="relative aspect-square w-full bg-white dark:bg-gray-800 overflow-hidden p-4">
                    <Image
                        src={imgPlaceholder.src}
                        fill
                        alt={productName}
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                </div>
                </div>
            </div>
        )
    }

    return (
        <div className="xl:flex xl:justify-center xl:gap-5">
            <div className="xl:order-last xl:mb-0 mb-5 xl:w-[calc(100%-144px)] flex-1 relative flex flex-col items-center">
                <div className="relative aspect-square w-full bg-white dark:bg-gray-800 overflow-hidden p-2 sm:p-4 border border-gray-200 rounded-lg shadow-sm">
                    <Image
                        src={activeImage}
                        fill
                        alt={productName}
                        className="object-contain"
                        priority
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                </div>

                {/* Virtual Try On Button - Centered below image */}
                {tryOnImage && (
                    <div className="mt-4 w-full flex justify-center">
                        <Button
                            variant="outline"
                            className="w-full md:w-3/4 py-4 md:py-6 border-blue-500 text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 group shadow-sm hover:shadow-md"
                            onClick={onTryOn}
                        >
                            <ScanFace className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            <span className="text-sm md:text-base font-medium">Virtual Try-On</span>
                        </Button>
                    </div>
                )}
            </div>

            {/* Thumbnail Strip */}
            <div className="flex xl:flex-col items-center xl:gap-5 gap-3 xl:w-36 overflow-auto xl:pb-0 pb-2 xl:max-h-[600px]">
                {media.map((image) => (
                    <div
                        key={image.id}
                        className={`relative aspect-square w-16 sm:w-20 md:w-24 rounded-lg cursor-pointer transition-all hover:opacity-80 overflow-hidden border-2 ${image.secure_url === activeImage
                                ? 'border-primary'
                                : 'border-gray-200 dark:border-gray-700'
                            }`}
                        onClick={() => handleThumbnailClick(image.secure_url)}
                    >
                        <Image
                            src={image.secure_url}
                            fill
                            alt={image.alt || productName}
                            className="object-contain p-1"
                            sizes="100px"
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ProductImageGallery
