'use client'
import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { showToast } from '@/lib/showToast'
import { logout, login } from '@/store/reducer/authReducer'
import { WEBSITE_LOGIN, WEBSITE_CART, WEBSITE_HOME, API_USER_ORDERS } from '@/routes/websiteRoutes'
import api from '@/lib/api' // Use new API service with auto-refresh
import axios from 'axios' // Keep for non-authenticated calls if needed
import { LogOut, User, Mail, Phone, MapPin, ShoppingCart, LayoutDashboard, Package, ShoppingBag, IndianRupee } from 'lucide-react'
import StatCard from '@/components/Application/Website/StatCard'
import OrdersTable from '@/components/Application/Website/OrdersTable'

const MyAccount = () => {
  const auth = useSelector(store => store.authStore.auth)
  const cart = useSelector(store => store.cartStore)
  const dispatch = useDispatch()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [sessionChecked, setSessionChecked] = useState(false)

  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      street: '',
      street2: '',
      city: '',
      state: '',
      postalCode: ''
    }
  })

  // Fetch user orders using TanStack Query
  const {
    data: ordersResponse,
    isLoading: loadingOrders,
    isError: ordersError,
    refetch: refetchOrders
  } = useQuery({
    queryKey: ['user-orders', auth?.id],
    queryFn: async () => {
      const { data } = await api.get(API_USER_ORDERS) // Use api service with auto-refresh
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch orders')
      }
      return data.data
    },
    enabled: !!auth && sessionChecked, // Only fetch when user is authenticated AND session check is complete
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  })

  const ordersData = ordersResponse || null

  // Handle Authentication & Form Pre-fill
  useEffect(() => {
    if (auth) {
      // Auth exists, mark session as checked and pre-fill form
      console.log('[MyAccount] Auth exists, pre-filling form');
      setSessionChecked(true);

      // Pre-fill form with user data
      setValue('name', auth.name || '')
      setValue('email', auth.email || '')
      setValue('phone', auth.phone || '')

      // Parse address if it exists
      if (auth.address) {
        try {
          const addressData = JSON.parse(auth.address)
          setValue('street', addressData.street || '')
          setValue('street2', addressData.street2 || '')
          setValue('city', addressData.city || '')
          setValue('state', addressData.state || '')
          setValue('postalCode', addressData.postalCode || '')
        } catch (e) {
          // If address is not JSON, treat it as street address
          setValue('street', auth.address || '')
        }
      }
    } else if (!isLoggingOut) {
      // No auth yet - give GlobalProvider time to restore session
      console.log('[MyAccount] No auth, waiting for session restoration...');
      const timer = setTimeout(() => {
        console.log('[MyAccount] Session check timeout complete');
        setSessionChecked(true);
      }, 3000); // 3 seconds to allow for token refresh

      return () => clearTimeout(timer);
    }
  }, [auth, setValue, isLoggingOut])

  // Redirect to login only after session check is complete
  useEffect(() => {
    if (sessionChecked && !auth && !isLoggingOut) {
      console.log('[MyAccount] Session checked, no auth found, redirecting to login');
      router.push(WEBSITE_LOGIN)
    }
  }, [sessionChecked, auth, isLoggingOut, router])

  const onSubmit = async (data) => {
    try {
      setIsLoading(true)

      // Combine address fields into JSON
      const addressData = {
        street: data.street,
        street2: data.street2,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode
      }

      const response = await api.put('/api/user/update-profile', { // Use api service
        name: data.name,
        phone: data.phone,
        address: JSON.stringify(addressData)
      })

      if (response.data.success) {
        // Update auth state with new user data
        dispatch(login(response.data.data))
        showToast('success', 'Profile updated successfully!')
      } else {
        showToast('error', response.data.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      showToast('error', error.response?.data?.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      const { data: logoutResponse } = await api.post('/api/auth/logout') // Use api service
      if (!logoutResponse.success) {
        throw new Error(logoutResponse.message)
      }

      // Clear Redux state (auth is not persisted, so this is all we need)
      dispatch(logout())


      showToast('success', logoutResponse.message)
      router.push(WEBSITE_HOME)
    } catch (error) {
      console.error('Logout error:', error)
      showToast('error', error.message || 'Failed to logout')
      setIsLoggingOut(false)
    }
  }

  if (!auth || isLoggingOut) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-50 py-8 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-6xl mx-auto space-y-6'>
          <Skeleton className='h-12 w-64' />
          <Skeleton className='h-96 w-full' />
        </div>
      </div>
    )
  }

  const cartItemCount = cart.products?.length || 0

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-50 py-8 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6'>
          <div>
            <h1 className='text-xl sm:text-3xl font-bold text-gray-900'>My Account</h1>
            <p className='text-xs sm:text-gray-600 mt-0.5 sm:mt-1'>Manage your account and view your orders</p>
          </div>
          <Button
            variant='outline'
            size="sm"
            onClick={handleLogout}
            className='flex items-center gap-2 cursor-pointer text-xs sm:text-sm'
          >
            <LogOut size={18} />
            Logout
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue='dashboard' className='space-y-6'>
          <TabsList className='grid w-full grid-cols-2 max-w-[280px] sm:max-w-md h-9 sm:h-10'>
            <TabsTrigger value='dashboard' className='cursor-pointer text-xs sm:text-sm px-2'>
              <LayoutDashboard size={16} className='mr-1.5 sm:mr-2' />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value='profile' className='cursor-pointer text-xs sm:text-sm px-2'>
              <User size={16} className='mr-1.5 sm:mr-2' />
              Profile
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value='dashboard' className='space-y-6'>
            {/* Summary Stats */}
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4'>
              <StatCard
                title='Cart Items'
                value={cartItemCount}
                icon={ShoppingCart}
                color='blue'
              />
              <StatCard
                title='Total Orders'
                value={loadingOrders ? '...' : ordersData?.summary?.totalOrders || 0}
                icon={ShoppingBag}
                color='green'
              />
              <StatCard
                title='Items Ordered'
                value={loadingOrders ? '...' : ordersData?.summary?.totalItemsOrdered || 0}
                icon={Package}
                color='purple'
              />
              <StatCard
                title='Total Spent'
                value={loadingOrders ? '...' : `₹${(ordersData?.summary?.totalAmountSpent || 0).toLocaleString('en-IN')}`}
                icon={IndianRupee}
                color='orange'
              />
            </div>

            {/* Orders List */}
            <Card>
              <CardHeader className="p-4 sm:p-6 space-y-0.5 sm:space-y-1.5">
                <CardTitle className="text-lg sm:text-2xl">Order History</CardTitle>
                <CardDescription className="text-xs sm:text-sm">View and manage your orders</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                {loadingOrders ? (
                  <div className='space-y-3'>
                    <Skeleton className='h-12 w-full' />
                    <Skeleton className='h-12 w-full' />
                    <Skeleton className='h-12 w-full' />
                  </div>
                ) : (
                  <OrdersTable orders={ordersData?.orders || []} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value='profile'>
            {/* Info Alert */}
            <div className='bg-blue-50 dark:bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6'>
              <div className='flex items-start gap-2 sm:gap-3'>
                <ShoppingCart className='text-blue-600 mt-0.5 sm:w-5 sm:h-5 shrink-0' size={24} />
                <div>
                  <h2 className='text-sm sm:text-base font-semibold text-blue-900'>Complete Your Profile</h2>
                  <p className='text-[10px] sm:text-sm text-blue-700 mt-0.5 sm:mt-1'>
                    Update your profile details to ensure smooth checkout. After updating, you can return to your cart to complete your purchase.
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <Card>
              <CardHeader className="space-y-0.5 sm:space-y-1.5">
                <CardTitle className='flex items-center gap-2 text-lg sm:text-2xl'>
                  <User size={18} className="sm:w-5 sm:h-5" />
                  Profile Information
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Update your personal details below
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-2 sm:pt-6">
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                  {/* Name */}
                  <div className='space-y-1.5 sm:space-y-2'>
                    <Label htmlFor='name' className='flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold'>
                      <User size={14} className="sm:w-4 sm:h-4" />
                      Full Name *
                    </Label>
                    <Input
                      id='name'
                      type='text'
                      placeholder='Enter your full name'
                      {...register('name', {
                        required: 'Name is required',
                        minLength: { value: 2, message: 'Name must be at least 2 characters' }
                      })}
                      className={`h-9 sm:h-10 text-xs sm:text-sm ${errors.name ? 'border-red-500' : ''}`}
                    />
                    {errors.name && (
                      <p className='text-[10px] sm:text-sm text-red-500 font-medium'>{errors.name.message}</p>
                    )}
                  </div>

                  {/* Email (Read-only) */}
                  <div className='space-y-1.5 sm:space-y-2'>
                    <Label htmlFor='email' className='flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold'>
                      <Mail size={14} className="sm:w-4 sm:h-4" />
                      Email Address
                    </Label>
                    <Input
                      id='email'
                      type='email'
                      {...register('email')}
                      disabled
                      className='bg-gray-100 cursor-not-allowed h-9 sm:h-10 text-xs sm:text-sm'
                    />
                    <p className='text-[10px] sm:text-xs text-gray-500'>Email cannot be changed</p>
                  </div>

                  {/* Phone */}
                  <div className='space-y-1.5 sm:space-y-2'>
                    <Label htmlFor='phone' className='flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold'>
                      <Phone size={14} className="sm:w-4 sm:h-4" />
                      Phone Number *
                    </Label>
                    <Input
                      id='phone'
                      type='tel'
                      placeholder='Enter your phone number'
                      {...register('phone', {
                        required: 'Phone number is required',
                        pattern: {
                          value: /^[0-9]{10}$/,
                          message: 'Please enter a valid 10-digit phone number'
                        }
                      })}
                      className={`h-9 sm:h-10 text-xs sm:text-sm ${errors.phone ? 'border-red-500' : ''}`}
                    />
                    {errors.phone && (
                      <p className='text-[10px] sm:text-sm text-red-500 font-medium'>{errors.phone.message}</p>
                    )}
                  </div>

                  {/* Address Section */}
                  <div className='space-y-3 sm:space-y-4 pt-2'>
                    <Label className='flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base font-bold'>
                      <MapPin size={16} className="sm:w-[18px] sm:h-[18px]" />
                      Delivery Address
                    </Label>

                    {/* Street Address */}
                    <div className='space-y-1.5 sm:space-y-2'>
                      <Label htmlFor='street' className="text-xs sm:text-sm">Street Address *</Label>
                      <Input
                        id='street'
                        type='text'
                        placeholder='House number and street name'
                        {...register('street', {
                          required: 'Street address is required',
                          minLength: { value: 3, message: 'Street address must be at least 3 characters' }
                        })}
                        className={`h-9 sm:h-10 text-xs sm:text-sm ${errors.street ? 'border-red-500' : ''}`}
                      />
                      {errors.street && (
                        <p className='text-[10px] sm:text-sm text-red-500 font-medium'>{errors.street.message}</p>
                      )}
                    </div>

                    {/* Street Address Line 2 */}
                    <div className='space-y-1.5 sm:space-y-2'>
                      <Label htmlFor='street2' className="text-xs sm:text-sm">Street Address Line 2</Label>
                      <Input
                        id='street2'
                        type='text'
                        placeholder='Apartment, suite, unit, etc. (optional)'
                        {...register('street2')}
                        className='h-9 sm:h-10 text-xs sm:text-sm'
                      />
                    </div>

                    {/* City and State */}
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
                      <div className='space-y-1.5 sm:space-y-2'>
                        <Label htmlFor='city' className="text-xs sm:text-sm">City *</Label>
                        <Input
                          id='city'
                          type='text'
                          placeholder='City'
                          {...register('city', {
                            required: 'City is required'
                          })}
                          className={`h-9 sm:h-10 text-xs sm:text-sm ${errors.city ? 'border-red-500' : ''}`}
                        />
                        {errors.city && (
                          <p className='text-[10px] sm:text-sm text-red-500 font-medium'>{errors.city.message}</p>
                        )}
                      </div>

                      <div className='space-y-1.5 sm:space-y-2'>
                        <Label htmlFor='state' className="text-xs sm:text-sm">State / Province *</Label>
                        <Input
                          id='state'
                          type='text'
                          placeholder='State or Province'
                          {...register('state', {
                            required: 'State/Province is required'
                          })}
                          className={`h-9 sm:h-10 text-xs sm:text-sm ${errors.state ? 'border-red-500' : ''}`}
                        />
                        {errors.state && (
                          <p className='text-[10px] sm:text-sm text-red-500 font-medium'>{errors.state.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Postal Code */}
                    <div className='space-y-1.5 sm:space-y-2'>
                      <Label htmlFor='postalCode' className="text-xs sm:text-sm">Postal / Zip Code *</Label>
                      <Input
                        id='postalCode'
                        type='text'
                        placeholder='Postal or Zip Code'
                        {...register('postalCode', {
                          required: 'Postal/Zip code is required',
                          pattern: {
                            value: /^[0-9]{6}$/,
                            message: 'Please enter a valid 6-digit postal code'
                          }
                        })}
                        className={`h-9 sm:h-10 text-xs sm:text-sm ${errors.postalCode ? 'border-red-500' : ''}`}
                      />
                      {errors.postalCode && (
                        <p className='text-[10px] sm:text-sm text-red-500 font-medium'>{errors.postalCode.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className='flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4'>
                    <Button
                      type='submit'
                      disabled={isLoading}
                      className='flex-1 cursor-pointer h-9 sm:h-10 text-xs sm:text-sm'
                    >
                      {isLoading ? 'Updating...' : 'Update Profile'}
                    </Button>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => router.push(WEBSITE_CART)}
                      className='flex-1 cursor-pointer h-9 sm:h-10 text-xs sm:text-sm'
                    >
                      Back to Cart
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default MyAccount
