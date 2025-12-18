"use client"
import { showToast } from '@/lib/showToast'
import { WEBSITE_LOGIN } from '@/routes/websiteRoutes'
import { logout } from '@/store/reducer/authReducer'
import { DropdownMenuItem } from '@radix-ui/react-dropdown-menu'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import React from 'react'
import { AiOutlineLogout } from 'react-icons/ai'
import { useDispatch } from 'react-redux'

const LogoutButton = () => {
    const dispatch = useDispatch()
    const router = useRouter()
    const handleLogout = async () => {
        try {
            const { data: logoutResponse } = await axios.post('/api/auth/logout')
            if (!logoutResponse.success) {
                throw new Error(logoutResponse.message)
            }
            dispatch(logout())
            showToast('success', logoutResponse.message)
            router.push('/')
        } catch (error) {
            showToast('error', error.message)
        }
    }
    return (
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer w-full">
            <div className='flex items-center justify-start gap-2 p-2'>
                <AiOutlineLogout color='red' />
                Logout
            </div>
        </DropdownMenuItem>
    )
}

export default LogoutButton
