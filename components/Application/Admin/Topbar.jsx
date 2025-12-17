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
import mklogo from '@/public/assets/mk_logo.jpg'

const Topbar = () => {
    const { toggleSidebar } = useSidebar()
    return (
        <div className='fixed border h-16 w-full top-0 left-0 z-30 md:ps-64 md:pe-8 px-5 flex justify-between items-center gap-4 bg-yellow-400 dark:bg-card'>

            <div className='flex items-center md:hidden'>
                <Image src={mklogo.src} height={50} width={50} className="h-[50px] w-[50px] rounded-full" alt="M.K. Jewellers" />
            </div>

            <div className='md:block hidden flex-1 max-w-2xl ml-64'>
                <AdminSearch />
            </div>

            <div className='flex items-center gap-2 flex-shrink-0'>
                <AdminMobileSearch />
                <ThemeSwitch />
                <UserDropdown />
                <Button onClick={toggleSidebar} type='button' size="icon" className="ms-2 md:hidden">
                    <RiMenu4Fill />
                </Button>
            </div>
        </div>
    )
}

export default Topbar
