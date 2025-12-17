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

    // Handle variant change - CLIENT-SIDE matching (no refetch)
    const handleVariantChange = (type, value) => {
        // Safety check: ensure currentVariant exists
        if (!currentVariant) {
            return
        }

        // Smart matching: Prioritize the attribute user changed
        let matchedVariant

        if (type === 'purity') {
            // Find first variant with this purity (weight/size can be different)
            matchedVariant = allVariants.find(v => v.purity === value)
        } else if (type === 'weight') {
            // Find first variant with this weight (purity/size can be different)
            matchedVariant = allVariants.find(v => v.weight === parseFloat(value))
        } else if (type === 'size') {
            // Find first variant with this size (purity/weight can be different)
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

    const handleAddToCart = () => {
        const productName = `${product.name} - ${currentVariant.purity}${currentVariant.weight ? `, ${currentVariant.weight}g` : ''}${currentVariant.size ? `, Size ${currentVariant.size}` : ''}`

        toast.success(`Added to cart: ${productName}`, {
            position: "top-right",
            autoClose: 3000,
        })

        // Future: Dispatch to Redux cart
        // const cartItem = {
        //     productId: product.id,
        //     variantId: currentVariant.id,
        //     name: product.name,
        //     slug: product.slug,
        //     purity: currentVariant.purity,
        //     size: currentVariant.size,
        //     weight: currentVariant.weight,
        //     price: currentVariant.calculatedPrice?.finalPrice || 0,
        //     quantity: quantity,
        //     image: media[0]?.secure_url || imgPlaceholder.src,
        //     category: product.category.name,
        //     subCategory: product.subCategory.name
        // }
        // dispatch(addToCart(cartItem))
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

                    {weights.length > 1 && (
                        <div className="mb-5">
                            <VariantSelector
                                label="Weight"
                                options={weights.map(w => `${w}g`)}
                                selected={`${currentVariant.weight}g`}
                                onChange={(value) => handleVariantChange('weight', value.replace('g', ''))}
                            />
                        </div>
                    )}

                    {sizes.length > 0 && (
                        <div className="mb-5">
                            <VariantSelector
                                label="Size"
                                options={sizes}
                                selected={currentVariant.size}
                                onChange={(value) => handleVariantChange('size', value)}
                            />
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
