import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

const MediaGridSkeleton = () => {
    return (
        <div className='grid lg:grid-cols-6 grid-cols-3 gap-2'>
            {Array.from({ length: 18 }).map((_, index) => (
                <div key={index} className='space-y-2'>
                    {/* Image skeleton */}
                    <Skeleton className='w-full aspect-square rounded-md' />
                </div>
            ))}
        </div>
    )
}

export default MediaGridSkeleton
