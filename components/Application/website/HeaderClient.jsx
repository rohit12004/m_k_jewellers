'use client'
import { USER_DASHBOARD, WEBSITE_HOME, WEBSITE_LOGIN, WEBSITE_SHOP } from '@/routes/websiteRoutes'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { IoIosSearch } from "react-icons/io";
import { VscAccount } from "react-icons/vsc";
import { useSelector } from 'react-redux'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import userIcon from '@/public/assets/user.png'
import { IoMdClose } from "react-icons/io";
import { HiMiniBars3 } from "react-icons/hi2";
import logo from '@/public/assets/mk_logo.jpg'

const HeaderClient = ({ categories = [] }) => {
    const auth = useSelector(store => store.authStore.auth)
    const [isMobileMenu, setIsMobileMenu] = useState(false)
    const [showSearch, setShowSearch] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <header className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md transition-all duration-300 ${isScrolled ? 'shadow-md' : 'shadow-sm border-b'}`}>
            <div className='lg:px-10 px-4'>
                <div className='flex justify-between items-center lg:py-3 py-4'>
                    {/* Logo */}
                    <Link href={WEBSITE_HOME} className='flex items-center group'>
                        <Image
                            src={logo}
                            width={60}
                            height={60}
                            alt='M&K Jewellers'
                            className='rounded-full ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300'
                            priority
                        />
                    </Link>

                    <div className='flex justify-between gap-20'>
                        {/* Navigation */}
                        <nav className={`lg:relative lg:w-auto lg:h-auto lg:top-0 lg:left-0 lg:p-0 lg:bg-transparent bg-white fixed z-50 top-0 w-full h-screen transition-all duration-300 ${isMobileMenu ? 'left-0' : '-left-full'}`}>

                            {/* Mobile Menu Header */}
                            <div className='lg:hidden flex justify-between items-center bg-gradient-to-r from-primary/5 to-primary/10 py-4 border-b px-4'>
                                <Image
                                    src={logo}
                                    width={50}
                                    height={50}
                                    alt='M&K Jewellers'
                                    className='rounded-full'
                                />
                                <button
                                    type='button'
                                    onClick={() => setIsMobileMenu(false)}
                                    className='p-2 rounded-full hover:bg-white/50 transition-colors'
                                >
                                    <IoMdClose size={24} className='text-gray-600 hover:text-primary transition-colors' />
                                </button>
                            </div>

                            {/* Navigation Links */}
                            <ul className='lg:flex justify-between items-center gap-8 px-4 lg:px-0 pt-4 lg:pt-0'>
                                <li className='group relative'>
                                    <Link
                                        href={WEBSITE_HOME}
                                        className='block py-3 lg:py-2 text-gray-700 hover:text-primary font-medium transition-colors duration-300'
                                        onClick={() => setIsMobileMenu(false)}
                                    >
                                        Home
                                        <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300'></span>
                                    </Link>
                                </li>
                                <li className='group relative'>
                                    <Link
                                        href="/about-us"
                                        className='block py-3 lg:py-2 text-gray-700 hover:text-primary font-medium transition-colors duration-300'
                                        onClick={() => setIsMobileMenu(false)}
                                    >
                                        About
                                        <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300'></span>
                                    </Link>
                                </li>
                                <li className='group relative'>
                                    <Link
                                        href={WEBSITE_SHOP}
                                        className='block py-3 lg:py-2 text-gray-700 hover:text-primary font-medium transition-colors duration-300'
                                        onClick={() => setIsMobileMenu(false)}
                                    >
                                        Shop
                                        <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300'></span>
                                    </Link>
                                </li>

                                {/* Dynamic Categories from Database */}
                                {categories.map((category) => (
                                    <li key={category.id} className='group relative'>
                                        <Link
                                            href={`${WEBSITE_SHOP}?category=${category.slug}`}
                                            className='block py-3 lg:py-2 text-gray-700 hover:text-primary font-medium transition-colors duration-300'
                                            onClick={() => setIsMobileMenu(false)}
                                        >
                                            {category.name}
                                            <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300'></span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>

                        {/* Action Icons */}
                        <div className='flex justify-between items-center gap-6'>
                            {/* Search Icon */}
                            <button
                                type='button'
                                onClick={() => setShowSearch(!showSearch)}
                                className='p-2 rounded-full hover:bg-primary/10 transition-all duration-300 group'
                            >
                                <IoIosSearch
                                    className='text-gray-600 group-hover:text-primary transition-colors duration-300'
                                    size={22}
                                />
                            </button>

                            {/* Account/Avatar */}
                            {!auth ? (
                                <Link
                                    href={WEBSITE_LOGIN}
                                    className='p-2 rounded-full hover:bg-primary/10 transition-all duration-300 group'
                                >
                                    <VscAccount
                                        className='text-gray-600 group-hover:text-primary transition-colors duration-300'
                                        size={22}
                                    />
                                </Link>
                            ) : (
                                <Link
                                    href={USER_DASHBOARD}
                                    className='ring-2 ring-primary/20 hover:ring-primary/40 rounded-full transition-all duration-300'
                                >
                                    <Avatar className='w-9 h-9'>
                                        <AvatarImage src={auth?.avatar?.url || userIcon.src} />
                                    </Avatar>
                                </Link>
                            )}

                            {/* Mobile Menu Toggle */}
                            <button
                                type='button'
                                className='lg:hidden p-2 rounded-full hover:bg-primary/10 transition-all duration-300 group'
                                onClick={() => setIsMobileMenu(true)}
                            >
                                <HiMiniBars3
                                    size={24}
                                    className='text-gray-600 group-hover:text-primary transition-colors duration-300'
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenu && (
                <div
                    className='fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden'
                    onClick={() => setIsMobileMenu(false)}
                />
            )}

            {/* Search Component Placeholder */}
            {/* {showSearch && <Search isShow={showSearch} />} */}
        </header>
    )
}

export default HeaderClient
