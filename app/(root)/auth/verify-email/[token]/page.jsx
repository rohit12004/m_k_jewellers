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
  const [isVerified, setisVerified] = useState(null) // null = not checked yet
  const [userRole, setUserRole] = useState(null)
  const hasVerified = useRef(false) // Prevent duplicate verification

  useEffect(() => {
    // Prevent duplicate verification in React Strict Mode
    if (hasVerified.current) return

    const verify = async () => {
      hasVerified.current = true

      try {
        const { data: VerificationResponse } = await axios.post(
          '/api/auth/verify-email',
          { token }
        )

        if (VerificationResponse.success) {
          setisVerified(true)
          setUserRole(VerificationResponse.data.role)

          // Dispatch login action to update Redux store
          dispatch(login(VerificationResponse.data))

          toast.success("Email verified successfully! You are now logged in 🎉", {
            autoClose: 4000,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          })

          // Redirect after 2 seconds
          setTimeout(() => {
            if (VerificationResponse.data.role === 'admin') {
              router.push(ADMIN_DASHBOARD)
            } else {
              router.push(WEBSITE_HOME)
            }
          }, 2000)
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
  }, [token, dispatch, router])

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
                Email Verified Successfully!
              </h1>
              <p className="text-sm text-gray-600 mb-4">
                You are now logged in. Redirecting to {userRole === 'admin' ? 'dashboard' : 'homepage'}...
              </p>
              <Button asChild>
                <Link href={userRole === 'admin' ? ADMIN_DASHBOARD : WEBSITE_HOME}>
                  Continue to {userRole === 'admin' ? 'Dashboard' : 'Shopping'}
                </Link>
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
