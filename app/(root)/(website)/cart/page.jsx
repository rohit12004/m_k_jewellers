'use client'
import { Button } from '@/components/ui/button'
import { WEBSITE_CHECKOUT, WEBSITE_SHOP } from '@/routes/websiteRoutes'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HiMinus, HiPlus } from "react-icons/hi2";
import { decreaseQuantity, increaseQuantity, removeFromCart } from '@/store/reducer/cartReducer'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { IoCheckmarkCircle } from "react-icons/io5";
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import axios from 'axios'

const CartPage = () => {
    const dispatch = useDispatch()
    const cart = useSelector(store => store.cartStore)

    // Fetch fresh prices using TanStack Query (Industry standard)
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
                    price: 0 // Placeholder
                }))
            })
            return data.data.items
        },
        enabled: cart.products.length > 0,
        staleTime: 1000 * 60 * 5, // 5 minute cache
        refetchOnWindowFocus: true,
        placeholderData: keepPreviousData
    })

    // Merge cart items with fresh prices
    const cartProducts = cart.products.map(item => {
        const priceData = cartWithPrices?.find(p => p.variantId === item.variantId)
        return {
            ...item,
            price: priceData?.unitPrice || 0
        }
    })

    const total = cartProducts.reduce((sum, product) => sum + (product.price * product.qty), 0)

    return (
        <div className='lg:px-32 px-4'>
            {/* Breadcrumb */}
            <div className="my-10">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Cart</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            {cart.count === 0
                ?
                <div className='w-full min-h-[500px] flex justify-center items-center py-32'>
                    <div className='text-center'>
                        <h4 className='text-3xl sm:text-4xl font-semibold mb-5'>Your cart is empty!</h4>
                        <Button type="button" asChild>
                            <Link href={WEBSITE_SHOP}>Continue Shopping</Link>
                        </Button>
                    </div>
                </div>
                :
                <div className='lg:px-16 px-4'>
                    {/* Price Disclaimer - Industry Standard (Moved to top) */}
                    <Alert className="mb-6">
                        <Info className="h-3 w-3" />
                        <AlertDescription className="text-xs">
                            <strong>Note:</strong> Prices are subject to change based on current gold/silver rates. Final price will be confirmed at checkout.
                        </AlertDescription>
                    </Alert>

                    <div className='flex lg:flex-nowrap flex-wrap gap-6 my-10 mb-20'>
                        {/* Cart Items */}
                        <div className='lg:w-[60%] w-full'>
                            <h2 className='text-2xl font-semibold mb-6'>My Shopping Cart ({cart.count} {cart.count === 1 ? 'Item' : 'Items'})</h2>

                            {loadingPrices ? (
                                <div className='space-y-4'>
                                    <Skeleton className='h-32 w-full' />
                                    <Skeleton className='h-32 w-full' />
                                    <Skeleton className='h-32 w-full' />
                                </div>
                            ) : (
                                <div className='space-y-4'>
                                    {cartProducts.map(product => (
                                        <div key={product.variantId} className='border rounded-lg p-4 sm:p-6 bg-white'>
                                            {/* Product Header */}
                                            <div className='flex justify-between items-start mb-4'>
                                                <div className='flex-1'>
                                                    <h3 className='text-lg sm:text-xl font-semibold mb-2'>{product.name}</h3>
                                                </div>
                                                <div className='text-right'>
                                                    <p className='text-xl sm:text-2xl font-bold text-primary'>
                                                        {product.price > 0 ? (
                                                            product.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
                                                        ) : (
                                                            <span className="text-gray-400">Loading...</span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Metal Specification */}
                                            {product.category && product.weight && (
                                                <div className='mb-4 p-3 bg-gray-50 rounded-lg'>
                                                    <p className='text-sm font-semibold text-gray-700'>
                                                        {product.color} {product.category} ({product.weight} grams)
                                                    </p>
                                                </div>
                                            )}

                                            {/* Product Details */}
                                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-sm'>
                                                {product.size && (
                                                    <div className='flex gap-2'>
                                                        <span className='font-medium'>Size:</span>
                                                        <span className='text-gray-700'>{product.size}</span>
                                                    </div>
                                                )}
                                                {product.length && (
                                                    <div className='flex gap-2'>
                                                        <span className='font-medium'>Length:</span>
                                                        <span className='text-gray-700'>{product.length}</span>
                                                    </div>
                                                )}
                                                <div className='flex items-center gap-2'>
                                                    <span className='font-medium'>Quantity:</span>
                                                    <div className="flex items-center h-8 border w-fit rounded-full">
                                                        <button
                                                            type="button"
                                                            className="h-full w-8 flex justify-center items-center cursor-pointer hover:bg-gray-100 transition-colors rounded-l-full"
                                                            onClick={() => dispatch(decreaseQuantity({ productId: product.productId, variantId: product.variantId }))}
                                                        >
                                                            <HiMinus className='text-sm' />
                                                        </button>
                                                        <span className="w-10 text-center text-sm font-medium">{product.qty}</span>
                                                        <button
                                                            type="button"
                                                            className="h-full w-8 flex justify-center items-center cursor-pointer hover:bg-gray-100 transition-colors rounded-r-full"
                                                            onClick={() => dispatch(increaseQuantity({ productId: product.productId, variantId: product.variantId }))}
                                                        >
                                                            <HiPlus className='text-sm' />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className='flex items-center gap-4 pt-4 border-t'>
                                                <button
                                                    type='button'
                                                    onClick={() => dispatch(removeFromCart({ productId: product.productId, variantId: product.variantId }))}
                                                    className='text-red-500 hover:text-red-600 transition-colors text-sm font-medium uppercase'
                                                >
                                                    Remove
                                                </button>
                                            </div>

                                            {/* Trust Badges */}
                                            <div className='flex flex-wrap gap-4 mt-4 pt-4 border-t'>
                                                <div className='flex items-center gap-2 text-xs sm:text-sm text-gray-600'>
                                                    <IoCheckmarkCircle className='text-green-600 flex-shrink-0' size={18} />
                                                    <span>30-Day Returnable</span>
                                                </div>
                                                <div className='flex items-center gap-2 text-xs sm:text-sm text-gray-600'>
                                                    <IoCheckmarkCircle className='text-green-600 flex-shrink-0' size={18} />
                                                    <span>Lifetime Exchange</span>
                                                </div>
                                                <div className='flex items-center gap-2 text-xs sm:text-sm text-gray-600'>
                                                    <IoCheckmarkCircle className='text-green-600 flex-shrink-0' size={18} />
                                                    <span>Free & Insured Delivery</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Order Summary */}
                        <div className='lg:w-[40%] w-full'>
                            <div className='rounded-lg border bg-white p-5 sm:p-6 lg:sticky lg:top-5'>
                                <h3 className='text-xl font-semibold mb-6'>Order Summary</h3>

                                <div className='space-y-4 mb-6'>
                                    <div className='flex justify-between items-center text-base'>
                                        <span className='text-gray-600'>Total ({cart.count} {cart.count === 1 ? 'Item' : 'Items'})</span>
                                        <span className='font-medium'>
                                            {total.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                        </span>
                                    </div>

                                    <div className='pt-4 border-t'>
                                        <div className='flex justify-between items-center'>
                                            <span className='text-lg font-semibold'>Total Payable</span>
                                            <span className='text-2xl font-bold text-primary'>
                                                {total.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <Button type="button" asChild className="w-full rounded-full h-12 text-base mb-4">
                                    <Link href={WEBSITE_CHECKOUT}>Place Order</Link>
                                </Button>

                                <div className='text-center text-sm text-gray-600 mb-4'>
                                    <p>Any Questions?</p>
                                    <p>Please call us at <a href="tel:18004190066" className='text-primary hover:underline font-medium'>+91-9881339944</a></p>
                                </div>

                                <p className='text-center text-sm'>
                                    <Link href={WEBSITE_SHOP} className='hover:underline text-primary font-medium'>Continue Shopping</Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}

export default CartPage
