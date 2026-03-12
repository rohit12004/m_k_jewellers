const ProductSkeleton = () => {
    return (
        <div className="animate-pulse px-4 md:px-32 py-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Left Side: Media Skeleton */}
                <div className="space-y-4">
                    <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-2xl w-full"></div>
                    <div className="grid grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Details Skeleton */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24"></div>
                        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                        <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-800">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="h-12 bg-gray-100 dark:bg-gray-900 rounded-xl"></div>
                            <div className="h-12 bg-gray-100 dark:bg-gray-900 rounded-xl"></div>
                        </div>
                        <div className="h-24 bg-gray-100 dark:bg-gray-900 rounded-xl w-full"></div>
                    </div>

                    <div className="space-y-4 pt-6">
                        <div className="h-14 bg-gray-200 dark:bg-gray-800 rounded-full w-full"></div>
                        <div className="h-14 bg-gray-100 dark:bg-gray-900 rounded-full w-full"></div>
                    </div>
                </div>
            </div>

            {/* Similar Products Skeleton */}
            <div className="mt-20 space-y-8">
                <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-48 mx-auto"></div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="space-y-3">
                            <div className="aspect-[4/5] bg-gray-200 dark:bg-gray-800 rounded-2xl w-full"></div>
                            <div className="h-4 bg-gray-100 dark:bg-gray-900 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-100 dark:bg-gray-900 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default function Loading() {
    return <ProductSkeleton />
}
