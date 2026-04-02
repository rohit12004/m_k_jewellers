'use client'

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { WEBSITE_SHOP } from "@/routes/websiteRoutes"
import { useEffect, useRef, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import ProductImageGallery from "./ProductImageGallery"
import VariantSelector from "./VariantSelector"
import QuantitySelector from "./QuantitySelector"
import PriceBreakdown from "./PriceBreakdown"
import { Button } from "@/components/ui/button"
import { toast } from "react-toastify"
import imgPlaceholder from '@/public/assets/img-placeholder.jpg'
import { RING_SIZES } from '@/lib/ringSizes'
import Select from '@/components/Application/Select'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart, setCartOpen } from '@/store/reducer/cartReducer'
import { MAX_UNIQUE_ITEMS, MAX_QTY_PER_ITEM, ADD_TO_CART_COOLDOWN_MS } from '@/lib/cartLimits'
import SimilarProducts from "./SimilarProducts"
import VirtualTryOn from "./VirtualTryOn"
import { ScanFace } from 'lucide-react'

const ProductDetails = ({
    product,
    selectedVariant: initialVariant,
    allVariants,
    purities,
    sizes,
    weights,
    media,
    similarProducts
}) => {
    const router = useRouter()
    const pathname = usePathname()

    // Store currently selected variant in state (client-side switching)
    const [currentVariant, setCurrentVariant] = useState(initialVariant)
    const [quantity, setQuantity] = useState(1)
    const [tryOnOpen, setTryOnOpen] = useState(false)

    // Anti-bot: track last add-to-cart timestamp for cooldown
    const lastAddedAt = useRef(null)

    // Update current variant when initial variant changes (from URL navigation)
    useEffect(() => {
        setCurrentVariant(initialVariant)
    }, [initialVariant])

    // Detect if product is a ring (check subcategory name with word boundary)
    // Matches 'ring' or 'rings' but not 'earring'
    const isRing = /\brings?\b/.test(product.subCategory?.name?.toLowerCase() || '')

    // For rings: show ALL sizes 1-33, not just variant sizes
    const availableSizes = isRing
        ? RING_SIZES.map(s => s.value) // All sizes 1-33
        : sizes // Only variant sizes for non-rings

    // Handle variant change - CLIENT-SIDE matching (no refetch)
    const handleVariantChange = (type, value) => {
        // Safety check: ensure currentVariant exists
        if (!currentVariant) {
            return
        }

        let matchedVariant

        if (type === 'size' && isRing) {
            // LOOSE SIZE MATCHING for rings:
            // Find variant with same weight + purity (ignore size)
            const priceVariant = allVariants.find(v =>
                v.weight === currentVariant.weight &&
                v.purity === currentVariant.purity
            )

            if (priceVariant) {
                // Create virtual variant with selected size + price from weight match
                matchedVariant = {
                    ...priceVariant,
                    size: value, // Override with selected size
                    isVirtual: true
                }
            } else {
                // Fallback: just update size on current variant
                matchedVariant = { ...currentVariant, size: value, isVirtual: true }
            }
        } else if (type === 'purity') {
            // Find first variant with this purity (weight/size can be different)
            matchedVariant = allVariants.find(v => v.purity === value)
        } else if (type === 'weight') {
            // Find first variant with this weight (purity/size can be different)
            matchedVariant = allVariants.find(v => v.weight === parseFloat(value))
        } else if (type === 'size') {
            // Non-ring: strict matching
            matchedVariant = allVariants.find(v => v.size === value)
        }

        if (matchedVariant) {
            // Update state immediately (no API call, no re-render)
            setCurrentVariant(matchedVariant)

            // Update URL with the actual variant's attributes
            const params = new URLSearchParams()
            if (matchedVariant.purity) params.set('purity', matchedVariant.purity)
            if (matchedVariant.size) params.set('size', matchedVariant.size)
            if (matchedVariant.weight) params.set('weight', matchedVariant.weight)

            // Use window.history to update URL without triggering navigation
            window.history.replaceState({}, '', `${pathname}?${params.toString()}`)
        }
    }

    const dispatch = useDispatch()
    const cartProducts = useSelector(store => store.cartStore.products)

    const handleAddToCart = () => {
        // Validate that variant has a price
        if (!currentVariant.calculatedPrice?.finalPrice) {
            toast.error('Price not available for this variant', {
                position: "top-right",
                autoClose: 3000,
            })
            return
        }

        // ── Anti-bot: cooldown check ──────────────────────────────────────
        const now = Date.now()
        if (lastAddedAt.current && now - lastAddedAt.current < ADD_TO_CART_COOLDOWN_MS) {
            toast.warning('Please wait a moment before adding another item.', {
                position: "top-right",
                autoClose: 2000,
            })
            return
        }

        // ── Anti-bot: max unique items check ─────────────────────────────
        const isAlreadyInCart = cartProducts.some(item => item.variantId === currentVariant.id)
        if (!isAlreadyInCart && cartProducts.length >= MAX_UNIQUE_ITEMS) {
            toast.error(`Cart limit reached. You can add at most ${MAX_UNIQUE_ITEMS} different items.`, {
                position: "top-right",
                autoClose: 4000,
            })
            return
        }

        // ── Anti-bot: max qty per item check ─────────────────────────────
        const existingItem = cartProducts.find(item => item.variantId === currentVariant.id)
        const currentQtyInCart = existingItem?.qty || 0
        if (currentQtyInCart + quantity > MAX_QTY_PER_ITEM) {
            toast.warning(`You can only have up to ${MAX_QTY_PER_ITEM} of the same item in your cart.`, {
                position: "top-right",
                autoClose: 3000,
            })
            return
        }

        // Prepare cart item data (NO PRICE - Industry standard)
        const cartItem = {
            productId: product.id,
            variantId: currentVariant.id,
            name: product.name,
            size: currentVariant.size || null,
            length: currentVariant.length || null,
            weight: currentVariant.weight || null,
            purity: currentVariant.purity, // Needed for price calculation
            color: currentVariant.purity, // Using purity as color/variant identifier
            media: media[0]?.secure_url || imgPlaceholder.src,
            qty: quantity,
            subcategory: product.subCategory?.name || null,
            category: product.category?.name || null
            // NO PRICE - Calculated fresh on cart page
        }

        // Dispatch to Redux cart & record timestamp
        dispatch(addToCart(cartItem))
        lastAddedAt.current = Date.now()

        // ✅ Open cart sidebar automatically (High-end UX)
        dispatch(setCartOpen(true))

        toast.success(`${product.name} added to cart`, {
            position: "top-right",
            autoClose: 3000,
        })
    }

    const handleQuantityChange = (newQty) => {
        setQuantity(newQty)
    }

    return (
        <div className="lg:px-32 px-4">
            {/* Breadcrumb Navigation */}
            <div className="my-10">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href={WEBSITE_SHOP}>Shop</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        {product.category && (
                            <>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href={`${WEBSITE_SHOP}?category=${product.category.slug}`}>
                                        {product.category.name}
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                            </>
                        )}
                        <BreadcrumbItem>
                            <BreadcrumbPage>{product.name}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            {/* Main Product Section */}
            <div className="md:flex justify-between items-start lg:gap-10 gap-5 mb-10 md:mb-16">
                {/* Image Gallery & Try On */}
                <div className="md:w-1/2 md:sticky md:top-0">
                    <ProductImageGallery 
                        media={media} 
                        productName={product.name} 
                        tryOnImage={product.tryOnImage}
                        onTryOn={() => setTryOnOpen(true)}
                    />
                </div>

                {/* Product Information */}
                <div className="md:w-1/2 md:mt-0 mt-5 flex flex-col items-center md:items-start text-center md:text-left">
                    {/* Category & Subcategory */}
                    <div className="flex gap-2 mb-2 text-sm text-gray-500 dark:text-gray-400 justify-center md:justify-start font-medium uppercase tracking-wider">
                        <span>{product.category?.name}</span>
                        {product.subCategory && (
                            <>
                                <span className="text-gray-300">|</span>
                                <span>{product.subCategory.name}</span>
                            </>
                        )}
                    </div>

                    {/* Product Name */}
                    <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">{product.name}</h1>

                    {/* Price */}
                    {currentVariant.calculatedPrice ? (
                        <div className="mb-6 flex flex-col items-center md:items-start">
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-primary">
                                    ₹{currentVariant.calculatedPrice.finalPrice.toLocaleString('en-IN')}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                (Incl. of all taxes)
                            </p>
                        </div>
                    ) : (
                        <div className="mb-6">
                            <p className="text-lg text-gray-600 dark:text-gray-400">
                                Price on request
                            </p>
                        </div>
                    )}

                    {/* Metal Specification */}
                    <div className="mb-8 p-3 bg-gray-50/80 dark:bg-gray-800/50 rounded-xl w-full border border-gray-100 dark:border-gray-800">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center justify-center md:justify-start gap-2">
                            <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                            {currentVariant.purity} Gold {product.category?.name || 'Metal'}
                            {currentVariant.weight && (
                                <span className="text-gray-400 font-normal">({currentVariant.weight} grams)</span>
                            )}
                        </p>
                    </div>

                    {/* Variant Selectors */}
                    {purities.length > 1 && (
                        <div className="mb-5 flex flex-col items-center md:items-start text-center md:text-left">
                            <VariantSelector
                                label="Purity"
                                options={purities}
                                selected={currentVariant.purity}
                                onChange={(value) => handleVariantChange('purity', value)}
                            />
                        </div>
                    )}




                    {/* Unified Attribute & Control Row */}
                    <div className="flex flex-wrap items-end justify-center md:justify-start gap-6 mb-8 w-full">
                        {/* Size/Length Display */}
                        {isRing && availableSizes.length > 0 ? (
                            <div className="flex flex-col items-center md:items-start flex-1 min-w-[200px] max-w-xs">
                                <p className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
                                    Size <span className="text-xs font-normal text-gray-400">(Select any size you want)</span>
                                </p>
                                <Select
                                    options={RING_SIZES}
                                    selected={currentVariant.size || ''}
                                    setSelected={(value) => handleVariantChange('size', value)}
                                    placeholder="Select Size"
                                />
                            </div>
                        ) : (product.subCategory?.name?.toLowerCase().includes('chain') ||
                            product.subCategory?.name?.toLowerCase().includes('mangalsutra')) &&
                            currentVariant.length ? (
                            <div className="flex flex-col items-center md:items-start h-full">
                                <p className="mb-2 font-semibold text-gray-700 dark:text-gray-300">Length</p>
                                <div className="h-10 px-4 flex items-center bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 text-primary font-bold text-sm">
                                    {currentVariant.length}
                                </div>
                            </div>
                        ) : null}

                        {/* Quantity Selector */}
                        <div className="shrink-0 flex flex-col items-center md:items-start">
                            <QuantitySelector
                                quantity={quantity}
                                onChange={handleQuantityChange}
                                max={MAX_QTY_PER_ITEM}
                            />
                        </div>
                    </div>

                    {/* Add to Cart Action Row */}
                    <div className="w-full mb-10">
                        <Button
                            onClick={handleAddToCart}
                            className="w-full py-6 text-lg font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                            disabled={!currentVariant}
                        >
                            Add to Cart
                        </Button>
                    </div>

                    {/* Customization Contact Note */}
                    <div className="p-3 w-full border border-purple-100 bg-purple-50/30 dark:bg-purple-900/10 dark:border-purple-900/30 rounded-xl transition-all">
                        <div className="flex items-center gap-3">
                            <span className="text-xl">💎</span>
                            <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-3">
                                <div>
                                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                        Custom Personalization?
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Tailored designs to your preference.
                                    </p>
                                </div>
                                <a
                                    href={`https://wa.me/919881339944?text=Hi,%20I'm%20interested%20in%20customizing%20the%20product:%20${encodeURIComponent(product.name)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-6 py-4 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm whitespace-nowrap"
                                >
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                    WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Removed PriceBreakdown from here */}
                </div>
            </div>

            {/* Price Breakdown */}
            {currentVariant.calculatedPrice && (
                <PriceBreakdown pricing={currentVariant.calculatedPrice} />
            )}

            {/* Product description... */}

            {/* Product Description */}
            {product.description && (
                <div className="mb-10">
                    <div className="shadow rounded border">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b">
                            <h2 className="font-semibold text-lg">Product Description</h2>
                        </div>
                        <div className="p-4">
                            <div
                                className="prose dark:prose-invert max-w-none text-sm"
                                dangerouslySetInnerHTML={{ __html: product.description }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Virtual Try On Modal */}
            <VirtualTryOn
                isOpen={tryOnOpen}
                onClose={setTryOnOpen}
                productImgUrl={product.tryOnImage}
            />

            {/* Product Specifications */}
            <div className="mb-10">
                <div className="shadow-sm rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                        <h2 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Product Specifications</h2>
                    </div>
                    <div className="p-0 sm:p-4">
                        <table className="w-full">
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                <tr>
                                    <td className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm w-1/3">
                                        Purity
                                    </td>
                                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">
                                        {currentVariant.purity}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                        Weight
                                    </td>
                                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">
                                        {currentVariant.weight} grams
                                    </td>
                                </tr>
                                {currentVariant.size && (
                                    <tr>
                                        <td className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                            Size
                                        </td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">
                                            {currentVariant.size}
                                        </td>
                                    </tr>
                                )}
                                <tr>
                                    <td className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                        GST
                                    </td>
                                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">
                                        {currentVariant.gst}%
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                        Gender
                                    </td>
                                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">
                                        {product.gender}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {/* Similar Products Section */}
            <SimilarProducts products={similarProducts} />
        </div>
    )
}

export default ProductDetails
