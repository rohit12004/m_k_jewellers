"use client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import Image from 'next/image'
import React from 'react'
import mklogo from '@/public/assets/mk_logo.jpg'
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
import { zSchema } from '@/lib/zodSchema'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import ButtonLoading from '@/components/Application/ButtonLoading'
import { useState } from 'react'
import { FaEyeSlash } from "react-icons/fa";
import { IoMdEye } from "react-icons/io";
import Link from 'next/link'
import { USER_DASHBOARD, WEBSITE_REGISTER, WEBSITE_RESETPASSWORD } from '@/routes/websiteRoutes'
import { showToast } from '@/lib/showToast'
import axios from 'axios'
import OTPVerification from '@/components/Application/OTPVerification'
import { useDispatch } from 'react-redux'
import { login } from '@/store/reducer/authReducer'
import { useRouter, useSearchParams } from 'next/navigation'
import { ADMIN_DASHBOARD } from '@/routes/adminPanelRoutes'

const page = () => {
    const dispatch = useDispatch()
    const searchParams = useSearchParams()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [otpVerificationLoading, setotpVerificationLoading] = useState(false)
    const [isTypePassword, setisTypePassword] = useState(true)
    const [otpEmail, setOtpEmail] = useState()

    const formSchema = zSchema.pick({
        email: true
    }).extend({ password: z.string().min(3, { message: "Password is required" }) })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: ""
        },
    })

    const onLoginSubmit = async (values) => {
        try {
            setLoading(true)
            const { data: loginResponse } = await axios.post('/api/auth/login', values)

            if (!loginResponse.success) {
                throw new Error(loginResponse.message)
            }

            setOtpEmail(values.email)
            form.reset()
            showToast('success', loginResponse.message)
        } catch (error) {
            showToast('error', error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleOtpVerification = async (values) => {
        try {
            setotpVerificationLoading(true)
            const { data: otpResponse } = await axios.post('/api/auth/verify-otp', values)

            if (!otpResponse.success) {
                throw new Error(otpResponse.message)
            }

            setOtpEmail()
            showToast('success', otpResponse.message)

            dispatch(login(otpResponse.data))
            if(searchParams.has('callback')){
                router.push(searchParams.get('callback'))
            }else{
                otpResponse.data.role === 'admin' ? router.push(ADMIN_DASHBOARD) : router.push(USER_DASHBOARD)
            }
        } catch (error) {
            showToast('error', error.message)
        } finally {
            setotpVerificationLoading(false)
        }
    }

    return (
        <div>
            <Card className='w-[450px]'>
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
                        Login Into Account
                    </CardTitle>
                    <CardDescription className="text-blue-700 text-center">
                        Login into your account by filling out the form below.
                    </CardDescription>
                </CardHeader>
                {!otpEmail ?
                    <>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onLoginSubmit)}>
                                    <div>
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel >Email</FormLabel>
                                                    <FormControl>
                                                        <Input type='email' placeholder="example@email.com" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div>
                                        <FormField
                                            control={form.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem className='relative'>
                                                    <FormLabel className='mt-5'>Password</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input
                                                                type={isTypePassword ? 'password' : 'text'}
                                                                placeholder="Enter password"
                                                                {...field}
                                                                className="pr-10" // add padding so text doesn't overlap the icon
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setisTypePassword(!isTypePassword)}
                                                                className="absolute inset-y-0 right-3 flex items-center"
                                                            >
                                                                {isTypePassword ? <FaEyeSlash /> : <IoMdEye />}
                                                            </button>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className='mt-5'>
                                        <ButtonLoading text='Login' type='submit' loading={loading} className='w-full cursor-pointer' />
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                        <CardFooter>
                            <div className='flex flex-col items-center justify-center'>
                                <div className='flex items-center justify-center gap-2'>
                                    <p>Don't Have Account ?</p>
                                    <Link href={WEBSITE_REGISTER} className='text-primary underline'> Create Account !</Link>
                                </div>
                                <div>
                                    <Link href={WEBSITE_RESETPASSWORD} className='text-primary underline'> Forget Passowrd ?</Link>
                                </div>
                            </div>
                        </CardFooter>
                    </>
                    :
                    <>
                        
                        <OTPVerification email={otpEmail} onSubmit={handleOtpVerification} loading={otpVerificationLoading} />
                    </>}

            </Card>
        </div>
    )
}

export default page
