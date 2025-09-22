import { zSchema } from '@/lib/zodSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import ButtonLoading from './ButtonLoading'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '../ui/input-otp'
import { showToast } from '@/lib/showToast'
import axios from 'axios'

const OTPVerification = ({ email, onSubmit, loading }) => {

    const [isResendingOtp, setisResendingOtp] = useState(false)

    const formSchema = zSchema.pick({
        otp: true, email: true
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            otp: '',
            email: email
        }
    })

    const onOTPSubmit = async (values) => {
        onSubmit(values)
    }

    const resendOTP = async () => {
        try {
            setisResendingOtp(true)
            const { data: resendOtpResponse } = await axios.post('/api/auth/resend-otp', { email })

            if (!resendOtpResponse.success) {
                throw new Error(resendOtpResponse.message)
            }

            showToast('success', resendOtpResponse.message)
        } catch (error) {
            showToast('error', error.message)
        } finally {
            setisResendingOtp(false)
        }
    }

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onOTPSubmit)}>
                    <div className="text-center">
                        <h1 className="text-xl font-bold">Please Complete Verification.</h1>
                        <p className="text-md">
                            We have sent a One-time Password (OTP) to your registered email address.
                            The OTP is valid for 10 minutes only.
                        </p>
                    </div>

                    <div className="mt-5">
                        <FormField
                            control={form.control}
                            name="otp"
                            render={({ field }) => (
                                <FormItem>
                                    <div className='flex justify-center items-center'>
                                        <FormLabel className="font-semibold">One-time Password</FormLabel>
                                    </div>
                                    <FormControl>
                                        {/* ✅ Center the OTP fields */}
                                        <div className="flex justify-center">
                                            <InputOTP maxLength={6} {...field}>
                                                <InputOTPGroup>
                                                    <InputOTPSlot className="text-xl size-10" index={0} />
                                                    <InputOTPSlot className="text-xl size-10" index={1} />
                                                    <InputOTPSlot className="text-xl size-10" index={2} />
                                                    <InputOTPSlot className="text-xl size-10" index={3} />
                                                    <InputOTPSlot className="text-xl size-10" index={4} />
                                                    <InputOTPSlot className="text-xl size-10" index={5} />
                                                </InputOTPGroup>
                                            </InputOTP>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="mt-5 text-center">
                        <ButtonLoading
                            text="Verify"
                            type="submit"
                            loading={loading}
                            className="w-1/2 cursor-pointer"
                        />
                        <div className="text-center mt-5">
                            {!isResendingOtp ? (
                                <button
                                    onClick={resendOTP}
                                    type="button"
                                    className="text-blue-700 cursor-pointer hover:underline"
                                >
                                    Resend OTP
                                </button>
                            ) : (
                                <span className="text-md">Resending OTP.....</span>
                            )}
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default OTPVerification
