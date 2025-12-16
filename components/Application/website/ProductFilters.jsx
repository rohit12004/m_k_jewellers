'use client'

import React from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const ProductFilters = ({ filters, onFilterChange, filterOptions, onClearAll, activeFilterCount = 0 }) => {
    const handleCheckboxChange = (filterType, value, checked) => {
        const currentValues = filters[filterType]?.split(',').filter(Boolean) || []

        let newValues
        if (checked) {
            newValues = [...currentValues, value]
        } else {
            newValues = currentValues.filter(v => v !== value)
        }

        onFilterChange(filterType, newValues.length > 0 ? newValues.join(',') : null)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Filters</h2>
                {activeFilterCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClearAll}
                        className="text-sm text-muted-foreground hover:text-foreground"
                    >
                        Clear All ({activeFilterCount})
                    </Button>
                )}
            </div>

            <Separator />

            {/* Subcategory Filter */}
            {filterOptions?.subcategories && filterOptions.subcategories.length > 1 && (
                <div className="space-y-3">
                    <h3 className="font-medium text-sm">Type</h3>
                    <div className="space-y-2">
                        {filterOptions.subcategories.map((subcategory) => (
                            <div key={subcategory.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`subcategory-${subcategory.slug}`}
                                    checked={filters.subcategory?.split(',').filter(Boolean).includes(subcategory.slug) || false}
                                    onCheckedChange={(checked) =>
                                        handleCheckboxChange('subcategory', subcategory.slug, checked)
                                    }
                                />
                                <Label
                                    htmlFor={`subcategory-${subcategory.slug}`}
                                    className="text-sm font-normal cursor-pointer flex-1"
                                >
                                    {subcategory.name}
                                    <span className="text-muted-foreground ml-1">({subcategory.count})</span>
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Category Filter */}
            {filterOptions?.categories && filterOptions.categories.length > 0 && (
                <>
                    <Separator />
                    <div className="space-y-3">
                        <h3 className="font-medium text-sm">Material</h3>
                        <div className="space-y-2">
                            {filterOptions.categories.map((category) => (
                                <div key={category.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`category-${category.slug}`}
                                        checked={filters.category?.split(',').filter(Boolean).includes(category.slug) || false}
                                        onCheckedChange={(checked) =>
                                            handleCheckboxChange('category', category.slug, checked)
                                        }
                                    />
                                    <Label
                                        htmlFor={`category-${category.slug}`}
                                        className="text-sm font-normal cursor-pointer flex-1"
                                    >
                                        {category.name}
                                        <span className="text-muted-foreground ml-1">({category.count})</span>
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Gender Filter */}
            <Separator />
            <div className="space-y-3">
                <h3 className="font-medium text-sm">Gender</h3>
                <div className="space-y-2">
                    {['MEN', 'WOMEN'].map((gender) => (
                        <div key={gender} className="flex items-center space-x-2">
                            <Checkbox
                                id={`gender-${gender}`}
                                checked={filters.gender === gender}
                                onCheckedChange={(checked) =>
                                    onFilterChange('gender', checked ? gender : null)
                                }
                            />
                            <Label
                                htmlFor={`gender-${gender}`}
                                className="text-sm font-normal cursor-pointer"
                            >
                                {gender === 'MEN' ? 'Men' : 'Women'}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Purity Filter */}
            {filterOptions?.purities && filterOptions.purities.length > 0 && (
                <>
                    <Separator />
                    <div className="space-y-3">
                        <h3 className="font-medium text-sm">Purity</h3>
                        <div className="space-y-2">
                            {filterOptions.purities.map((purity) => (
                                <div key={purity} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`purity-${purity}`}
                                        checked={filters.purity?.split(',').filter(Boolean).includes(purity) || false}
                                        onCheckedChange={(checked) =>
                                            handleCheckboxChange('purity', purity, checked)
                                        }
                                    />
                                    <Label
                                        htmlFor={`purity-${purity}`}
                                        className="text-sm font-normal cursor-pointer"
                                    >
                                        {purity}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}


            {/* Sort By */}
            <Separator />
            <div className="space-y-3">
                <h3 className="font-medium text-sm">Sort By</h3>
                <Select
                    value={filters.sortBy || 'newest'}
                    onValueChange={(value) => onFilterChange('sortBy', value)}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="price_asc">Price: Low to High</SelectItem>
                        <SelectItem value="price_desc">Price: High to Low</SelectItem>
                        <SelectItem value="name_asc">Name: A to Z</SelectItem>
                        <SelectItem value="name_desc">Name: Z to A</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}

export default ProductFilters
