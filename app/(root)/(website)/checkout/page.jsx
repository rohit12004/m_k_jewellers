'use client'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { WEBSITE_LOGIN } from '@/routes/websiteRoutes'
import Image from 'next/image'
import imgPlaceholder from '@/public/assets/img-placeholder.jpg'
import { Check, Lock, Phone, Mail, MapPin, ShoppingBag } from 'lucide-react'

const CheckoutPage = () => {
    const auth = useSelector(store => store.authStore.auth)
    const cart = useSelector(store => store.cartStore)
    const router = useRouter()
    const [subtotal, setSubtotal] = useState(0)

    // Redirect to login if not authenticated - do this first before any rendering
    useEffect(() => {
        if (!auth) {
            router.push(WEBSITE_LOGIN)
        }
    }, [auth, router])

    // Calculate subtotal
    useEffect(() => {
        const totalAmount = cart.products.reduce((sum, product) => sum + (product.price * product.qty), 0)
        setSubtotal(totalAmount)
    }, [cart])

    // Don't render anything if not authenticated
    if (!auth) {
        return null
    }

    return (
        <div className='min-h-screen bg-gray-50 dark:bg-gray-50 py-8'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                {/* Progress Indicator */}
                <div className='mb-8'>
                    <div className='flex items-center justify-center gap-4 sm:gap-8'>
                        <div className='flex items-center gap-2'>
                            <div className='w-8 h-8 rounded-full bg-primary flex items-center justify-center'>
                                <Check className='text-white' size={16} />
                            </div>
                            <span className='text-sm font-medium text-gray-900 dark:text-gray-900'>Cart</span>
                        </div>
                        <div className='h-0.5 w-12 sm:w-24 bg-primary'></div>
                        <div className='flex items-center gap-2'>
                            <div className='w-8 h-8 rounded-full bg-primary flex items-center justify-center'>
                                <span className='text-white text-sm font-medium'>2</span>
                            </div>
                            <span className='text-sm font-medium text-primary'>Delivery</span>
                        </div>
                        <div className='h-0.5 w-12 sm:w-24 bg-gray-300'></div>
                        <div className='flex items-center gap-2'>
                            <div className='w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center'>
                                <span className='text-gray-600 text-sm font-medium'>3</span>
                            </div>
                            <span className='text-sm font-medium text-gray-500 dark:text-gray-500'>Payment</span>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className='grid lg:grid-cols-5 gap-8'>
                    {/* Left Panel - Delivery Details */}
                    <div className='lg:col-span-3'>
                        <Card>
                            <CardHeader>
                                <CardTitle>Your Details</CardTitle>
                                <CardDescription>Required to Save Cart and Send Order Updates</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className='space-y-4'>
                                    {/* Email */}
                                    <div className='space-y-2'>
                                        <Label htmlFor='email' className='flex items-center gap-2'>
                                            <Mail size={16} />
                                            Email address
                                        </Label>
                                        <Input
                                            id='email'
                                            type='email'
                                            value={auth.email || ''}
                                            readOnly
                                            className='bg-gray-50 dark:bg-gray-50'
                                        />
                                    </div>

                                    {/* Mobile */}
                                    <div className='space-y-2'>
                                        <Label htmlFor='mobile' className='flex items-center gap-2'>
                                            <Phone size={16} />
                                            Mobile number
                                        </Label>
                                        <Input
                                            id='mobile'
                                            type='tel'
                                            value={auth.phone || ''}
                                            readOnly
                                            className='bg-gray-50 dark:bg-gray-50'
                                        />
                                    </div>

                                    {/* Address */}
                                    <div className='space-y-2'>
                                        <Label htmlFor='address' className='flex items-center gap-2'>
                                            <MapPin size={16} />
                                            Delivery Address
                                        </Label>
                                        <div className='p-3 bg-gray-50 dark:bg-gray-50 rounded-md border'>
                                            {auth.address ? (
                                                (() => {
                                                    try {
                                                        const addr = JSON.parse(auth.address)
                                                        return (
                                                            <div className='text-sm text-gray-700 dark:text-gray-700 space-y-1'>
                                                                <p>{addr.street}</p>
                                                                {addr.street2 && <p>{addr.street2}</p>}
                                                                <p>{addr.city}, {addr.state} - {addr.postalCode}</p>
                                                            </div>
                                                        )
                                                    } catch (e) {
                                                        return <p className='text-sm text-gray-700 dark:text-gray-700'>{auth.address}</p>
                                                    }
                                                })()
                                            ) : (
                                                <p className='text-sm text-gray-500 dark:text-gray-500'>No address provided</p>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Panel - Order Summary */}
                    <div className='lg:col-span-2'>
                        <div className='sticky top-4 space-y-4'>
                            {/* Order Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className='text-lg'>ORDER SUMMARY</CardTitle>
                                </CardHeader>
                                <CardContent className='space-y-4'>
                                    {/* Items Count */}
                                    <div className='flex justify-between items-center text-sm'>
                                        <span className='text-gray-600 dark:text-gray-600'>Total ({cart.count} Item{cart.count !== 1 ? 's' : ''})</span>
                                        <span className='font-semibold'>{subtotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                                    </div>

                                    <Separator />

                                    {/* Product List */}
                                    <div className='space-y-3 max-h-64 overflow-y-auto'>
                                        {cart.products.map((product) => (
                                            <div key={product.variantId} className='flex gap-3'>
                                                <Image
                                                    src={product.media || imgPlaceholder.src}
                                                    width={60}
                                                    height={60}
                                                    alt={product.name}
                                                    className='w-16 h-16 rounded border object-cover'
                                                />
                                                <div className='flex-1 min-w-0'>
                                                    <h4 className='text-sm font-medium truncate'>{product.name}</h4>
                                                    <p className='text-xs text-gray-500 dark:text-gray-500'>
                                                        {product.color} {product.weight ? `(${product.weight}g)` : ''}
                                                    </p>
                                                    <p className='text-sm font-semibold mt-1'>
                                                        {product.qty} × {product.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <Separator />

                                    {/* Total Payable */}
                                    <div className='space-y-2'>
                                        <h3 className='font-semibold text-lg'>Total Payable</h3>
                                        <p className='text-2xl font-bold text-primary'>
                                            {subtotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                        </p>
                                    </div>

                                    <Button className='w-full cursor-pointer' size='lg'>
                                        PROCEED TO PAYMENT
                                    </Button>

                                    <Separator />

                                    {/* Contact Info */}
                                    <div className='space-y-3'>
                                        <h4 className='font-semibold text-sm'>Any Questions?</h4>
                                        <p className='text-xs text-gray-600 dark:text-gray-600'>
                                            Please call us at: <span className='font-semibold text-primary'>+91-9881339944</span>
                                        </p>
                                        <Button
                                            className='w-full bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                                            onClick={() => window.open('https://wa.me/919284737587', '_blank')}
                                        >
                                            <svg className='w-5 h-5 mr-2' fill='currentColor' viewBox='0 0 24 24'>
                                                <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z' />
                                            </svg>
                                            Contact on WhatsApp
                                        </Button>
                                    </div>

                                    {/* Trust Badges */}
                                    <div className='grid grid-cols-2 gap-4 pt-4'>
                                        <div className='text-center p-3 bg-gray-50 dark:bg-gray-50 rounded'>
                                            <Lock className='mx-auto mb-2 text-primary' size={24} />
                                            <p className='text-xs font-semibold'>100% SECURE</p>
                                        </div>
                                        <div className='text-center p-3 bg-gray-50 dark:bg-gray-50 rounded'>
                                            <ShoppingBag className='mx-auto mb-2 text-primary' size={24} />
                                            <p className='text-xs font-semibold'>TRUSTED STORE</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CheckoutPage
