'use client'
import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { showToast } from '@/lib/showToast'
import { logout, login } from '@/store/reducer/authReducer'
import { WEBSITE_LOGIN, WEBSITE_CART, WEBSITE_HOME } from '@/routes/websiteRoutes'
import axios from 'axios'
import { LogOut, User, Mail, Phone, MapPin, ShoppingCart } from 'lucide-react'

const MyAccount = () => {
  const auth = useSelector(store => store.authStore.auth)
  const dispatch = useDispatch()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

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

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!auth && !isLoggingOut) {
      router.push(WEBSITE_LOGIN)
    } else if (auth) {
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
    }
  }, [auth, router, setValue, isLoggingOut])

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

      const response = await axios.put('/api/user/update-profile', {
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
      const { data: logoutResponse } = await axios.post('/api/auth/logout')
      if (!logoutResponse.success) {
        throw new Error(logoutResponse.message)
      }
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
        <div className='max-w-3xl mx-auto space-y-6'>
          <Skeleton className='h-12 w-64' />
          <Skeleton className='h-96 w-full' />
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-50 py-8 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-3xl mx-auto'>
        {/* Header */}
        <div className='flex justify-between items-center mb-6'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 dark:text-gray-900'>My Account</h1>
            <p className='text-gray-600 dark:text-gray-600 mt-1'>Manage your profile information</p>
          </div>
          <Button
            variant='outline'
            onClick={handleLogout}
            className='flex items-center gap-2 cursor-pointer'
          >
            <LogOut size={18} />
            Logout
          </Button>
        </div>

        {/* Info Alert */}
        <div className='bg-blue-50 dark:bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
          <div className='flex items-start gap-3'>
            <ShoppingCart className='text-blue-600 mt-0.5' size={20} />
            <div>
              <h3 className='font-semibold text-blue-900 dark:text-blue-900'>Complete Your Profile</h3>
              <p className='text-sm text-blue-700 dark:text-blue-700 mt-1'>
                Update your profile details to ensure smooth checkout. After updating, you can return to your cart to complete your purchase.
              </p>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <User size={20} />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal details below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
              {/* Name */}
              <div className='space-y-2'>
                <Label htmlFor='name' className='flex items-center gap-2'>
                  <User size={16} />
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
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className='text-sm text-red-500'>{errors.name.message}</p>
                )}
              </div>

              {/* Email (Read-only) */}
              <div className='space-y-2'>
                <Label htmlFor='email' className='flex items-center gap-2'>
                  <Mail size={16} />
                  Email Address
                </Label>
                <Input
                  id='email'
                  type='email'
                  {...register('email')}
                  disabled
                  className='bg-gray-100 dark:bg-gray-100 cursor-not-allowed'
                />
                <p className='text-xs text-gray-500 dark:text-gray-500'>Email cannot be changed</p>
              </div>

              {/* Phone */}
              <div className='space-y-2'>
                <Label htmlFor='phone' className='flex items-center gap-2'>
                  <Phone size={16} />
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
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className='text-sm text-red-500'>{errors.phone.message}</p>
                )}
              </div>

              {/* Address Section */}
              <div className='space-y-4'>
                <Label className='flex items-center gap-2 text-base font-semibold'>
                  <MapPin size={18} />
                  Delivery Address
                </Label>

                {/* Street Address */}
                <div className='space-y-2'>
                  <Label htmlFor='street'>Street Address *</Label>
                  <Input
                    id='street'
                    type='text'
                    placeholder='House number and street name'
                    {...register('street', {
                      required: 'Street address is required',
                      minLength: { value: 3, message: 'Street address must be at least 3 characters' }
                    })}
                    className={errors.street ? 'border-red-500' : ''}
                  />
                  {errors.street && (
                    <p className='text-sm text-red-500'>{errors.street.message}</p>
                  )}
                </div>

                {/* Street Address Line 2 */}
                <div className='space-y-2'>
                  <Label htmlFor='street2'>Street Address Line 2</Label>
                  <Input
                    id='street2'
                    type='text'
                    placeholder='Apartment, suite, unit, etc. (optional)'
                    {...register('street2')}
                  />
                </div>

                {/* City and State */}
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='city'>City *</Label>
                    <Input
                      id='city'
                      type='text'
                      placeholder='City'
                      {...register('city', {
                        required: 'City is required'
                      })}
                      className={errors.city ? 'border-red-500' : ''}
                    />
                    {errors.city && (
                      <p className='text-sm text-red-500'>{errors.city.message}</p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='state'>State / Province *</Label>
                    <Input
                      id='state'
                      type='text'
                      placeholder='State or Province'
                      {...register('state', {
                        required: 'State/Province is required'
                      })}
                      className={errors.state ? 'border-red-500' : ''}
                    />
                    {errors.state && (
                      <p className='text-sm text-red-500'>{errors.state.message}</p>
                    )}
                  </div>
                </div>

                {/* Postal Code */}
                <div className='space-y-2'>
                  <Label htmlFor='postalCode'>Postal / Zip Code *</Label>
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
                    className={errors.postalCode ? 'border-red-500' : ''}
                  />
                  {errors.postalCode && (
                    <p className='text-sm text-red-500'>{errors.postalCode.message}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className='flex gap-3 pt-4'>
                <Button
                  type='submit'
                  disabled={isLoading}
                  className='flex-1 cursor-pointer'
                >
                  {isLoading ? 'Updating...' : 'Update Profile'}
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => router.push(WEBSITE_CART)}
                  className='flex-1 cursor-pointer'
                >
                  Back to Cart
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default MyAccount
