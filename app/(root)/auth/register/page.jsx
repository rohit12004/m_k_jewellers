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
import { WEBSITE_LOGIN } from '@/routes/websiteRoutes'
import axios from 'axios'

// ✅ Import React Toastify
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { showToast } from '@/lib/showToast'

const page = () => {

    const [loading, setLoading] = useState(false)
    const [isTypePassword, setisTypePassword] = useState(true)

    const formSchema = zSchema.pick({
        name: true, email: true, password: true
    }).extend({
        confirmPassword: z.string()
    }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"]
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: ""
        },
    })

    const onRegisterSubmit = async (values) => {
        try {
            setLoading(true)
            const { data: registerResponse } = await axios.post('/api/auth/register', values)

            if (!registerResponse.success) {
                throw new Error(registerResponse.message)
            }

            form.reset()
            showToast('success', registerResponse.message) 
        } catch (error) {
            showToast('error', error.message) 
        } finally {
            setLoading(false)
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
                        Create Account
                    </CardTitle>
                    <CardDescription className="text-blue-700 text-center">
                        Create a new account by filling out the form below.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onRegisterSubmit)}>
                            <div>
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel >Full Name</FormLabel>
                                            <FormControl>
                                                <Input type='text' placeholder="Enter Your Name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div>
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="mt-5">Email</FormLabel>
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
                                <ButtonLoading text='Create Account' type='submit' loading={loading} className='w-full cursor-pointer' />
                            </div>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter>
                    <div className='flex flex-col items-center justify-center'>
                        <div className='flex items-center justify-center gap-2'>
                            <p>Already Have Account ?</p>
                            <Link href={WEBSITE_LOGIN} className='text-primary underline'> Login !</Link>
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}

export default page
