'use client'
import { Card, CardContent } from '@/components/ui/card'
import axios from 'axios'
import React, { use, useEffect, useState } from 'react'
import Image from 'next/image'
import verified from '@/public/assets/verified.jpg'
import fail from '@/public/assets/fail.png'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { WEBSITE_HOME } from '@/routes/websiteRoutes'
import { toast } from "react-toastify"

const EmailVerificationLink = ({ params }) => {
  const { token } = use(params)
  const [isVerified, setisVerified] = useState(null) // null = not checked yet

  useEffect(() => {
    const verify = async () => {
      try {
        const { data: VerificationResponse } = await axios.post(
          '/api/auth/verify-email',
          { token }
        )

        if (VerificationResponse.success) {
          setisVerified(true)
          toast.success("Email verified successfully 🎉", {
            autoClose: 4000,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          })
        } else {
          setisVerified(false)
          toast.error("Email verification failed ❌", {
            autoClose: 4000,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          })
        }
      } catch (error) {
        setisVerified(false)
        toast.error("Something went wrong. Please try again later ⚠️", {
          autoClose: 4000,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        })
      }
    }

    verify()
  }, [token])

  return (
    <Card className="w-[400px]">
      <CardContent>
        {isVerified === true ? (
          <div>
            <div className="flex justify-center items-center text-green-800">
              <Image
                src={verified}
                height={verified.height}
                width={verified.width}
                className="h-[100px] w-auto"
                alt="Verification Success"
              />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold mt-2 mb-2">
                Email Verification Successful !!
              </h1>
              <Button asChild>
                <Link href={WEBSITE_HOME}>Continue Shopping</Link>
              </Button>
            </div>
          </div>
        ) : isVerified === false ? (
          <div>
            <div className="flex justify-center items-center text-red-800">
              <Image
                src={fail}
                height={fail.height}
                width={fail.width}
                className="h-[100px] w-auto"
                alt="Verification Failed"
              />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold mt-2 mb-2">
                Email Verification Failed !!
              </h1>
              <Button asChild>
                <Link href={WEBSITE_HOME}>Continue Shopping</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center text-gray-600 gap-3">
            {/* Spinner */}
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p>Verifying your email...</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default EmailVerificationLink
