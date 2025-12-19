'use client'
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { showToast } from '@/lib/showToast'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

const MetalRatesPage = () => {
    const queryClient = useQueryClient()
    const [editingRates, setEditingRates] = useState({})

    // Fetch metal rates
    const { data, isLoading } = useQuery({
        queryKey: ['metalRates'],
        queryFn: async () => {
            const { data } = await axios.get('/api/admin/metal-rates')
            return data.data
        }
    })

    // Update mutation
    const updateRates = useMutation({
        mutationFn: async (rates) => {
            const { data } = await axios.post('/api/admin/metal-rates', { rates })
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['metalRates'])
            queryClient.invalidateQueries(['cart-prices']) // Invalidate cart prices to reflect new rates
            showToast('success', 'Metal rates updated successfully!')
            setEditingRates({})
        },
        onError: (error) => {
            showToast('error', error.response?.data?.message || 'Failed to update rates')
        }
    })

    const handleRateChange = (id, value) => {
        setEditingRates(prev => ({
            ...prev,
            [id]: value
        }))
    }

    const handleUpdate = () => {
        // Only send rates that were actually changed
        const ratesToUpdate = data
            .filter(rate => editingRates.hasOwnProperty(rate.id)) // Only changed rates
            .map(rate => ({
                categoryName: rate.categoryName,
                purity: rate.purity,
                ratePerGram: editingRates[rate.id]
            }))

        if (ratesToUpdate.length === 0) {
            showToast('info', 'No rates were changed')
            return
        }

        updateRates.mutate(ratesToUpdate)
    }

    const formatDateTime = (date) => {
        return new Date(date).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short'
        })
    }

    if (isLoading) {
        return <div className="p-8">Loading metal rates...</div>
    }

    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Metal Rates Management</h1>
                <p className="text-gray-600 mt-2">
                    Update daily metal rates for dynamic pricing
                </p>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {data?.map((rate) => (
                    <div key={rate.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <p className="font-semibold text-lg text-gray-900 dark:text-white">{rate.categoryName}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{rate.purity}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Rate per Gram</p>
                                <Input
                                    type="number"
                                    step="0.01"
                                    className="w-24 h-9 text-right mt-1"
                                    value={editingRates[rate.id] ?? rate.ratePerGram}
                                    onChange={(e) => handleRateChange(rate.id, e.target.value)}
                                />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Updated: {formatDateTime(rate.updatedAt)}
                        </p>
                    </div>
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Metal Type</TableHead>
                            <TableHead>Purity</TableHead>
                            <TableHead>Rate per Gram (₹)</TableHead>
                            <TableHead>Last Updated</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data?.map((rate) => (
                            <TableRow key={rate.id}>
                                <TableCell className="font-medium">
                                    {rate.categoryName}
                                </TableCell>
                                <TableCell>{rate.purity}</TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        className="w-32"
                                        value={editingRates[rate.id] ?? rate.ratePerGram}
                                        onChange={(e) => handleRateChange(rate.id, e.target.value)}
                                    />
                                </TableCell>
                                <TableCell className="text-sm text-gray-600">
                                    {formatDateTime(rate.updatedAt)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Update Button */}
            <div className="mt-4">
                <Button
                    onClick={handleUpdate}
                    disabled={updateRates.isPending}
                    className="w-full"
                >
                    {updateRates.isPending ? 'Updating...' : 'Update Rates'}
                </Button>
            </div>

            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Note:</strong> All product prices will automatically recalculate
                    when you update these rates.
                </p>
            </div>
        </div>
    )
}

export default MetalRatesPage
