'use client'
import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { API_ORDER_DETAILS } from '@/routes/websiteRoutes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { CheckCircle, Package, Truck, MapPin, Phone, Mail, CreditCard, Download } from 'lucide-react'
import Image from 'next/image'
import imgPlaceholder from '@/public/assets/img-placeholder.jpg'
import OrderTimeline from '@/components/Application/Website/OrderTimeline'
import { toast } from 'sonner'

const OrderDetailsPage = () => {
    const params = useParams()
    const orderId = params.order_id
    const [downloading, setDownloading] = useState(false)

    // Fetch order details using TanStack Query
    const { data: order, isLoading, error } = useQuery({
        queryKey: ['order-details', orderId],
        queryFn: async () => {
            const { data } = await axios.get(API_ORDER_DETAILS(orderId))
            if (!data.success) {
                throw new Error(data.message || 'Failed to fetch order details')
            }
            return data.data
        },
        enabled: !!orderId,
        staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
        gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes (renamed from cacheTime)
        refetchOnMount: false, // Don't refetch on mount
        refetchOnWindowFocus: false, // Don't refetch when window gains focus
    })

    const downloadReceipt = async () => {
        setDownloading(true)
        try {
            const response = await axios.get(`/api/order/receipt/${orderId}`, {
                responseType: 'blob', // Important for PDF download
            })

            // Create a blob URL and trigger download
            const blob = new Blob([response.data], { type: 'application/pdf' })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `MK_Jewellers_Receipt_${orderId}.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)

            toast.success('Receipt downloaded successfully')
        } catch (error) {
            console.error('Download error:', error)
            toast.error(error.response?.data?.message || 'Failed to download receipt')
        } finally {
            setDownloading(false)
        }
    }

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

    if (error) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <Card className='max-w-md'>
                    <CardContent className='pt-6 text-center'>
                        <p className='text-red-500'>{error?.message || 'Failed to load order details'}</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!order) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <Card className='max-w-md'>
                    <CardContent className='pt-6 text-center'>
                        <p className='text-gray-600'>Order not found</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const address = JSON.parse(order.address || '{}')

    return (
        <div className='min-h-screen bg-gray-50 dark:bg-gray-50 py-8'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                {/* Success Message */}
                <Card className='mb-2 border-green-200 bg-green-50'>
                    <CardContent className='sm:p-6'>
                        <div className='flex items-center gap-2 sm:gap-3'>
                            <CheckCircle className='text-green-600 flex-shrink-0 sm:w-8 sm:h-8' size={24} />
                            <div>
                                <h1 className='text-sm sm:text-lg font-bold text-green-900'>Order Placed Successfully!</h1>
                                <p className='text-[10px] sm:text-sm text-green-700'>Thank you for your purchase. Your order has been confirmed.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Order Status Timeline */}
                <Card className='mb-2'>
                    <CardHeader className='sm:p-6 pb-0 sm:pb-3'>
                        <CardTitle className='text-base sm:text-lg'>Order Status</CardTitle>
                    </CardHeader>
                    <CardContent className='sm:p-6 sm:pt-6'>
                        <OrderTimeline currentStatus={order.orderStatus} />
                    </CardContent>
                </Card>

                {/* Two Column Layout */}
                <div className='grid lg:grid-cols-3 gap-6'>
                    {/* Left Column - Order Details */}
                    <div className='lg:col-span-1'>
                        {/* Order Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Details</CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                <div>
                                    <p className='text-xs sm:text-sm text-gray-600'>Order ID</p>
                                    <p className='text-sm sm:text-base font-semibold'>{order.orderId}</p>
                                </div>
                                <div>
                                    <p className='text-xs sm:text-sm text-gray-600'>Payment ID</p>
                                    <p className='text-xs sm:text-sm font-semibold truncate'>{order.paymentId}</p>
                                </div>
                                <div>
                                    <p className='text-xs sm:text-sm text-gray-600'>Order Date</p>
                                    <p className='text-sm sm:text-base font-semibold'>{new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className='text-xs sm:text-sm text-gray-600 mb-1'>Payment Status</p>
                                    <span className='inline-block px-1.5 py-0.5 text-[10px] sm:text-xs font-semibold rounded bg-green-100 text-green-800'>
                                        {order.paymentStatus}
                                    </span>
                                </div>

                                <Separator className='my-2' />

                                {/* Download Receipt Button */}
                                <Button
                                    onClick={downloadReceipt}
                                    disabled={downloading}
                                    className='w-full h-9 sm:h-10 text-xs sm:text-sm'
                                    variant='default'
                                >
                                    {downloading ? (
                                        <>
                                            <div className='animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2'></div>
                                            Downloading...
                                        </>
                                    ) : (
                                        <>
                                            <Download className='mr-1.5 sm:mr-2' size={14} />
                                            Download Receipt
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Order Items */}
                    <div className='lg:col-span-2'>
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Items ({order.products?.length || 0})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='space-y-3 sm:space-y-4'>
                                    {order.products?.map((item) => (
                                        <div key={item.id} className='flex gap-2 sm:gap-4 pb-3 sm:pb-4 border-b last:border-b-0'>
                                            <div className='w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded flex-shrink-0 overflow-hidden border'>
                                                {item.media ? (
                                                    <Image
                                                        src={item.media}
                                                        width={80}
                                                        height={80}
                                                        alt={item.name}
                                                        className='w-full h-full object-cover'
                                                    />
                                                ) : (
                                                    <Package className='w-full h-full p-3 sm:p-4 text-gray-400' />
                                                )}
                                            </div>
                                            <div className='flex-1 min-w-0'>
                                                <h3 className='text-sm sm:text-base font-semibold truncate'>{item.name}</h3>
                                                <div className='text-[10px] sm:text-sm text-gray-600 mt-0.5'>
                                                    {item.weight && <span>{item.weight}g</span>}
                                                    {item.purity && <span> • {item.purity}</span>}
                                                    {item.color && <span> • {item.color}</span>}
                                                    <p className='mt-0.5'>{item.qty} Unit{item.qty > 1 ? 's' : ''}</p>
                                                </div>
                                            </div>
                                            <div className='text-right flex-shrink-0'>
                                                <p className='text-sm sm:text-base font-semibold text-primary'>
                                                    {Number(item.totalPrice).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                                </p>
                                                <p className='text-[10px] sm:text-xs text-gray-500'>
                                                    {Number(item.unitPrice).toLocaleString('en-IN')} × {item.qty}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Separator className='my-3 sm:my-4' />

                                <div className='flex justify-between items-center bg-gray-50 p-2 sm:p-0 sm:bg-transparent rounded-lg'>
                                    <span className='text-sm sm:text-lg font-bold text-gray-700'>Total Amount Paid</span>
                                    <span className='text-base sm:text-2xl font-bold text-primary'>
                                        {Number(order.total).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Customer Information - Full Width */}
                <Card className='mt-2'>
                    <CardHeader className='p-3 sm:p-6 pb-2 sm:pb-3'>
                        <CardTitle className='text-base sm:text-lg'>Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent className='p-3 sm:p-6 pt-1 sm:pt-6'>
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4'>
                            <div className='flex items-center gap-2'>
                                <Mail size={16} className='text-gray-500 shrink-0' />
                                <span className='text-xs sm:text-sm truncate'>{order.email}</span>
                            </div>
                            <div className='flex items-center gap-2'>
                                <Phone size={16} className='text-gray-500 shrink-0' />
                                <span className='text-xs sm:text-sm'>{order.phone}</span>
                            </div>
                            <div className='flex items-start gap-2 sm:col-span-2 lg:col-span-1'>
                                <MapPin size={16} className='text-gray-500 mt-0.5 shrink-0' />
                                <div className='text-xs sm:text-sm text-gray-700'>
                                    <p>{address.street}</p>
                                    {address.street2 && <p>{address.street2}</p>}
                                    <p>{address.city}, {address.state} - {address.postalCode}</p>
                                </div>
                            </div>
                            <div className='flex items-center gap-2'>
                                <CreditCard size={16} className='text-gray-500 shrink-0' />
                                <span className='text-xs sm:text-sm font-medium'>PAN: {order.panCard}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default OrderDetailsPage
