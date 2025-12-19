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
import { removeFromCart } from "@/store/reducer/cartReducer";
import Link from "next/link";
import { WEBSITE_CART, WEBSITE_CHECKOUT } from "@/routes/websiteRoutes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { showToast } from "@/lib/showToast";
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import axios from 'axios'

const Cart = () => {
    const [open, setOpen] = useState(false)

    const cart = useSelector(store => store.cartStore)
    const dispatch = useDispatch()

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
        <Sheet open={open} onOpenChange={setOpen} >
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
                                <div className="flex-shrink-0">
                                    <Image
                                        src={product?.media || imgPlaceholder.src}
                                        height={80}
                                        width={80}
                                        alt={product.name}
                                        className="w-16 h-16 sm:w-20 sm:h-20 rounded border object-cover"
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
                                            `${product.qty} × ${product.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}`
                                        ) : (
                                            <span className="text-gray-400">Loading price...</span>
                                        )}
                                    </p>
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
                                onClick={() => setOpen(false)}
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
                                    setOpen(false)
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
