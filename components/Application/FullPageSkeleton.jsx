import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

const FullPageSkeleton = () => {
    return (
        <div className='min-h-screen w-full flex justify-center items-start mt-12 px-4 overflow-hidden'>
            <div className='w-full max-w-6xl space-y-8'>
                {/* Header skeleton */}
                <div className='space-y-3'>
                    <Skeleton className='h-12 w-3/4' />
                    <Skeleton className='h-6 w-1/2' />
                </div>

                {/* Content blocks */}
                <div className='space-y-4'>
                    <Skeleton className='h-32 w-full' />
                    <Skeleton className='h-32 w-full' />
                    <Skeleton className='h-32 w-full' />
                </div>

                {/* Grid skeleton */}
                <div className='grid md:grid-cols-3 gap-4'>
                    <Skeleton className='h-48 w-full' />
                    <Skeleton className='h-48 w-full' />
                    <Skeleton className='h-48 w-full' />
                </div>
            </div>
        </div>
    )
}

export default FullPageSkeleton
