'use client'
import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { useQueryClient, useQuery, keepPreviousData } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { WEBSITE_LOGIN, WEBSITE_ORDER_DETAILS, API_PAYMENT_GET_ORDER_ID, API_PAYMENT_SAVE_ORDER, USER_DASHBOARD } from '@/routes/websiteRoutes'
import { clearCart } from '@/store/reducer/cartReducer'
import Image from 'next/image'
import imgPlaceholder from '@/public/assets/img-placeholder.jpg'
import { Check, Lock, Phone, Mail, MapPin, ShoppingBag, CreditCard, Loader2 } from 'lucide-react'
import { showToast } from '@/lib/showToast'
import Script from 'next/script'
import axios from 'axios'

const CheckoutPage = () => {
    const auth = useSelector(store => store.authStore.auth)
    const cart = useSelector(store => store.cartStore)
    const router = useRouter()
    const dispatch = useDispatch()
    const queryClient = useQueryClient()

    const [panCard, setPanCard] = useState('') // Always start empty - user must enter PAN each time
    const [panError, setPanError] = useState('')
    const [placingOrder, setPlacingOrder] = useState(false)
    const [savingOrder, setSavingOrder] = useState(false)
    const hasRedirected = React.useRef(false)

    // Fetch fresh prices (will use cache from cart page if available)
    const { data: cartWithPrices, isLoading: loadingPrices } = useQuery({
        queryKey: ['cart-prices', cart.products],
        queryFn: async () => {
            const { data } = await axios.post('/api/cart/calculate-prices', {
                cartItems: cart.products.map(item => ({
                    productId: item.productId,
                    variantId: item.variantId,
                    qty: item.qty,
                    weight: item.weight,
                    purity: item.purity,
                    category: item.category,
                    subcategory: item.subcategory,
                    color: item.color,
                    size: item.size,
                    length: item.length,
                    media: item.media,
                    name: item.name,
                    price: 0
                }))
            })
            return data.data.items
        },
        enabled: cart.products.length > 0 && !!auth,
        staleTime: 1000 * 60 * 5, // 5 minute cache
        refetchOnWindowFocus: true,
        placeholderData: keepPreviousData
    })

    // Calculate total from fresh prices
    const total = cartWithPrices?.reduce((sum, item) => sum + item.totalPrice, 0) || 0
    const subtotal = total

    // Merge cart items with fresh prices
    const cartProducts = cart.products.map(item => {
        const priceData = cartWithPrices?.find(p => p.variantId === item.variantId)
        return {
            ...item,
            price: priceData?.unitPrice || 0
        }
    })

    // Helper function to check if profile is complete
    const isProfileComplete = () => {
        return auth?.phone && auth?.address
    }

    // Redirect to login if not authenticated, or to my-account if profile incomplete
    useEffect(() => {
        if (!auth && !hasRedirected.current) {
            hasRedirected.current = true
            showToast('info', 'Please login to continue with checkout')
            router.push(WEBSITE_LOGIN)
        } else if (auth && !isProfileComplete() && !hasRedirected.current) {
            hasRedirected.current = true
            showToast('info', 'Please complete your profile first')
            router.push(USER_DASHBOARD)
        }
    }, [auth, router])

    // Show loading state while redirecting
    if (!auth) {
        return (
            <div className='min-h-screen bg-gray-50 dark:bg-gray-50 py-8'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='grid lg:grid-cols-5 gap-8'>
                        <div className='lg:col-span-3 space-y-4'>
                            <Skeleton className='h-64 w-full' />
                        </div>
                        <div className='lg:col-span-2'>
                            <Skeleton className='h-96 w-full' />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Get Razorpay order ID from backend
    const getOrderId = async (amount, panCard) => {
        try {
            const { data: orderIdData } = await axios.post(API_PAYMENT_GET_ORDER_ID, {
                amount,
                panCard
            })
            if (!orderIdData.success) {
                throw new Error(orderIdData.message)
            }
            return { success: true, order_id: orderIdData.data }
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message }
        }
    }

    // Place order and initiate Razorpay payment
    const placeOrder = async () => {
        setPlacingOrder(true)
        try {
            // Validate PAN card
            if (!panCard || panError) {
                showToast('error', 'Please enter a valid PAN card number')
                setPlacingOrder(false)
                return
            }

            // Validate cart
            if (cart.products.length === 0) {
                showToast('error', 'Your cart is empty')
                setPlacingOrder(false)
                return
            }

            // CRITICAL: Verify prices with backend BEFORE payment
            // This prevents payment with stale prices
            try {
                const { data: priceCheckData } = await axios.post('/api/cart/calculate-prices', {
                    cartItems: cartProducts.map(item => ({
                        productId: item.productId,
                        variantId: item.variantId,
                        qty: item.qty,
                        weight: item.weight,
                        purity: item.purity,
                        category: item.category,
                        subcategory: item.subcategory,
                        color: item.color,
                        size: item.size,
                        length: item.length,
                        media: item.media,
                        name: item.name,
                        price: item.price // Current price from cache
                    }))
                })

                const freshTotal = priceCheckData.data.items.reduce((sum, item) => sum + item.totalPrice, 0)

                // Check if prices have changed (tolerance of ₹10)
                if (Math.abs(freshTotal - total) > 10) {
                    // Prices changed! Invalidate cache and show notification
                    queryClient.invalidateQueries(['cart-prices'])
                    showToast('info', 'Gold/Silver rates have been updated. Please review the revised prices to continue.')
                    setPlacingOrder(false)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                    return
                }
            } catch (error) {
                showToast('error', 'Failed to verify prices. Please try again.')
                setPlacingOrder(false)
                return
            }

            // Get Razorpay order ID
            const generateOrderId = await getOrderId(total, panCard)
            if (!generateOrderId.success) {
                throw new Error(generateOrderId.message)
            }

            const order_id = generateOrderId.order_id

            // Razorpay options
            const razOption = {
                "key": process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                "amount": total * 100, // Convert to paise
                "currency": "INR",
                "name": "M.K. Jewellers",
                "description": "Payment for jewelry order",
                "image": "https://res.cloudinary.com/dxh3hcxav/image/upload/v1766064001/mk_logo_udntp5.webp",
                "order_id": order_id,
                "method": {
                    "netbanking": true,
                    "card": true,
                    "upi": true,
                    "wallet": true
                },
                "handler": async function (response) {
                    // Payment successful - save order
                    setSavingOrder(true)
                    try {
                        // Prepare cart items with all required fields (including prices)
                        const cartItems = cartProducts.map((item) => ({
                            productId: item.productId,
                            variantId: item.variantId,
                            name: item.name,
                            weight: item.weight,
                            purity: item.purity || '',
                            size: item.size || null,
                            length: item.length || null,
                            color: item.color || null,
                            qty: item.qty,
                            price: item.price, // Now has the fresh price
                            category: item.category || '',
                            subcategory: item.subcategory || '',
                            media: item.media || null
                        }))

                        const orderData = {
                            userId: auth.id,
                            email: auth.email,
                            phone: auth.phone,
                            address: auth.address || '{}',
                            panCard: panCard,
                            total: total,
                            cartItems: cartItems,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature
                        }

                        const { data: paymentResponseData } = await axios.post(API_PAYMENT_SAVE_ORDER, orderData)

                        if (paymentResponseData.success) {
                            // Invalidate user orders cache to show new order instantly
                            queryClient.invalidateQueries({ queryKey: ['user-orders'] })

                            showToast('success', paymentResponseData.message)
                            dispatch(clearCart())
                            router.push(WEBSITE_ORDER_DETAILS(response.razorpay_order_id))
                        } else {
                            showToast('error', paymentResponseData.message)
                        }
                    } catch (error) {
                        const errorMessage = error.response?.data?.message || 'Failed to save order'

                        // Check if it's a price mismatch error
                        if (errorMessage.includes('Price verification failed') ||
                            errorMessage.includes('Total amount mismatch') ||
                            errorMessage.includes('refresh')) {

                            // Invalidate cart prices cache to force fresh fetch
                            queryClient.invalidateQueries(['cart-prices'])

                            showToast('error', '⚠️ Prices have changed! Please review the updated prices and try again.')

                            // Optionally scroll to top to show updated prices
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                        } else {
                            showToast('error', errorMessage)
                        }
                    } finally {
                        setSavingOrder(false)
                    }
                },
                "prefill": {
                    "name": auth.name,
                    "email": auth.email,
                    "contact": auth.phone
                },
                "theme": {
                    "color": "#7c3aed"
                }
            }

            // Initialize Razorpay
            const rzp = new window.Razorpay(razOption)

            rzp.on('payment.failed', function (response) {
                showToast('error', response.error.description || 'Payment failed')
                setPlacingOrder(false)
            })

            rzp.open()

        } catch (error) {
            console.error("Payment Initiation Failed:", error);
            const msg = error.response?.data?.message || error.message || 'Failed to initiate payment';
            showToast('error', msg)
        } finally {
            setPlacingOrder(false)
        }
    }

    const handleProceedToPayment = () => {
        if (!panCard || panError) {
            showToast('error', 'Please enter a valid PAN card number')
            return
        }
        placeOrder()
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

                                    {/* PAN Card */}
                                    <div className='space-y-2'>
                                        <Label htmlFor='panCard' className='flex items-center gap-2'>
                                            <CreditCard size={16} />
                                            PAN Card Number <span className='text-red-500'>*</span>
                                        </Label>
                                        <Input
                                            id='panCard'
                                            type='text'
                                            placeholder='ABCDE1234F'
                                            value={panCard}
                                            onChange={(e) => {
                                                const value = e.target.value.toUpperCase()
                                                setPanCard(value)

                                                // Validate PAN format: 5 letters, 4 digits, 1 letter
                                                const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
                                                if (value && !panRegex.test(value)) {
                                                    setPanError('Invalid PAN format (e.g., ABCDE1234F)')
                                                } else {
                                                    setPanError('')
                                                }
                                            }}
                                            maxLength={10}
                                            className={panError ? 'border-red-500' : ''}
                                            required
                                        />
                                        {panError && (
                                            <p className='text-xs text-red-500'>{panError}</p>
                                        )}
                                        <p className='text-xs text-gray-500 dark:text-gray-500'>
                                            Required for all jewelry purchases for tax compliance
                                        </p>
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
                                        {cartProducts.map((product) => (
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
                                                        {product.price > 0 ? (
                                                            `${product.qty} × ${product.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}`
                                                        ) : (
                                                            <span className="text-gray-400">Loading...</span>
                                                        )}
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
                                            {total.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                        </p>
                                    </div>

                                    <Button
                                        className='w-full cursor-pointer'
                                        size='lg'
                                        onClick={handleProceedToPayment}
                                        disabled={!!panError || !panCard || placingOrder || savingOrder}
                                    >
                                        {placingOrder || savingOrder ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                {savingOrder ? 'Saving Order...' : 'Processing...'}
                                            </>
                                        ) : (
                                            'PROCEED TO PAYMENT'
                                        )}
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
                                            onClick={() => window.open('https://wa.me/919881339944', '_blank')}
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
                <Script src='https://checkout.razorpay.com/v1/checkout.js' />
            </div>
        </div>
    )
}

export default CheckoutPage
