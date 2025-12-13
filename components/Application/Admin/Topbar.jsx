"use client"
import React from 'react'
import ThemeSwitch from './ThemeSwitch'
import UserDropdown from './UserDropdown'
import { Button } from '@/components/ui/button'
import { RiMenu4Fill } from 'react-icons/ri'
import { useSidebar } from '@/components/ui/sidebar'
import AdminSearch from './AdminSearch'
import Image from 'next/image'
import AdminMobileSearch from './AdminMobileSearch'

const Topbar = () => {
    const {toggleSidebar} = useSidebar()
    return (
        <div className='fixed border h-16 w-full top-0 left-0 z-30 md:pl-72 md:pr-10 px-8 flex justify-between items-center bg-yellow-400 dark:bg-card'>
            
            <div className='md:block hidden'>
                <AdminSearch />
            </div>
            <div className='flex items-center gap-2'>
                <UserDropdown />
                <AdminMobileSearch/>
                <ThemeSwitch />
                <Button onClick={toggleSidebar} type='button' size="icon" className="ms-2 md:hidden">
                    <RiMenu4Fill />
                </Button>
            </div>
        </div>
    )
}

export default Topbar
