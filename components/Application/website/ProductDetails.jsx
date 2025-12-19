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
import { useEffect, useState } from "react"
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
import { useDispatch } from 'react-redux'
import { addToCart } from '@/store/reducer/cartReducer'

const ProductDetails = ({
    product,
    selectedVariant: initialVariant,
    allVariants,
    purities,
    sizes,
    weights,
    media
}) => {
    const router = useRouter()
    const pathname = usePathname()

    // Store currently selected variant in state (client-side switching)
    const [currentVariant, setCurrentVariant] = useState(initialVariant)
    const [quantity, setQuantity] = useState(1)

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

    const handleAddToCart = () => {
        // Validate that variant has a price
        if (!currentVariant.calculatedPrice?.finalPrice) {
            toast.error('Price not available for this variant', {
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

        // Dispatch to Redux cart
        dispatch(addToCart(cartItem))

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
            <div className="md:flex justify-between items-start lg:gap-10 gap-5 mb-20">
                {/* Image Gallery */}
                <div className="md:w-1/2 md:sticky md:top-0">
                    <ProductImageGallery media={media} productName={product.name} />
                </div>

                {/* Product Information */}
                <div className="md:w-1/2 md:mt-0 mt-5">
                    {/* Product Name */}
                    <h1 className="text-3xl font-semibold mb-3">{product.name}</h1>

                    {/* Category & Subcategory */}
                    <div className="flex gap-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>{product.category?.name}</span>
                        {product.subCategory && (
                            <>
                                <span>•</span>
                                <span>{product.subCategory.name}</span>
                            </>
                        )}
                    </div>

                    {/* Price */}
                    {currentVariant.calculatedPrice ? (
                        <div className="mb-6">
                            <p className="text-3xl font-bold text-primary mb-1">
                                ₹{currentVariant.calculatedPrice.finalPrice.toLocaleString('en-IN')}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
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
                    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {currentVariant.purity} {product.category?.name || 'Metal'}
                            {currentVariant.weight && ` (${currentVariant.weight} grams)`}
                        </p>
                    </div>

                    {/* Variant Selectors */}
                    {purities.length > 1 && (
                        <div className="mb-5">
                            <VariantSelector
                                label="Purity"
                                options={purities}
                                selected={currentVariant.purity}
                                onChange={(value) => handleVariantChange('purity', value)}
                            />
                        </div>
                    )}


                    {/* Size Selector (Only for rings) */}
                    {isRing && availableSizes.length > 0 && (
                        <div className="mb-5">
                            <p className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
                                Size <span className="text-sm">(Select any size you want.)</span>
                            </p>
                            <div className="max-w-xs">
                                <Select
                                    options={RING_SIZES}
                                    selected={currentVariant.size || ''}
                                    setSelected={(value) => handleVariantChange('size', value)}
                                    placeholder="Select Size"
                                />
                            </div>
                        </div>
                    )}

                    {/* Length Display (Only for chains/mangalsutra) */}
                    {(product.subCategory?.name?.toLowerCase().includes('chain') ||
                        product.subCategory?.name?.toLowerCase().includes('mangalsutra')) &&
                        currentVariant.length && (
                            <div className="mb-5">
                                <p className="font-semibold text-gray-700 dark:text-gray-300">
                                    Length: <span className="text-primary">{currentVariant.length}</span>
                                </p>
                            </div>
                        )}

                    {/* Quantity Selector */}
                    <div className="mb-6">
                        <QuantitySelector
                            quantity={quantity}
                            onChange={handleQuantityChange}
                        />
                    </div>

                    {/* Add to Cart Button */}
                    <div className="mb-6">
                        <Button
                            onClick={handleAddToCart}
                            className="w-full py-6 text-lg rounded-full"
                            disabled={!currentVariant}
                        >
                            Add to Cart
                        </Button>
                    </div>

                    {/* Customization Contact Note */}
                    <div className="mb-6 p-4 border-2 border-purple-200 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-700 rounded-lg hover:border-purple-300 dark:hover:border-purple-600 transition-all">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">💎</span>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                    Want Custom Personalization?
                                </p>
                                <p className="text-xs text-gray-700 dark:text-gray-300 mb-3">
                                    We can create custom designs tailored to your preferences. Contact us directly for personalized assistance.
                                </p>
                                <a
                                    href={`https://wa.me/919881339944?text=Hi,%20I'm%20interested%20in%20customizing%20the%20product:%20${encodeURIComponent(product.name)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-full transition-colors shadow-sm"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                    Contact on WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Price Breakdown */}
                    {currentVariant.calculatedPrice && (
                        <PriceBreakdown pricing={currentVariant.calculatedPrice} />
                    )}
                </div>
            </div>

            {/* Product Description */}
            {product.description && (
                <div className="mb-10">
                    <div className="shadow rounded border">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b">
                            <h2 className="font-semibold text-2xl">Product Description</h2>
                        </div>
                        <div className="p-4">
                            <div
                                className="prose dark:prose-invert max-w-none"
                                dangerouslySetInnerHTML={{ __html: product.description }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Product Specifications */}
            <div className="mb-10">
                <div className="shadow rounded border">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b">
                        <h2 className="font-semibold text-2xl">Product Specifications</h2>
                    </div>
                    <div className="p-4">
                        <table className="w-full">
                            <tbody>
                                <tr className="border-b">
                                    <td className="py-3 font-semibold text-gray-700 dark:text-gray-300 w-1/3">
                                        Purity
                                    </td>
                                    <td className="py-3 text-gray-600 dark:text-gray-400">
                                        {currentVariant.purity}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-3 font-semibold text-gray-700 dark:text-gray-300">
                                        Weight
                                    </td>
                                    <td className="py-3 text-gray-600 dark:text-gray-400">
                                        {currentVariant.weight} grams
                                    </td>
                                </tr>
                                {currentVariant.size && (
                                    <tr className="border-b">
                                        <td className="py-3 font-semibold text-gray-700 dark:text-gray-300">
                                            Size
                                        </td>
                                        <td className="py-3 text-gray-600 dark:text-gray-400">
                                            {currentVariant.size}
                                        </td>
                                    </tr>
                                )}
                                <tr className="border-b">
                                    <td className="py-3 font-semibold text-gray-700 dark:text-gray-300">
                                        GST
                                    </td>
                                    <td className="py-3 text-gray-600 dark:text-gray-400">
                                        {currentVariant.gst}%
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-3 font-semibold text-gray-700 dark:text-gray-300">
                                        Gender
                                    </td>
                                    <td className="py-3 text-gray-600 dark:text-gray-400">
                                        {product.gender}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductDetails
