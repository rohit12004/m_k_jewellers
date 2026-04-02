'use client'
import { BsCart2 } from "react-icons/bs";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import imgPlaceholder from '@/public/assets/img-placeholder.jpg'
import { removeFromCart, setCartOpen, increaseQuantity, decreaseQuantity } from "@/store/reducer/cartReducer";
import { HiMinus, HiPlus } from "react-icons/hi2";
import Link from "next/link";
import { WEBSITE_CART, WEBSITE_CHECKOUT } from "@/routes/websiteRoutes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { showToast } from "@/lib/showToast";
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import axios from 'axios'

const Cart = () => {
    const dispatch = useDispatch()
    const { products, count, isOpen: open } = useSelector(store => store.cartStore)
    const cart = { products, count } // For compatibility with existing logic below

    // Fetch fresh prices when cart opens
    const { data: cartWithPrices } = useQuery({
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
        enabled: cart.products.length > 0 && open, // Only fetch when cart is open
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

    const subtotal = cartProducts.reduce((sum, product) => sum + (product.price * product.qty), 0)

    return (
        <Sheet open={open} onOpenChange={(val) => dispatch(setCartOpen(val))} >
            <SheetTrigger className="relative p-2 rounded-full hover:bg-primary/10 transition-all duration-300 group">
                <BsCart2 size={22} className="text-gray-600 group-hover:text-primary transition-colors duration-300" />
                <span className="absolute bg-red-500 text-white text-xs rounded-full w-4 h-4 flex justify-center items-center -right-1 -top-1">{cart.count}</span>
            </SheetTrigger>
            <SheetContent className="sm:max-w-[450px] w-full flex flex-col p-0">
                <SheetHeader className='py-4 px-6 border-b'>
                    <SheetTitle className="text-xl sm:text-2xl">My Cart</SheetTitle>
                    <SheetDescription></SheetDescription>
                </SheetHeader>

                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Cart Items - Scrollable */}
                    <div className="flex-1 overflow-auto px-4 sm:px-6">
                        {cart.count === 0 && <div className="h-full flex justify-center items-center text-lg sm:text-xl font-semibold text-gray-500">
                            Your Cart Is Empty.
                        </div>}

                        {cartProducts?.map(product => (
                            <div key={product.variantId} className="flex items-center gap-3 sm:gap-4 mb-2 pb-2 border-b last:border-b-0">
                                {/* Product Image */}
                                <div className="flex-shrink-0 bg-white dark:bg-gray-800 rounded border border-gray-100 dark:border-gray-700 overflow-hidden flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20">
                                    <Image
                                        src={product?.media || imgPlaceholder.src}
                                        height={100}
                                        width={100}
                                        alt={product.name}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                {/* Product Details */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm sm:text-base font-medium mb-1 truncate">{product.name}</h4>
                                    <p className="text-xs sm:text-sm text-gray-500 mb-1">
                                        {product.color}{product.weight ? ` (${product.weight}g)` : ''}
                                    </p>
                                    {product.size && (
                                        <p className="text-xs sm:text-sm text-gray-500 mb-1">
                                            Size: {product.size}
                                        </p>
                                    )}
                                    {product.length && (
                                        <p className="text-xs sm:text-sm text-gray-500 mb-1">
                                            Length: {product.length}
                                        </p>
                                    )}
                                    <p className="text-sm sm:text-base font-semibold">
                                        {product.price > 0 ? (
                                            product.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
                                        ) : (
                                            <span className="text-gray-400">Loading price...</span>
                                        )}
                                    </p>

                                    {/* Quantity Controls inside Sidebar */}
                                    <div className="flex items-center mt-2 border border-gray-200 dark:border-gray-700 w-fit rounded-lg overflow-hidden h-7 sm:h-8">
                                        <button 
                                            onClick={() => dispatch(decreaseQuantity({ productId: product.productId, variantId: product.variantId }))}
                                            className="px-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <HiMinus size={12} />
                                        </button>
                                        <span className="px-3 text-xs sm:text-sm font-semibold border-x border-gray-200 dark:border-gray-700 min-w-[30px] text-center">
                                            {product.qty}
                                        </span>
                                        <button 
                                            onClick={() => dispatch(increaseQuantity({ productId: product.productId, variantId: product.variantId }))}
                                            className="px-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <HiPlus size={12} />
                                        </button>
                                    </div>
                                </div>

                                {/* Remove Button */}
                                <div className="flex-shrink-0">
                                    <button
                                        type="button"
                                        className="text-red-500 text-xs sm:text-sm underline underline-offset-1 hover:text-red-600 transition-colors"
                                        onClick={() => dispatch(removeFromCart({ productId: product.productId, variantId: product.variantId }))}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer - Total & Buttons */}
                    <div className="border-t bg-white px-4 sm:px-6 py-4">
                        <h2 className="flex justify-between items-center text-base sm:text-lg font-semibold mb-4">
                            <span>Total</span>
                            <span>{subtotal?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                        </h2>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                type="button"
                                asChild
                                variant="secondary"
                                className="w-full sm:w-1/2"
                                onClick={() => dispatch(setCartOpen(false))}
                            >
                                <Link href={WEBSITE_CART}>View Cart</Link>
                            </Button>
                            <Button
                                type="button"
                                className="w-full sm:w-1/2"
                                onClick={() => {
                                    if (!cart.count) {
                                        showToast('error', 'Your cart is empty!')
                                        return
                                    }
                                    dispatch(setCartOpen(false))
                                }}
                                asChild={cart.count}
                            >
                                {cart.count ?
                                    <Link href={WEBSITE_CHECKOUT}>Checkout</Link>
                                    :
                                    <span>Checkout</span>
                                }
                            </Button>
                        </div>
                    </div>
                </div>

            </SheetContent>
        </Sheet>

    )
}

export default Cart
