'use client'

import React from 'react'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet"
import { Button } from '@/components/ui/button'
import { SlidersHorizontal } from 'lucide-react'
import ProductFilters from './ProductFilters'

const FilterModal = ({ filters, onFilterChange, filterOptions, onClearAll, productCount, activeFilterCount = 0 }) => {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                    {activeFilterCount > 0 && (
                        <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                            {activeFilterCount}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto p-6">
                <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>
                        Refine your search to find the perfect product
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6">
                    <ProductFilters
                        filters={filters}
                        onFilterChange={onFilterChange}
                        filterOptions={filterOptions}
                        onClearAll={onClearAll}
                        activeFilterCount={activeFilterCount}
                    />
                </div>

                <SheetFooter className="mt-6">
                    <SheetClose asChild>
                        <Button className="w-full">
                            Show {productCount || 0} Products
                        </Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

export default FilterModal
