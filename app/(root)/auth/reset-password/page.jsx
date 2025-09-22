'use client'
import OTPVerification from '@/components/Application/OTPVerification'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { showToast } from '@/lib/showToast'
import { zSchema } from '@/lib/zodSchema'
import { WEBSITE_LOGIN } from '@/routes/websiteRoutes'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import mklogo from '@/public/assets/mk_logo.jpg'
import ButtonLoading from '@/components/Application/ButtonLoading'
import Link from 'next/link'
import Image from 'next/image'
import UpdatePassword from '@/components/Application/UpdatePassword'

const ResetPassword = () => {
    const [otpVerificationLoading, setotpVerificationLoading] = useState(false)
    const [emailVerficationLoading, setEmailVerificationLoading] = useState(false)
    const [otpEmail, setOtpEmail] = useState()
    const [isOtpVerified, setisOtpVerified] = useState(false)

    const formSchema = zSchema.pick({
        email: true
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: ''
        }
    })

    const handleEmailVerification = async (values) => {
        try {
            setEmailVerificationLoading(true)
            const { data: sendOtpResponse } = await axios.post('/api/auth/reset-password/send-otp', values)

            if (!sendOtpResponse.success) {
                throw new Error(sendOtpResponse.message)
            }

            setOtpEmail(values.email)
            showToast('success', sendOtpResponse.message)
        } catch (error) {
            showToast('error', error.message)
        } finally {
            setEmailVerificationLoading(false)
        }
    }

    const handleOtpVerification = async (values) => {
        try {
            setotpVerificationLoading(true)
            const { data: otpResponse } = await axios.post('/api/auth/reset-password/verify-otp', values)

            if (!otpResponse.success) {
                throw new Error(otpResponse.message)
            }

            showToast('success', otpResponse.message)
            setisOtpVerified(true)
        } catch (error) {
            showToast('error', error.message)
        } finally {
            setotpVerificationLoading(false)
        }
    }

    return (
        <div>
            <Card className='w-[450px]'>
                {/* ✅ Show Reset Password header only when otpEmail is NOT set */}
                {!otpEmail && (
                    <CardHeader className="flex flex-col items-center">
                        <div className='flex justify-center items-center gap-5'>
                            <Image
                                src={mklogo}
                                width={100}
                                height={100}
                                alt="mklogo"
                                className="rounded-full"
                            />
                            <h1 className="text-2xl font-bold">M.K. JEWELLER'S</h1>
                        </div>
                        <CardTitle className="mt-3 font-bold text-2xl text-center">
                            Reset Password
                        </CardTitle>
                        <CardDescription className="text-blue-700 text-center">
                            Enter your email for password reset.
                        </CardDescription>
                    </CardHeader>
                )}

                {/* ✅ Step 1: Enter Email */}
                {!otpEmail && (
                    <>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleEmailVerification)}>
                                    <div>
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl>
                                                        <Input type='email' placeholder="example@email.com" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className='mt-5'>
                                        <ButtonLoading
                                            text='Send OTP'
                                            type='submit'
                                            loading={emailVerficationLoading}
                                            className='w-full cursor-pointer'
                                        />
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                        <CardFooter>
                            <div className='flex flex-col items-center justify-center'>
                                <div className='flex items-center justify-center gap-2'>
                                    <Link href={WEBSITE_LOGIN} className='text-primary underline'>
                                        Back To Login
                                    </Link>
                                </div>
                            </div>
                        </CardFooter>
                    </>
                )}

                {/* ✅ Step 2: OTP Verification */}
                {otpEmail && !isOtpVerified && (
                    <CardContent>
                        <OTPVerification
                            email={otpEmail}
                            onSubmit={handleOtpVerification}
                            loading={otpVerificationLoading}
                        />
                    </CardContent>
                )}

                {/* ✅ Step 3: Update Password */}
                {otpEmail && isOtpVerified && (
                    <CardContent>
                        <UpdatePassword email={otpEmail} />
                    </CardContent>
                )}
            </Card>
        </div>
    )
}

export default ResetPassword
