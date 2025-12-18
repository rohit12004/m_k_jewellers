'use client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import { API_ORDER_DETAILS } from '@/routes/websiteRoutes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, Package, Truck, MapPin, Phone, Mail, CreditCard } from 'lucide-react'
import Image from 'next/image'
import imgPlaceholder from '@/public/assets/img-placeholder.jpg'

const OrderDetailsPage = () => {
    const params = useParams()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const { data } = await axios.get(API_ORDER_DETAILS(params.order_id))
                if (data.success) {
                    setOrder(data.data)
                } else {
                    setError(data.message)
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch order details')
            } finally {
                setLoading(false)
            }
        }

        if (params.order_id) {
            fetchOrderDetails()
        }
    }, [params.order_id])

    if (loading) {
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
                        <p className='text-red-500'>{error}</p>
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
            <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
                {/* Success Message */}
                <Card className='mb-6 border-green-200 bg-green-50'>
                    <CardContent className='pt-6'>
                        <div className='flex items-center gap-4'>
                            <CheckCircle className='text-green-600' size={48} />
                            <div>
                                <h1 className='text-2xl font-bold text-green-900'>Order Placed Successfully!</h1>
                                <p className='text-green-700'>Thank you for your purchase. Your order has been confirmed.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Order Details */}
                <Card className='mb-6'>
                    <CardHeader>
                        <CardTitle>Order Details</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div className='grid grid-cols-2 gap-4'>
                            <div>
                                <p className='text-sm text-gray-600'>Order ID</p>
                                <p className='font-semibold'>{order.orderId}</p>
                            </div>
                            <div>
                                <p className='text-sm text-gray-600'>Payment ID</p>
                                <p className='font-semibold'>{order.paymentId}</p>
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
                        </div>
                    </CardContent>
                </Card>

                {/* Customer Information */}
                <Card className='mb-6'>
                    <CardHeader>
                        <CardTitle>Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-3'>
                        <div className='flex items-center gap-2'>
                            <Mail size={18} className='text-gray-500' />
                            <span>{order.email}</span>
                        </div>
                        <div className='flex items-center gap-2'>
                            <Phone size={18} className='text-gray-500' />
                            <span>{order.phone}</span>
                        </div>
                        <div className='flex items-start gap-2'>
                            <MapPin size={18} className='text-gray-500 mt-1' />
                            <div>
                                <p>{address.street}</p>
                                {address.street2 && <p>{address.street2}</p>}
                                <p>{address.city}, {address.state} - {address.postalCode}</p>
                            </div>
                        </div>
                        <div className='flex items-center gap-2'>
                            <CreditCard size={18} className='text-gray-500' />
                            <span>PAN: {order.panCard}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Order Items */}
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

                {/* Contact Info */}
                <Card className='mt-6'>
                    <CardContent className='pt-6 text-center'>
                        <p className='text-sm text-gray-600'>
                            For any queries, please contact us at <span className='font-semibold text-primary'>+91-9881339944</span>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default OrderDetailsPage
