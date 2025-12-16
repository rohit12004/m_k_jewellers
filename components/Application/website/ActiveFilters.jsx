'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

const ActiveFilters = ({ filters, onRemoveFilter, onClearAll, filterOptions }) => {
    const activeFilters = []

    // Subcategories
    if (filters.subcategory) {
        const slugs = filters.subcategory.split(',')
        slugs.forEach(slug => {
            const subcategory = filterOptions?.subcategories?.find(s => s.slug === slug)
            if (subcategory) {
                activeFilters.push({
                    type: 'subcategory',
                    value: slug,
                    label: subcategory.name
                })
            }
        })
    }

    // Categories
    if (filters.category) {
        const slugs = filters.category.split(',')
        slugs.forEach(slug => {
            const category = filterOptions?.categories?.find(c => c.slug === slug)
            if (category) {
                activeFilters.push({
                    type: 'category',
                    value: slug,
                    label: category.name
                })
            }
        })
    }

    // Gender
    if (filters.gender) {
        activeFilters.push({
            type: 'gender',
            value: filters.gender,
            label: filters.gender === 'MEN' ? 'Men' : 'Women'
        })
    }

    // Purity
    if (filters.purity) {
        const purities = filters.purity.split(',')
        purities.forEach(purity => {
            activeFilters.push({
                type: 'purity',
                value: purity,
                label: purity
            })
        })
    }

    if (activeFilters.length === 0) return null

    return (
        <div className="flex flex-wrap items-center gap-2 py-4">
            <span className="text-sm font-medium text-muted-foreground">Applied Filters:</span>
            {activeFilters.map((filter, index) => (
                <Badge
                    key={`${filter.type}-${filter.value}-${index}`}
                    variant="secondary"
                    className="gap-1 pr-1"
                >
                    {filter.label}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => onRemoveFilter(filter.type, filter.value)}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </Badge>
            ))}
            {activeFilters.length > 1 && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearAll}
                    className="h-7 text-xs"
                >
                    Clear All
                </Button>
            )}
        </div>
    )
}

export default ActiveFilters
