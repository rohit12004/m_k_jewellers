'use client'
import Link from 'next/link'
import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ADMIN_METAL_RATES } from '@/routes/adminPanelRoutes'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { FiExternalLink } from 'react-icons/fi'
import { TbCoinRupee } from 'react-icons/tb'

const MetalRatesOverview = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['metalRates'],
        queryFn: async () => {
            const { data } = await axios.get('/api/admin/metal-rates')
            return data.data
        }
    })

    const formatDateTime = (date) => {
        return new Date(date).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short'
        })
    }

    return (
        <Card className="mt-5 shadow-sm">
            <CardHeader className="border-b pb-3">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Current Metal Rates</h3>
                    <Link href={ADMIN_METAL_RATES}>
                        <Button variant="outline" size="sm" className="gap-2">
                            Manage Rates <FiExternalLink />
                        </Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {isLoading ? (
                    <div className="p-6 text-center text-gray-500">Loading metal rates...</div>
                ) : data?.length > 0 ? (
                    <>
                        {/* Desktop Grid View */}
                        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                            {data.map((rate) => (
                                <div
                                    key={rate.id}
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900 dark:text-white">
                                                {rate.categoryName}
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {rate.purity}
                                            </p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                                            <TbCoinRupee className="text-yellow-600 dark:text-yellow-400" size={20} />
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            ₹{rate.ratePerGram}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">per gram</p>
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Updated: {formatDateTime(rate.updatedAt)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Mobile List View */}
                        <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
                            {data.map((rate) => (
                                <div key={rate.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                                                    <TbCoinRupee className="text-yellow-600 dark:text-yellow-400" size={16} />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                                                        {rate.categoryName}
                                                    </h4>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                                        {rate.purity}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                ₹{rate.ratePerGram}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">per gram</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                        Updated: {formatDateTime(rate.updatedAt)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="p-6 text-center text-gray-500">No metal rates configured</div>
                )}
            </CardContent>
        </Card>
    )
}

export default MetalRatesOverview
