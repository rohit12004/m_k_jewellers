'use client'
import { USER_DASHBOARD, WEBSITE_HOME, WEBSITE_LOGIN, WEBSITE_SHOP } from '@/routes/websiteRoutes'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { IoIosSearch } from "react-icons/io";
import { VscAccount } from "react-icons/vsc";
import { useSelector } from 'react-redux'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import userIcon from '@/public/assets/user.png'
import { IoMdClose } from "react-icons/io";
import { HiMiniBars3 } from "react-icons/hi2";
import logo from '@/public/assets/mk_logo.jpg'


const Header = () => {
    const auth = useSelector(store => store.authStore.auth)
    const [isMobileMenu, setIsMobileMenu] = useState(false)
    const [showSearch, setShowSearch] = useState(false)
    return (
        <div className='bg-white border-b lg:px-10 px-4'>
            <div className='flex justify-between items-center lg:py-2 py-3'>
                <Link href={WEBSITE_HOME}>
                    <Image
                        src={logo}
                        width={383}
                        height={146}
                        alt='logo'
                        className='lg:w-15 w-15 rounded-full'
                    />
                </Link>

                <div className='flex justify-between gap-20'>
                    <nav className={`lg:relative lg:w-auto lg:h-auto lg:top-0 lg:left-0 lg:p-0 bg-white fixed z-50 top-0 w-full h-screen transition-all ${isMobileMenu ? 'left-0' : '-left-full'}`}>


                        <div className='lg:hidden flex justify-between items-center bg-gray-50 py-3 border-b px-3'>

                            <Image
                                src={logo}
                                width={383}
                                height={146}
                                alt='logo'
                                className='lg:w-15 w-15 rounded-full'
                            />

                            <button type='button' onClick={() => setIsMobileMenu(false)} >
                                <IoMdClose size={25} className='text-gray-500 hover:text-primary' />
                            </button>

                        </div>


                        <ul className='lg:flex justify-between items-center gap-10 px-3 '>
                            <li className='text-gray-600 hover:text-primary hover:font-semibold'>
                                <Link href={WEBSITE_HOME} className='block py-2'>
                                    Home
                                </Link>
                            </li>
                            <li className='text-gray-600 hover:text-primary hover:font-semibold'>
                                <Link href="/about-us" className='block py-2'>
                                    About
                                </Link>
                            </li>
                            <li className='text-gray-600 hover:text-primary hover:font-semibold'>
                                <Link href={WEBSITE_SHOP} className='block py-2'>
                                    Shop
                                </Link>
                            </li>
                            <li className='text-gray-600 hover:text-primary hover:font-semibold'>
                                <Link href={`${WEBSITE_SHOP}?category=t-shirts`} className='block py-2'>
                                    Gold
                                </Link>
                            </li>
                            <li className='text-gray-600 hover:text-primary hover:font-semibold'>
                                <Link href={`${WEBSITE_SHOP}?category=hoodies`} className='block py-2'>
                                    Silver
                                </Link>
                            </li>
                            <li className='text-gray-600 hover:text-primary hover:font-semibold'>
                                <Link href={`${WEBSITE_SHOP}?category=overshized`} className='block py-2'>
                                    Other
                                </Link>
                            </li>
                        </ul>
                    </nav>


                    <div className='flex justify-between items-center gap-8'>
                        <button type='button' onClick={() => setShowSearch(!showSearch)}>
                            <IoIosSearch
                                className='text-gray-500 hover:text-primary cursor-pointer'
                                size={25}
                            />
                        </button>

                        {/* <Cart /> */}

                        {!auth
                            ?
                            <Link href={WEBSITE_LOGIN}>
                                <VscAccount
                                    className='text-gray-500 hover:text-primary cursor-pointer'
                                    size={25}
                                />
                            </Link>
                            :

                            <Link href={USER_DASHBOARD}>
                                <Avatar >
                                    <AvatarImage src={auth?.avatar?.url || userIcon.src} />
                                </Avatar>
                            </Link>

                        }


                        <button type='button' className='lg:hidden block' onClick={() => setIsMobileMenu(true)} >
                            <HiMiniBars3 size={25} className='text-gray-500 hover:text-primary' />
                        </button>

                    </div>

                </div>

            </div>

            {/* <Search isShow={showSearch} /> */}

        </div>
    )
}

export default Header