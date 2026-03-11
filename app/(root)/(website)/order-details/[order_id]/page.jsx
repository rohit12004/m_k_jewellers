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
                    <CardContent>
                        <div className='flex items-center gap-3'>
                            <CheckCircle className='text-green-600 flex-shrink-0' size={32} />
                            <div>
                                <h1 className='text-lg font-bold text-green-900'>Order Placed Successfully!</h1>
                                <p className='text-sm text-green-700'>Thank you for your purchase. Your order has been confirmed.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Order Status Timeline */}
                <Card className='mb-2'>
                    <CardHeader>
                        <CardTitle>Order Status</CardTitle>
                    </CardHeader>
                    <CardContent>
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
                                    <p className='text-sm text-gray-600'>Order ID</p>
                                    <p className='font-semibold'>{order.orderId}</p>
                                </div>
                                <div>
                                    <p className='text-sm text-gray-600'>Payment ID</p>
                                    <p className='font-semibold text-sm'>{order.paymentId}</p>
                                </div>
                                <div>
                                    <p className='text-sm text-gray-600'>Order Date</p>
                                    <p className='font-semibold'>{new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className='text-sm text-gray-600'>Payment Status</p>
                                    <span className='inline-block px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800'>
                                        {order.paymentStatus}
                                    </span>
                                </div>

                                <Separator className='my-2' />

                                {/* Download Receipt Button */}
                                <Button
                                    onClick={downloadReceipt}
                                    disabled={downloading}
                                    className='w-full'
                                    variant='default'
                                >
                                    {downloading ? (
                                        <>
                                            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                                            Downloading...
                                        </>
                                    ) : (
                                        <>
                                            <Download className='mr-2' size={16} />
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
                                <div className='space-y-4'>
                                    {order.products?.map((item) => (
                                        <div key={item.id} className='flex gap-4 pb-4 border-b last:border-b-0'>
                                            <div className='w-20 h-20 bg-gray-100 rounded flex-shrink-0 overflow-hidden'>
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
                                                <div className='text-sm text-gray-600 space-y-1 mt-1'>
                                                    {item.weight && <p>Weight: {item.weight}g</p>}
                                                    {item.purity && <p>Purity: {item.purity}</p>}
                                                    {item.color && <p>Color: {item.color}</p>}
                                                    {item.size && <p>Size: {item.size}</p>}
                                                    <p>Quantity: {item.qty}</p>
                                                </div>
                                            </div>
                                            <div className='text-right'>
                                                <p className='font-semibold'>
                                                    {Number(item.totalPrice).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                                </p>
                                                <p className='text-sm text-gray-600'>
                                                    {Number(item.unitPrice).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} × {item.qty}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Separator className='my-4' />

                                <div className='space-y-2'>
                                    <div className='flex justify-between text-lg font-bold'>
                                        <span>Total Amount Paid</span>
                                        <span className='text-primary'>
                                            {Number(order.total).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Customer Information - Full Width */}
                <Card className='mt-2'>
                    <CardHeader>
                        <CardTitle>Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-4'>
                            <div className='flex items-center gap-2'>
                                <Mail size={18} className='text-gray-500' />
                                <span className='text-sm'>{order.email}</span>
                            </div>
                            <div className='flex items-center gap-2'>
                                <Phone size={18} className='text-gray-500' />
                                <span className='text-sm'>{order.phone}</span>
                            </div>
                            <div className='flex items-start gap-2 md:col-span-2 lg:col-span-1'>
                                <MapPin size={18} className='text-gray-500 mt-1' />
                                <div className='text-sm'>
                                    <p>{address.street}</p>
                                    {address.street2 && <p>{address.street2}</p>}
                                    <p>{address.city}, {address.state} - {address.postalCode}</p>
                                </div>
                            </div>
                            <div className='flex items-center gap-2'>
                                <CreditCard size={18} className='text-gray-500' />
                                <span className='text-sm'>PAN: {order.panCard}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default OrderDetailsPage
