import React from 'react'
import { Card, CardContent } from '@/components/ui/card'

const StatCard = ({ title, value, icon: Icon, color = 'primary' }) => {
    return (
        <Card>
            <CardContent className='px-3 sm:p-6'>
                <div className='flex items-center justify-between'>
                    <div>
                        <p className='text-sm sm:text-sm font-medium text-gray-600'>{title}</p>
                        <p className='text-base sm:text-2xl font-bold mt-0.5 sm:mt-2'>{value}</p>
                    </div>
                    {Icon && (
                        <div className={`p-1.5 sm:p-3 rounded-full bg-${color}-100`}>
                            <Icon className={`text-${color}-600 sm:w-6 sm:h-6`} size={20} />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export default StatCard
