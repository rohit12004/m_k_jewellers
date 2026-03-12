'use client'
import { Card, CardContent } from '@/components/ui/card'
import axios from 'axios'
import React, { use, useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import verified from '@/public/assets/verified.jpg'
import fail from '@/public/assets/fail.png'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { WEBSITE_HOME } from '@/routes/websiteRoutes'
import { ADMIN_DASHBOARD } from '@/routes/adminPanelRoutes'
import { toast } from "react-toastify"
import { useDispatch } from 'react-redux'
import { login } from '@/store/reducer/authReducer'
import { useRouter } from 'next/navigation'

const EmailVerificationLink = ({ params }) => {
  const { token } = use(params)
  const dispatch = useDispatch()
  const router = useRouter()
  const [isVerified, setisVerified] = useState(null) // null = initial, 'verifying', true, false, 'already-verified'
  const [userRole, setUserRole] = useState(null)
  const [sessionToken, setSessionToken] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleVerify = async () => {
    if (loading || isVerified !== null) return
    
    setLoading(true)
    setisVerified('verifying')

    try {
      const { data: VerificationResponse } = await axios.post(
        '/api/auth/verify-email',
        { token }
      )

      if (VerificationResponse.success) {
        if (VerificationResponse.data?.isAlreadyVerified) {
          setisVerified('already-verified')
          toast.info("Email is already verified. Please login.")
        } else {
          setisVerified(true)
          setUserRole(VerificationResponse.data.role)
          if (VerificationResponse.data.token) {
            setSessionToken(VerificationResponse.data.token)
          }
          dispatch(login(VerificationResponse.data))
          toast.success("Email verified successfully! You are now logged in 🎉")
        }
      } else {
        setisVerified(false)
        toast.error("Email verification failed ❌")
      }
    } catch (error) {
      setisVerified(false)
      toast.error("Something went wrong. Please try again later ⚠️")
    } finally {
      setLoading(false)
    }
  }

  const deepLink = sessionToken ? `mobile://auth-callback?token=${sessionToken}` : null;

  return (
    <div className="flex justify-center items-center min-h-[60vh] px-4">
      <Card className="w-full max-w-[400px]">
        <CardContent className="pt-6">
          {isVerified === null ? (
            <div className="text-center py-4">
              <h1 className="text-2xl font-bold mb-4">Verify Your Email</h1>
              <p className="text-gray-600 mb-6">Click the button below to complete your registration and log in.</p>
              <Button onClick={handleVerify} className="w-full" size="lg">
                Verify Email Now
              </Button>
            </div>
          ) : isVerified === 'verifying' ? (
            <div className="flex flex-col justify-center items-center text-gray-600 gap-3 py-10">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p>Verifying your email...</p>
            </div>
          ) : isVerified === true ? (
            <div className="text-center">
              <div className="flex justify-center items-center mb-4">
                <Image
                  src={verified}
                  height={100}
                  width={100}
                  className="h-[100px] w-auto"
                  alt="Verification Success"
                />
              </div>
              <h1 className="text-2xl font-bold mb-4">Email Verified Successfully!</h1>
              <div className="flex flex-col gap-3">
                <Button asChild className="w-full">
                  <Link href={userRole === 'admin' ? ADMIN_DASHBOARD : WEBSITE_HOME}>
                    Continue to {userRole === 'admin' ? 'Dashboard' : 'Shopping'}
                  </Link>
                </Button>
                {deepLink && (
                  <Button variant="outline" asChild className="w-full border-blue-500 text-blue-600 hover:bg-blue-50">
                    <a href={deepLink}>Open in Mobile App</a>
                  </Button>
                )}
              </div>
            </div>
          ) : isVerified === 'already-verified' ? (
            <div className="text-center">
              <div className="flex justify-center items-center mb-4">
                <Image
                  src={verified}
                  height={100}
                  width={100}
                  className="h-[100px] w-auto"
                  alt="Already Verified"
                />
              </div>
              <h1 className="text-2xl font-bold mb-4">Email Already Verified</h1>
              <Button asChild className="w-full">
                <Link href={WEBSITE_HOME}>Go to Home</Link>
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <div className="flex justify-center items-center mb-4">
                <Image
                  src={fail}
                  height={100}
                  width={100}
                  className="h-[100px] w-auto"
                  alt="Verification Failed"
                />
              </div>
              <h1 className="text-2xl font-bold mb-4">Verification Failed</h1>
              <p className="text-gray-600 mb-6">The link might be expired or invalid.</p>
              <Button asChild className="w-full">
                <Link href={WEBSITE_HOME}>Return to Website</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default EmailVerificationLink
