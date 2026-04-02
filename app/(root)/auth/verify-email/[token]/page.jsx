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
  const [isVerified, setisVerified] = useState(null) // null, 'verifying', true, false, 'already-verified'
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(false)
  const verificationStarted = useRef(false)

  // Automatically trigger verification on mount
  useEffect(() => {
    if (token && !verificationStarted.current) {
      verificationStarted.current = true
      handleVerify()
    }
  }, [token])

  const handleVerify = async () => {
    setLoading(true)
    setisVerified('verifying')

    try {
      const { data: VerificationResponse } = await axios.post(
        '/api/auth/verify-email',
        { token }
      )

      if (VerificationResponse.success) {
        const role = VerificationResponse.data.role
        setUserRole(role)
        dispatch(login(VerificationResponse.data))
        
        if (VerificationResponse.data?.isAlreadyVerified) {
          setisVerified('already-verified')
          toast.info("Email is already verified. Redirecting...")
        } else {
          setisVerified(true)
          toast.success("Email verified successfully! Redirecting...")
        }
        
        // Immediate redirect experience
        setTimeout(() => {
          router.push(role === 'admin' ? ADMIN_DASHBOARD : WEBSITE_HOME)
        }, 1500)

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

  return (
    <div className="flex justify-center items-center min-h-[60vh] px-4">
      <Card className="w-full max-w-[400px]">
        <CardContent className="pt-6">
          {(isVerified === null || isVerified === 'verifying' || isVerified === true || isVerified === 'already-verified') ? (
            <div className="flex flex-col justify-center items-center text-gray-600 gap-3 py-10">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p>{(isVerified === true || isVerified === 'already-verified') ? 'Redirecting...' : 'Verifying your email...'}</p>
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
