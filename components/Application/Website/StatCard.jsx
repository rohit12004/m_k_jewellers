import React from 'react'
import { Card, CardContent } from '@/components/ui/card'

const StatCard = ({ title, value, icon: Icon, color = 'primary' }) => {
    return (
        <Card>
            <CardContent className='pt-6'>
                <div className='flex items-center justify-between'>
                    <div>
                        <p className='text-sm font-medium text-gray-600 dark:text-gray-600'>{title}</p>
                        <p className='text-2xl font-bold mt-2'>{value}</p>
                    </div>
                    {Icon && (
                        <div className={`p-3 rounded-full bg-${color}-100`}>
                            <Icon className={`text-${color}-600`} size={24} />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export default StatCard
