'use client'
import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { API_ORDER_DETAILS } from '@/routes/websiteRoutes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { CheckCircle, Package, Truck, MapPin, Phone, Mail, CreditCard, Download } from 'lucide-react'
import Image from 'next/image'
import imgPlaceholder from '@/public/assets/img-placeholder.jpg'
import OrderTimeline from '@/components/Application/Website/OrderTimeline'
import { toast } from 'sonner'

import logo from '@/public/assets/mk_logo.jpg'
import { IoLocationOutline } from "react-icons/io5";

const OrderDetailsPage = () => {
    const params = useParams()
    const orderId = params.order_id
    const [downloading, setDownloading] = useState(false)

    // Fetch order details using TanStack Query
    const { data: order, isLoading, error } = useQuery({
        queryKey: ['order-details', orderId],
        queryFn: async () => {
            const { data } = await axios.get(API_ORDER_DETAILS(orderId))
            if (!data.success) {
                throw new Error(data.message || 'Failed to fetch order details')
            }
            return data.data
        },
        enabled: !!orderId,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    })

    const downloadReceipt = async () => {
        setDownloading(true)
        try {
            const response = await axios.get(`/api/order/receipt/${orderId}`, {
                responseType: 'blob',
            })
            const blob = new Blob([response.data], { type: 'application/pdf' })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `MK_Jewellers_Receipt_${orderId}.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
            toast.success('Receipt downloaded successfully')
        } catch (error) {
            console.error('Download error:', error)
            toast.error(error.response?.data?.message || 'Failed to download receipt')
        } finally {
            setDownloading(false)
        }
    }

    if (isLoading) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-white'>
                <div className='text-center'>
                    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
                    <p className='mt-4 text-gray-600 font-medium'>Generating your receipt...</p>
                </div>
            </div>
        )
    }

    if (error || !order) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-gray-50'>
                <Card className='max-w-md shadow-lg border-red-100'>
                    <CardContent className='pt-6 text-center'>
                        <div className='w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4'>
                            <Package className='text-red-500' size={32} />
                        </div>
                        <h2 className='text-xl font-bold text-gray-800 mb-2'>Order Not Found</h2>
                        <p className='text-gray-600 mb-6'>{error?.message || 'The requested order details could not be found.'}</p>
                        <Button onClick={() => window.location.href = '/'}>Go back to home</Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const address = JSON.parse(order.address || '{}')

    return (
        <div className='min-h-screen bg-gray-100/50 py-12 px-4 print:bg-white print:py-0'>
            <div className='max-w-4xl mx-auto'>
                {/* Download Header - Hidden on Print */}
                <div className='flex justify-between items-center mb-6 print:hidden'>
                    <Button variant='outline' onClick={() => window.history.back()} className='gap-2'>
                        Back
                    </Button>
                    <Button onClick={downloadReceipt} disabled={downloading} className='gap-2 bg-primary hover:bg-primary/90'>
                        {downloading ? <Loader2 className='animate-spin' size={18} /> : <Download size={18} />}
                        Download PDF Receipt
                    </Button>
                </div>

                {/* Main Receipt Content */}
                <Card className='shadow-xl border-none overflow-hidden bg-white'>
                    {/* Brand Header */}
                    <div className='bg-primary/5 p-8 sm:p-12 border-b relative'>
                        <div className='absolute top-0 right-0 p-4 print:hidden'>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                                {order.paymentStatus}
                            </span>
                        </div>
                        
                        <div className='flex flex-col items-center text-center'>
                            <div className='mb-4 relative'>
                                <Image src={logo} width={80} height={80} alt='M.K. Jewellers' priority className='rounded-full ring-4 ring-white shadow-md' />
                            </div>
                            <h1 className='text-3xl sm:text-4xl font-bold text-gray-800 tracking-tight'>M. K. JEWELLERS</h1>
                            <p className='text-primary font-semibold tracking-[0.2em] mt-1 text-sm sm:text-base'>EXQUISITE CRAFTSMANSHIP</p>
                            <div className='mt-6 border-y border-primary/20 py-2 w-full max-w-md'>
                                <h2 className='text-xl font-bold text-gray-700 uppercase tracking-widest'>TAX INVOICE / RECEIPT</h2>
                            </div>
                        </div>
                    </div>

                    <CardContent className='p-8 sm:p-12 space-y-12'>
                        {/* Order Metadata Block */}
                        <div className='grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left'>
                            <div className='space-y-1'>
                                <p className='text-xs font-bold text-gray-400 uppercase tracking-wider'>Order ID</p>
                                <p className='text-sm font-bold text-gray-800 font-mono'>#{order.orderId.split('_')[1] || order.orderId}</p>
                            </div>
                            <div className='space-y-1'>
                                <p className='text-xs font-bold text-gray-400 uppercase tracking-wider'>Invoice Date</p>
                                <p className='text-sm font-bold text-gray-800'>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                            </div>
                            <div className='space-y-1'>
                                <p className='text-xs font-bold text-gray-400 uppercase tracking-wider'>Payment ID</p>
                                <p className='text-sm font-bold text-gray-800 truncate' title={order.paymentId}>{order.paymentId || 'N/A'}</p>
                            </div>
                            <div className='space-y-1'>
                                <p className='text-xs font-bold text-gray-400 uppercase tracking-wider'>Status</p>
                                <div className='flex items-center justify-center md:justify-start gap-1.5'>
                                    <div className='w-2 h-2 rounded-full bg-green-500 animate-pulse'></div>
                                    <p className='text-sm font-bold text-gray-800 uppercase'>{order.orderStatus}</p>
                                </div>
                            </div>
                        </div>

                        {/* Customer Information Section */}
                        <div className='grid md:grid-cols-2 gap-12 pt-6'>
                            <div className='space-y-4'>
                                <h3 className='text-sm font-bold text-primary uppercase tracking-widest border-b pb-2'>Billed To</h3>
                                <div className='space-y-2'>
                                    <p className='text-lg font-bold text-gray-900'>{order.user?.name || 'Customer'}</p>
                                    <div className='space-y-1 text-sm text-gray-600'>
                                        <p className='flex items-center gap-2'><Mail size={14} className='text-gray-400' /> {order.email}</p>
                                        <p className='flex items-center gap-2'><Phone size={14} className='text-gray-400' /> {order.phone}</p>
                                        <p className='flex items-center gap-2 font-semibold text-gray-700'><CreditCard size={14} className='text-gray-400' /> PAN: {order.panCard}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className='space-y-4'>
                                <h3 className='text-sm font-bold text-primary uppercase tracking-widest border-b pb-2'>Shipped To</h3>
                                <div className='space-y-1 text-sm text-gray-600'>
                                    <div className='flex items-start gap-2'>
                                        <MapPin size={16} className='text-gray-400 mt-1 flex-shrink-0' />
                                        <div className='space-y-1'>
                                            <p className='font-bold text-gray-800'>{address.street}</p>
                                            {address.street2 && <p>{address.street2}</p>}
                                            <p>{address.city}, {address.state} - {address.postalCode}</p>
                                            <p className='font-medium text-gray-500 italic mt-2'>Certified & Insured Delivery</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Timeline Display Item */}
                        <div className='pt-6 print:hidden'>
                             <OrderTimeline currentStatus={order.orderStatus} />
                        </div>

                        {/* Items Table */}
                        <div className='space-y-6'>
                            <h3 className='text-sm font-bold text-primary uppercase tracking-widest'>Itemized Breakdown</h3>
                            <div className='overflow-hidden rounded-xl border border-gray-100 shadow-sm'>
                                <table className='w-full'>
                                    <thead>
                                        <tr className='bg-primary text-white text-[10px] sm:text-xs uppercase tracking-[0.1em]'>
                                            <th className='p-4 text-left font-bold'>Sr.</th>
                                            <th className='p-4 text-left font-bold'>Product Description</th>
                                            <th className='p-4 text-center font-bold'>Rate</th>
                                            <th className='p-4 text-center font-bold'>Qty.</th>
                                            <th className='p-4 text-right font-bold'>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className='divide-y divide-gray-100'>
                                        {order.products?.map((item, index) => (
                                            <tr key={item.id} className='group hover:bg-gray-50/50 transition-colors'>
                                                <td className='p-4 text-xs font-bold text-gray-400'>{index + 1}</td>
                                                <td className='p-4'>
                                                    <div className='flex gap-4 items-center'>
                                                        <div className='w-12 h-12 bg-gray-50 rounded border flex-shrink-0 flex items-center justify-center overflow-hidden'>
                                                            {item.media ? <Image src={item.media} width={48} height={48} alt={item.name} className='object-cover w-full h-full' /> : <Package className='text-gray-300' size={18} />}
                                                        </div>
                                                        <div className='min-w-0'>
                                                            <p className='text-sm font-bold text-gray-800 uppercase tracking-tight'>{item.name}</p>
                                                            <p className='text-[10px] text-gray-500 font-medium'>
                                                                {item.purity} • {item.weight}g {item.color && `• ${item.color}`} {item.size && `• Size: ${item.size}`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className='p-4 text-center text-sm font-medium text-gray-600'>
                                                    {Number(item.unitPrice).toLocaleString('en-IN')}
                                                </td>
                                                <td className='p-4 text-center text-sm font-bold text-gray-800'>{item.qty}</td>
                                                <td className='p-4 text-right text-sm font-bold text-gray-900'>
                                                    {Number(item.totalPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Totals Calculation Card */}
                        <div className='flex justify-end pt-6'>
                            <div className='w-full sm:w-80 space-y-4'>
                                <div className='flex justify-between text-sm'>
                                    <span className='font-medium text-gray-500'>Subtotal</span>
                                    <span className='font-bold text-gray-800'>₹{Number(order.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className='flex justify-between text-sm'>
                                    <span className='font-medium text-gray-500'>Shipping & Insurance</span>
                                    <span className='font-bold text-green-600'>FREE</span>
                                </div>
                                <div className='flex justify-between text-sm'>
                                    <span className='font-medium text-gray-500'>GST (Inclusve)</span>
                                    <span className='font-bold text-gray-800'>-</span>
                                </div>
                                <div className='h-px bg-gray-200 my-4'></div>
                                <div className='flex justify-between items-baseline'>
                                    <span className='text-lg font-bold text-gray-900'>Total Paid</span>
                                    <span className='text-3xl font-black text-primary'>
                                        {Number(order.total).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Terms & Footer */}
                        <div className='pt-12 border-t space-y-8'>
                            <div className='grid md:grid-cols-2 gap-8'>
                                <div className='space-y-3'>
                                    <h4 className='text-xs font-bold text-gray-400 uppercase tracking-widest'>Terms & Support</h4>
                                    <div className='space-y-1 text-[11px] text-gray-500 leading-relaxed uppercase font-medium'>
                                        <p>• Computer-generated invoice. No signature required.</p>
                                        <p>• Certified BIS Hallmarked Jewellery.</p>
                                        <p>• For support contact: mkjew@rediffmail.com</p>
                                    </div>
                                </div>
                                <div className='space-y-3 md:text-right'>
                                    <h4 className='text-xs font-bold text-gray-400 uppercase tracking-widest'>Registered Address</h4>
                                    <div className='text-[11px] text-gray-500 leading-relaxed uppercase font-medium'>
                                        <p>Arihant Mall, Main Road,</p>
                                        <p>Ratnagiri, Maharashtra, 415612</p>
                                        <p>India</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className='text-center space-y-4 pt-8'>
                                <div className='flex justify-center gap-6'>
                                    <div className='flex flex-col items-center gap-1 opacity-50'>
                                        <div className='w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center'><CheckCircle size={16} /></div>
                                        <span className='text-[8px] font-bold uppercase'>Authentic</span>
                                    </div>
                                    <div className='flex flex-col items-center gap-1 opacity-50'>
                                        <div className='w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center'><Lock size={16} /></div>
                                        <span className='text-[8px] font-bold uppercase'>Secure</span>
                                    </div>
                                </div>
                                <p className='text-xs font-bold text-gray-300 uppercase tracking-[0.3em]'>M.K. JEWELLERS — SINCE 2004</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Print Hint */}
                <p className='text-center text-gray-400 text-xs mt-8 print:hidden'>
                    Facing issues with the download? Use `Cmd/Ctrl + P` to print this page as a PDF.
                </p>
            </div>
        </div>
    )
}

export default OrderDetailsPage

