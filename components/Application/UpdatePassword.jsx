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

import axios from 'axios'

// ✅ Import React Toastify
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { showToast } from '@/lib/showToast'
import { useRouter } from 'next/navigation'
import { WEBSITE_LOGIN } from '@/routes/websiteRoutes'

const UpdatePassword = ({email}) => {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [isTypePassword, setisTypePassword] = useState(true)

    const formSchema = zSchema.pick({
        email: true,
        password: true
    }).extend({
        confirmPassword: z.string()
    }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"]
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: email,
            password: "",
            confirmPassword: ""
        },
    })

    const handlePasswordUpdate = async (values) => {
        try {
            setLoading(true)
            const { data: passwordUpdate } = await axios.put('/api/auth/reset-password/update-password', values)

            if (!passwordUpdate.success) {
                throw new Error(passwordUpdate.message)
            }

            form.reset()
            showToast('success', passwordUpdate.message)
            router.push(WEBSITE_LOGIN)
        } catch (error) {
            showToast('error', error.message)
        } finally {
            setLoading(false)
        }
    }
    return (
        <div>
            <div>
                <CardHeader className="flex flex-col items-center">
                    
                    <CardTitle className="mt-3 font-bold text-2xl text-center">
                        Update password
                    </CardTitle>
                    <CardDescription className="text-blue-700 text-center">
                        Create new password for your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handlePasswordUpdate)}>
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
                                                        type="password"
                                                        placeholder="Enter password"
                                                        {...field}
                                                        className="pr-10"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div>
                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem className='relative'>
                                            <FormLabel className='mt-5'>Confirm Password</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type={isTypePassword ? 'password' : 'text'}
                                                        placeholder="Enter password"
                                                        {...field}
                                                        className="pr-10"
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
                                <ButtonLoading text='Update Password' type='submit' loading={loading} className='w-full cursor-pointer' />
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </div>
        </div>
    )
}

export default UpdatePassword
