'use client'
import { USER_DASHBOARD, WEBSITE_HOME, WEBSITE_LOGIN, WEBSITE_SHOP } from '@/routes/websiteRoutes'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { VscAccount } from "react-icons/vsc";
import { UserCheck } from 'lucide-react'
import { useSelector } from 'react-redux'
import { IoMdClose } from "react-icons/io";
import { HiMiniBars3 } from "react-icons/hi2";
import logo from '@/public/assets/mk_logo.jpg'
import Cart from './Cart'
import { useCategories } from '@/hooks/useCategories'

import { useRouter } from 'next/navigation'

const HeaderClient = ({ initialCategories = [] }) => {
    const router = useRouter()
    const auth = useSelector(store => store.authStore.auth)
    const [isMobileMenu, setIsMobileMenu] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)

    // ✅ Use server-fetched categories as initial data - no client-side fetch needed
    const { data: categories = initialCategories } = useCategories(initialCategories)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <header className={`sticky top-0 z-50 bg-transparent backdrop-blur-sm transition-all duration-300 ${isScrolled ? 'shadow- border-b border-grey/20' : 'border-b border-white/20'}`}>
            <div className='lg:px-10 px-4 max-w-full overflow-hidden'>
                <div className='flex justify-between items-center lg:py-3 py-2 px-1 w-full'>
                    {/* Logo */}
                    <Link href={WEBSITE_HOME} className='flex items-center group flex-shrink-0'>
                        <Image
                            src={logo}
                            width={40}
                            height={40}
                            alt='M&K Jewellers'
                            className='rounded-full ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300 md:w-[50px] md:h-[50px]'
                            priority
                        />
                        <span className={`ml-2.5 text-2xl font-bold tracking-tight transition-colors duration-300 ${isScrolled ? 'text-yellow-500 dark:text-gray-700' : 'text-gray-700'}`}>M. K. Jewellers</span>
                    </Link>

                    <div className='flex justify-end items-center lg:gap-20 gap-4 flex-1'>
                        {/* Navigation */}
                        <nav className={`lg:relative lg:w-auto lg:h-auto lg:top-0 lg:left-0 lg:p-0 lg:bg-transparent bg-white dark:bg-white fixed z-50 top-0 w-full h-screen transition-all duration-300 ${isMobileMenu ? 'left-0' : '-left-full'}`}>

                            {/* Mobile Menu Header */}
                            <div className='lg:hidden flex justify-between items-center bg-gradient-to-r from-primary/5 to-primary/10 py-4 border-b px-4'>
                                <div className='flex items-center'>
                                    <Image
                                        src={logo}
                                        width={45}
                                        height={45}
                                        alt='M&K Jewellers'
                                        className='rounded-full ring-2 ring-primary/20'
                                    />
                                    <span className='ml-3 text-2xl font-bold text-gray-800'>M. K. Jewellers</span>
                                </div>
                                <button
                                    type='button'
                                    onClick={() => setIsMobileMenu(false)}
                                    className='p-2 rounded-full hover:bg-white/50 transition-colors'
                                >
                                    <IoMdClose size={24} className='text-gray-600 hover:text-primary transition-colors' />
                                </button>
                            </div>

                            {/* Navigation Links */}
                            <ul className='lg:flex justify-between items-center gap-8 px-4 lg:px-0 pt-4 lg:pt-0 flex flex-col lg:flex-row'>
                                <li className='group relative w-full lg:w-auto border-b border-gray-500 lg:border-none last:border-none'>
                                        <Link
                                            href={WEBSITE_HOME}
                                            className={`block py-1.5 lg:py-2 text-center lg:text-left text-sm lg:text-base ${isScrolled ? 'text-yellow-500 dark:text-gray-700' : 'text-gray-700'} hover:text-primary font-medium transition-colors duration-300`}
                                            onClick={() => setIsMobileMenu(false)}
                                        >
                                        Home
                                        <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300'></span>
                                    </Link>
                                </li>
                                <li className='group relative w-full lg:w-auto border-b border-gray-500 lg:border-none last:border-none'>
                                        <Link
                                            href="/about-us"
                                            className={`block py-1.5 lg:py-2 text-center lg:text-left text-sm lg:text-base ${isScrolled ? 'text-yellow-500 dark:text-gray-700' : 'text-gray-700'} hover:text-primary font-medium transition-colors duration-300`}
                                            onClick={() => setIsMobileMenu(false)}
                                        >
                                        About
                                        <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300'></span>
                                    </Link>
                                </li>
                                <li className='group relative w-full lg:w-auto border-b border-gray-500 lg:border-none last:border-none'>
                                        <Link
                                            href={WEBSITE_SHOP}
                                            className={`block py-1.5 lg:py-2 text-center lg:text-left text-sm lg:text-base ${isScrolled ? 'text-yellow-500 dark:text-gray-700' : 'text-gray-700'} hover:text-primary font-medium transition-colors duration-300`}
                                            onClick={() => setIsMobileMenu(false)}
                                        >
                                        Shop
                                        <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300'></span>
                                    </Link>
                                </li>

                                {/* Dynamic Categories from Database */}
                                {categories.map((category) => (
                                    <li key={category.id} className='group relative w-full lg:w-auto border-b border-gray-500 lg:border-none'>
                                        <Link
                                            href={`${WEBSITE_SHOP}?category=${category.slug}`}
                                            className={`block py-1.5 lg:py-2 text-center lg:text-left text-sm lg:text-base ${isScrolled ? 'text-yellow-500 dark:text-gray-700' : 'text-gray-700'} hover:text-primary font-medium transition-colors duration-300`}
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
                        <div className='flex justify-between items-center lg:gap-6 gap-3'>
                            {/* Cart */}
                            <Cart />

                            {/* Account Icon */}
                            {!auth ? (
                                <div
                                    onClick={() => router.push(WEBSITE_LOGIN)}
                                    className='p-2 rounded-full hover:bg-primary/10 transition-all duration-300 group cursor-pointer'
                                >
                                    <VscAccount
                                        className='text-gray-600 dark:text-gray-600 group-hover:text-primary transition-colors duration-300'
                                        size={22}
                                    />
                                </div>
                            ) : (
                                <Link
                                    href={USER_DASHBOARD}
                                    className='p-2 rounded-full hover:bg-primary/10 transition-all duration-300 group'
                                    title={`Logged in as ${auth?.name}`}
                                >
                                    <UserCheck
                                        className='text-green-600 dark:text-green-600 group-hover:text-primary transition-colors duration-300'
                                        size={25}
                                    />
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
                                    className='text-gray-600 dark:text-gray-600 group-hover:text-primary transition-colors duration-300'
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


        </header>
    )
}

export default HeaderClient