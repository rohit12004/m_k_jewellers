'use client'
import Link from 'next/link'
import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ADMIN_ORDERS_SHOW } from '@/routes/adminPanelRoutes'
import useFetch from '@/hooks/useFetch'
import { Chip } from '@mui/material'
import { Button } from '@/components/ui/button'
import { FiExternalLink } from 'react-icons/fi'

const RecentOrders = () => {
    const { data: ordersData, isLoading } = useFetch('/api/admin/orders?page=1&pageSize=5&today=true')

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    const getStatusColor = (status) => {
        const colorMap = {
            'COMPLETED': 'success',
            'PENDING': 'warning',
            'FAILED': 'error'
        }
        return colorMap[status] || 'default'
    }

    return (
        <Card className="mt-5 shadow-sm">
            <CardHeader className="border-b pb-3">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Recent Orders</h3>
                    <Link href={ADMIN_ORDERS_SHOW}>
                        <Button variant="outline" size="sm" className="gap-2">
                            View All <FiExternalLink />
                        </Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {isLoading ? (
                    <div className="p-6 text-center text-gray-500">Loading orders...</div>
                ) : ordersData?.data?.length > 0 ? (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order ID</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {ordersData.data.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                                {order.orderId}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                                <div>
                                                    <div className="font-medium">{order.user?.name || 'N/A'}</div>
                                                    <div className="text-xs text-gray-500">{order.user?.email || ''}</div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                                                ₹{order.total?.toLocaleString('en-IN') || 0}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <Chip
                                                    label={order.paymentStatus}
                                                    size="small"
                                                    color={getStatusColor(order.paymentStatus)}
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                                {formatDate(order.createdAt)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
                            {ordersData.data.map((order) => (
                                <div key={order.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-semibold text-sm text-gray-900 dark:text-white">
                                                {order.orderId}
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                {order.user?.name || 'N/A'}
                                            </p>
                                        </div>
                                        <Chip
                                            label={order.paymentStatus}
                                            size="small"
                                            color={getStatusColor(order.paymentStatus)}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                            ₹{order.total?.toLocaleString('en-IN') || 0}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {formatDate(order.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="p-6 text-center text-gray-500">No orders found</div>
                )}
            </CardContent>
        </Card>
    )
}

export default RecentOrders
