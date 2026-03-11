import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Eye } from 'lucide-react'

const OrdersTable = ({ orders }) => {
    const getStatusColor = (status) => {
        const colors = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            COMPLETED: 'bg-green-100 text-green-800',
            FAILED: 'bg-red-100 text-red-800',
            REFUNDED: 'bg-gray-100 text-gray-800'
        }
        return colors[status] || 'bg-gray-100 text-gray-800'
    }

    const getOrderStatusColor = (status) => {
        const colors = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            CONFIRMED: 'bg-blue-100 text-blue-800',
            PROCESSING: 'bg-purple-100 text-purple-800',
            SHIPPED: 'bg-indigo-100 text-indigo-800',
            DELIVERED: 'bg-green-100 text-green-800',
            CANCELLED: 'bg-red-100 text-red-800'
        }
        return colors[status] || 'bg-gray-100 text-gray-800'
    }

    if (!orders || orders.length === 0) {
        return (
            <div className='text-center py-12 text-gray-500'>
                <p>No orders found</p>
                <p className='text-sm mt-2'>Your order history will appear here</p>
            </div>
        )
    }

    return (
        <div className='rounded-md border overflow-x-auto'>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-xs sm:text-sm">Order ID</TableHead>
                        <TableHead className="text-xs sm:text-sm">Date</TableHead>
                        <TableHead className="text-xs sm:text-sm">Items</TableHead>
                        <TableHead className="text-xs sm:text-sm">Amount</TableHead>
                        <TableHead className="text-xs sm:text-sm">Payment Status</TableHead>
                        <TableHead className="text-xs sm:text-sm">Order Status</TableHead>
                        <TableHead className='text-right text-xs sm:text-sm'>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.map((order) => (
                        <TableRow key={order.id}>
                            <TableCell className='font-medium text-xs sm:text-sm'>{order.orderId}</TableCell>
                            <TableCell className="text-xs sm:text-sm">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell className="text-xs sm:text-sm">{order.itemCount}</TableCell>
                            <TableCell className="text-xs sm:text-sm">{order.total.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</TableCell>
                            <TableCell>
                                <Badge className={`${getStatusColor(order.paymentStatus)} text-[10px] sm:text-xs px-1.5 py-0 sm:px-2.5 sm:py-0.5`}>
                                    {order.paymentStatus}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Badge className={`${getOrderStatusColor(order.orderStatus)} text-[10px] sm:text-xs px-1.5 py-0 sm:px-2.5 sm:py-0.5`}>
                                    {order.orderStatus}
                                </Badge>
                            </TableCell>
                            <TableCell className='text-right'>
                                <Link href={`/order-details/${order.orderId}`}>
                                    <Button variant='outline' size='sm' className='gap-1 h-7 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm'>
                                        <Eye size={14} className="sm:w-4 sm:h-4" /> View
                                    </Button>
                                </Link>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

export default OrdersTable
