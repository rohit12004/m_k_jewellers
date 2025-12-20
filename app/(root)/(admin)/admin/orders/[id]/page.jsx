'use client'
import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { showToast } from '@/lib/showToast'
import { Chip } from '@mui/material'
import { ArrowLeft, Package, User, MapPin, Phone, Mail, CreditCard, Calendar, Hash } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { ADMIN_ORDERS_SHOW } from '@/routes/adminPanelRoutes'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { ADMIN_DASHBOARD, ADMIN_ORDERS_DETAIL } from '@/routes/adminPanelRoutes'

const ORDER_STATUSES = [
    { value: 'PENDING', label: 'Pending', color: 'default' },
    { value: 'CONFIRMED', label: 'Confirmed', color: 'info' },
    { value: 'PROCESSING', label: 'Processing', color: 'warning' },
    { value: 'SHIPPED', label: 'Shipped', color: 'primary' },
    { value: 'DELIVERED', label: 'Delivered', color: 'success' },
    { value: 'CANCELLED', label: 'Cancelled', color: 'error' }
]

const OrderDetailPage = () => {
    const params = useParams()
    const router = useRouter()
    const queryClient = useQueryClient()
    const orderId = params.id

    const [selectedStatus, setSelectedStatus] = useState('')

    // Fetch order details
    const { data: orderData, isLoading, error } = useQuery({
        queryKey: ['order', orderId],
        queryFn: async () => {
            const { data } = await axios.get(`/api/admin/orders/${orderId}`)
            return data.data
        },
        enabled: !!orderId,
        onSuccess: (data) => {
            setSelectedStatus(data.orderStatus)
        }
    })

    // Update order status mutation
    const updateStatusMutation = useMutation({
        mutationFn: async (newStatus) => {
            const { data } = await axios.patch(`/api/admin/orders/${orderId}`, {
                orderStatus: newStatus
            })
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['order', orderId])
            queryClient.invalidateQueries(['orders-data'])
            showToast('success', 'Order status updated successfully')
        },
        onError: (error) => {
            showToast('error', error.response?.data?.message || 'Failed to update status')
        }
    })

    const handleStatusUpdate = () => {
        if (selectedStatus && selectedStatus !== orderData?.orderStatus) {
            updateStatusMutation.mutate(selectedStatus)
        }
    }

    const breadcrumbData = [
        { href: ADMIN_DASHBOARD, label: 'Home' },
        { href: ADMIN_ORDERS_SHOW, label: 'Orders' },
        { href: ADMIN_ORDERS_DETAIL(orderId), label: `Order #${orderData?.orderId || orderId}` },
    ]

    if (isLoading) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <div className='text-center'>
                    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
                    <p className='mt-4 text-gray-600'>Loading order details...</p>
                </div>
            </div>
        )
    }

    if (error || !orderData) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <Card className='max-w-md'>
                    <CardContent className='pt-6 text-center'>
                        <p className='text-red-500'>{error?.response?.data?.message || 'Order not found'}</p>
                        <Button className='mt-4' onClick={() => router.push(ADMIN_ORDERS_SHOW)}>
                            Back to Orders
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const address = JSON.parse(orderData.address || '{}')
    const getStatusColor = (status) => {
        return ORDER_STATUSES.find(s => s.value === status)?.color || 'default'
    }

    const getPaymentStatusColor = (status) => {
        const colorMap = {
            'COMPLETED': 'success',
            'PENDING': 'warning',
            'FAILED': 'error',
            'REFUNDED': 'default'
        }
        return colorMap[status] || 'default'
    }

    return (
        <div className='pb-8'>
            <BreadCrumb breadcrumbData={breadcrumbData} />

            {/* Back Button */}
            <div className='mb-4'>
                <Link href={ADMIN_ORDERS_SHOW}>
                    <Button variant='outline' size='sm' className='gap-2'>
                        <ArrowLeft size={16} /> Back to Orders
                    </Button>
                </Link>
            </div>

            <div className='grid lg:grid-cols-3 gap-6'>
                {/* Left Column - Order Details */}
                <div className='lg:col-span-2 space-y-6'>
                    {/* Order Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            <div className='grid md:grid-cols-2 gap-4'>
                                <div className='flex items-center gap-2'>
                                    <Hash size={18} className='text-gray-500' />
                                    <div>
                                        <p className='text-sm text-gray-600'>Order ID</p>
                                        <p className='font-semibold'>{orderData.orderId}</p>
                                    </div>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <Calendar size={18} className='text-gray-500' />
                                    <div>
                                        <p className='text-sm text-gray-600'>Order Date</p>
                                        <p className='font-semibold'>
                                            {new Date(orderData.createdAt).toLocaleDateString('en-IN', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <CreditCard size={18} className='text-gray-500' />
                                    <div>
                                        <p className='text-sm text-gray-600'>Payment ID</p>
                                        <p className='font-semibold text-sm'>{orderData.paymentId || 'N/A'}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className='text-sm text-gray-600 mb-1'>Payment Status</p>
                                    <Chip
                                        label={orderData.paymentStatus}
                                        size='small'
                                        color={getPaymentStatusColor(orderData.paymentStatus)}
                                    />
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <p className='text-sm text-gray-600 mb-1'>Current Order Status</p>
                                <Chip
                                    label={orderData.orderStatus}
                                    size='medium'
                                    color={getStatusColor(orderData.orderStatus)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Customer Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2'>
                                <User size={20} /> Customer Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-3'>
                            {orderData.user && (
                                <div className='flex items-center gap-2'>
                                    <User size={18} className='text-gray-500' />
                                    <span className='font-medium'>{orderData.user.name}</span>
                                </div>
                            )}
                            <div className='flex items-center gap-2'>
                                <Mail size={18} className='text-gray-500' />
                                <span>{orderData.email}</span>
                            </div>
                            <div className='flex items-center gap-2'>
                                <Phone size={18} className='text-gray-500' />
                                <span>{orderData.phone}</span>
                            </div>
                            <div className='flex items-start gap-2'>
                                <MapPin size={18} className='text-gray-500 mt-1' />
                                <div>
                                    <p className='font-medium mb-1'>Delivery Address</p>
                                    <p>{address.street}</p>
                                    {address.street2 && <p>{address.street2}</p>}
                                    <p>{address.city}, {address.state} - {address.postalCode}</p>
                                </div>
                            </div>
                            <div className='flex items-center gap-2'>
                                <CreditCard size={18} className='text-gray-500' />
                                <span>PAN: {orderData.panCard}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2'>
                                <Package size={20} /> Order Items ({orderData.products?.length || 0})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Desktop Table */}
                            <div className='hidden md:block overflow-x-auto'>
                                <table className='w-full'>
                                    <thead className='bg-gray-50 dark:bg-gray-800'>
                                        <tr>
                                            <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Product</th>
                                            <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Details</th>
                                            <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase'>Qty</th>
                                            <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase'>Unit Price</th>
                                            <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase'>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className='divide-y divide-gray-200 dark:divide-gray-700'>
                                        {orderData.products?.map((item) => (
                                            <tr key={item.id}>
                                                <td className='px-4 py-3'>
                                                    <div className='flex items-center gap-3'>
                                                        <div className='w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0'>
                                                            {item.media ? (
                                                                <Image
                                                                    src={item.media}
                                                                    width={64}
                                                                    height={64}
                                                                    alt={item.name}
                                                                    className='w-full h-full object-cover'
                                                                />
                                                            ) : (
                                                                <Package className='w-full h-full p-3 text-gray-400' />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className='font-semibold'>{item.name}</p>
                                                            <p className='text-xs text-gray-500'>{item.category} • {item.subcategory}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className='px-4 py-3 text-sm'>
                                                    <div className='space-y-1'>
                                                        {item.weight && <p>Weight: {item.weight}g</p>}
                                                        {item.purity && <p>Purity: {item.purity}</p>}
                                                        {item.color && <p>Color: {item.color}</p>}
                                                        {item.size && <p>Size: {item.size}</p>}
                                                        {item.length && <p>Length: {item.length}</p>}
                                                    </div>
                                                </td>
                                                <td className='px-4 py-3 text-right'>{item.qty}</td>
                                                <td className='px-4 py-3 text-right'>
                                                    ₹{Number(item.unitPrice).toLocaleString('en-IN')}
                                                </td>
                                                <td className='px-4 py-3 text-right font-semibold'>
                                                    ₹{Number(item.totalPrice).toLocaleString('en-IN')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className='md:hidden space-y-4'>
                                {orderData.products?.map((item) => (
                                    <div key={item.id} className='border rounded-lg p-4'>
                                        <div className='flex gap-3 mb-3'>
                                            <div className='w-20 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0'>
                                                {item.media ? (
                                                    <Image
                                                        src={item.media}
                                                        width={80}
                                                        height={80}
                                                        alt={item.name}
                                                        className='w-full h-full object-cover'
                                                    />
                                                ) : (
                                                    <Package className='w-full h-full p-4 text-gray-400' />
                                                )}
                                            </div>
                                            <div className='flex-1'>
                                                <h3 className='font-semibold'>{item.name}</h3>
                                                <p className='text-xs text-gray-500'>{item.category} • {item.subcategory}</p>
                                            </div>
                                        </div>
                                        <div className='text-sm space-y-1 mb-3'>
                                            {item.weight && <p>Weight: {item.weight}g</p>}
                                            {item.purity && <p>Purity: {item.purity}</p>}
                                            {item.color && <p>Color: {item.color}</p>}
                                            {item.size && <p>Size: {item.size}</p>}
                                            <p>Quantity: {item.qty}</p>
                                        </div>
                                        <div className='flex justify-between items-center pt-2 border-t'>
                                            <span className='text-sm text-gray-600'>
                                                ₹{Number(item.unitPrice).toLocaleString('en-IN')} × {item.qty}
                                            </span>
                                            <span className='font-semibold'>
                                                ₹{Number(item.totalPrice).toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Separator className='my-4' />
                            <div className='flex justify-between items-center'>
                                <span className='text-lg font-bold'>Total Amount</span>
                                <span className='text-2xl font-bold text-primary'>
                                    ₹{Number(orderData.total).toLocaleString('en-IN')}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Status Update */}
                <div className='lg:col-span-1'>
                    <Card className='sticky top-4'>
                        <CardHeader>
                            <CardTitle>Update Order Status</CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            <div>
                                <label className='text-sm font-medium mb-2 block'>Select New Status</label>
                                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ORDER_STATUSES.map((status) => (
                                            <SelectItem key={status.value} value={status.value}>
                                                {status.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                onClick={handleStatusUpdate}
                                disabled={!selectedStatus || selectedStatus === orderData.orderStatus || updateStatusMutation.isPending}
                                className='w-full'
                            >
                                {updateStatusMutation.isPending ? 'Updating...' : 'Update Status'}
                            </Button>
                            <div className='text-xs text-gray-500 space-y-1'>
                                <p><strong>Status Guide:</strong></p>
                                <ul className='list-disc list-inside space-y-1'>
                                    <li>Pending: Order received</li>
                                    <li>Confirmed: Payment verified</li>
                                    <li>Processing: Being prepared</li>
                                    <li>Shipped: Out for delivery</li>
                                    <li>Delivered: Completed</li>
                                    <li>Cancelled: Order cancelled</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default OrderDetailPage
