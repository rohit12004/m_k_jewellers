import React from 'react'
import { CheckCircle2, Circle, XCircle } from 'lucide-react'

const OrderTimeline = ({ currentStatus }) => {
    const statuses = [
        { key: 'PENDING', label: 'Placed' },
        { key: 'CONFIRMED', label: 'Confirmed' },
        { key: 'PROCESSING', label: 'Processing' },
        { key: 'SHIPPED', label: 'Shipped' },
        { key: 'DELIVERED', label: 'Delivered' }
    ]

    // Handle cancelled status separately
    const isCancelled = currentStatus === 'CANCELLED'

    if (isCancelled) {
        return (
            <div className='flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-4'>
                <div className='w-10 h-10 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0'>
                    <XCircle className='text-white' size={20} />
                </div>
                <div>
                    <h3 className='font-semibold text-red-900'>Order Cancelled</h3>
                    <p className='text-sm text-red-700'>This order has been cancelled</p>
                </div>
            </div>
        )
    }

    // Find current status index
    const currentIndex = statuses.findIndex(s => s.key === currentStatus)

    return (
        <div className='w-full'>
            {/* Desktop/Tablet View */}
            <div className='hidden sm:block'>
                <div className='flex items-center justify-between'>
                    {statuses.map((status, index) => {
                        const isCompleted = index <= currentIndex
                        const isCurrent = index === currentIndex
                        const isLast = index === statuses.length - 1

                        return (
                            <React.Fragment key={status.key}>
                                {/* Status Item */}
                                <div className='flex flex-col items-center gap-2 flex-1'>
                                    {/* Icon */}
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${isCompleted
                                                ? 'bg-green-500 border-green-500'
                                                : 'bg-white border-gray-300'
                                            }`}
                                    >
                                        {isCompleted ? (
                                            <CheckCircle2 className='text-white' size={20} />
                                        ) : (
                                            <Circle className='text-gray-400' size={20} />
                                        )}
                                    </div>

                                    {/* Label */}
                                    <div className='text-center'>
                                        <p className={`text-xs font-medium ${isCurrent ? 'text-green-600' : isCompleted ? 'text-gray-900' : 'text-gray-500'
                                            }`}>
                                            {status.label}
                                        </p>
                                        {isCurrent && (
                                            <span className='inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full'>
                                                Current
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Connecting Line */}
                                {!isLast && (
                                    <div className='flex-1 h-0.5 -mx-2 mb-6'>
                                        <div
                                            className={`h-full ${isCompleted ? 'bg-green-500' : 'bg-gray-300'
                                                }`}
                                        />
                                    </div>
                                )}
                            </React.Fragment>
                        )
                    })}
                </div>
            </div>

            {/* Mobile View - Compact */}
            <div className='sm:hidden'>
                <div className='flex items-center gap-2 overflow-x-auto pb-2'>
                    {statuses.map((status, index) => {
                        const isCompleted = index <= currentIndex
                        const isCurrent = index === currentIndex
                        const isLast = index === statuses.length - 1

                        return (
                            <React.Fragment key={status.key}>
                                <div className='flex flex-col items-center gap-1 flex-shrink-0'>
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${isCompleted
                                                ? 'bg-green-500 border-green-500'
                                                : 'bg-white border-gray-300'
                                            }`}
                                    >
                                        {isCompleted ? (
                                            <CheckCircle2 className='text-white' size={16} />
                                        ) : (
                                            <Circle className='text-gray-400' size={16} />
                                        )}
                                    </div>
                                    <p className={`text-xs whitespace-nowrap ${isCurrent ? 'text-green-600 font-medium' : isCompleted ? 'text-gray-900' : 'text-gray-500'
                                        }`}>
                                        {status.label}
                                    </p>
                                </div>

                                {!isLast && (
                                    <div className='w-8 h-0.5 flex-shrink-0 mb-4'>
                                        <div className={`h-full ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
                                    </div>
                                )}
                            </React.Fragment>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default OrderTimeline
