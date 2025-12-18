import Image from 'next/image'
import React from 'react'
import logo from '@/public/assets/mk_logo.jpg'
import Link from 'next/link'
import { IoLocationOutline } from "react-icons/io5";
import { MdOutlinePhone } from "react-icons/md";
import { MdOutlineMail } from "react-icons/md";
import { FaInstagram } from "react-icons/fa";
import { FaWhatsapp } from "react-icons/fa";
import { TiSocialFacebookCircular } from "react-icons/ti";
import { FiTwitter } from "react-icons/fi";

import { USER_DASHBOARD, WEBSITE_HOME, WEBSITE_LOGIN, WEBSITE_REGISTER, WEBSITE_SHOP } from '@/routes/websiteRoutes'
const Footer = () => {
    return (
        <footer className='bg-gradient-to-b from-gray-50 to-gray-100 dark:bg-gradient-to-b dark:from-gray-50 dark:to-gray-100 border-t border-gray-200'>
            <div className='grid lg:grid-cols-5 md:grid-cols-2 grid-cols-2 gap-6 md:gap-8 lg:gap-10 py-5 md:py-5 px-6 md:px-8 lg:px-32'>

                <div className='lg:col-span-1 md:col-span-2 col-span-2 flex justify-center lg:justify-start'>
                    <Image
                        src={logo}
                        width={383}
                        height={146}
                        alt='logo'
                        className='w-20 md:w-24 lg:w-28 mb-4 object-contain rounded-full'
                    />
                </div>


                <div>
                    <h4 className='sm:text-lg text-sm font-bold uppercase mb-6 text-gray-800 dark:text-gray-800 relative inline-block after:content-[""] after:absolute after:left-0 after:bottom-0 after:w-12 after:h-0.5 after:bg-primary'>Categories</h4>
                    <ul className='space-y-3'>
                        <li className='text-gray-600 dark:text-gray-600 hover:text-primary transition-colors duration-200'>
                            <Link href={`${WEBSITE_SHOP}?category=gold`} className='flex items-center group'>
                                <span className='w-1.5 h-1.5 bg-gray-400 rounded-full mr-2 group-hover:bg-primary transition-colors'></span>
                                Gold
                            </Link>
                        </li>
                        <li className='text-gray-600 dark:text-gray-600 hover:text-primary transition-colors duration-200'>
                            <Link href={`${WEBSITE_SHOP}?category=silver`} className='flex items-center group'>
                                <span className='w-1.5 h-1.5 bg-gray-400 rounded-full mr-2 group-hover:bg-primary transition-colors'></span>
                                Silver
                            </Link>
                        </li>
                        <li className='text-gray-600 dark:text-gray-600 hover:text-primary transition-colors duration-200'>
                            <Link href={`${WEBSITE_SHOP}?category=diamond`} className='flex items-center group'>
                                <span className='w-1.5 h-1.5 bg-gray-400 rounded-full mr-2 group-hover:bg-primary transition-colors'></span>
                                Diamond
                            </Link>
                        </li>
                    </ul>
                </div>
                <div>
                    <h4 className='sm:text-lg text-sm font-bold uppercase mb-6 text-gray-800 dark:text-gray-800 relative inline-block after:content-[""] after:absolute after:left-0 after:bottom-0 after:w-12 after:h-0.5 after:bg-primary'>Userfull Links</h4>
                    <ul className='space-y-3'>
                        <li className='text-gray-600 dark:text-gray-600 hover:text-primary transition-colors duration-200'>
                            <Link href={WEBSITE_HOME} className='flex items-center group'>
                                <span className='w-1.5 h-1.5 bg-gray-400 rounded-full mr-2 group-hover:bg-primary transition-colors'></span>
                                Home
                            </Link>
                        </li>
                        <li className='text-gray-600 dark:text-gray-600 hover:text-primary transition-colors duration-200'>
                            <Link href={WEBSITE_SHOP} className='flex items-center group'>
                                <span className='w-1.5 h-1.5 bg-gray-400 rounded-full mr-2 group-hover:bg-primary transition-colors'></span>
                                Shop
                            </Link>
                        </li>
                        <li className='text-gray-600 dark:text-gray-600 hover:text-primary transition-colors duration-200'>
                            <Link href="/about-us" className='flex items-center group'>
                                <span className='w-1.5 h-1.5 bg-gray-400 rounded-full mr-2 group-hover:bg-primary transition-colors'></span>
                                About
                            </Link>
                        </li>
                        <li className='text-gray-600 dark:text-gray-600 hover:text-primary transition-colors duration-200'>
                            <Link href={WEBSITE_REGISTER} className='flex items-center group'>
                                <span className='w-1.5 h-1.5 bg-gray-400 rounded-full mr-2 group-hover:bg-primary transition-colors'></span>
                                Register
                            </Link>
                        </li>
                        <li className='text-gray-600 dark:text-gray-600 hover:text-primary transition-colors duration-200'>
                            <Link href={WEBSITE_LOGIN} className='flex items-center group'>
                                <span className='w-1.5 h-1.5 bg-gray-400 rounded-full mr-2 group-hover:bg-primary transition-colors'></span>
                                Login
                            </Link>
                        </li>

                    </ul>
                </div>
                <div>
                    <h4 className='sm:text-lg text-sm font-bold uppercase mb-6 text-gray-800 dark:text-gray-800 relative inline-block after:content-[""] after:absolute after:left-0 after:bottom-0 after:w-12 after:h-0.5 after:bg-primary'>Help Center</h4>
                    <ul className='space-y-3'>
                        <li className='text-gray-600 dark:text-gray-600 hover:text-primary transition-colors duration-200'>
                            <Link href={WEBSITE_REGISTER} className='flex items-center group'>
                                <span className='w-1.5 h-1.5 bg-gray-400 rounded-full mr-2 group-hover:bg-primary transition-colors'></span>
                                Register
                            </Link>
                        </li>
                        <li className='text-gray-600 dark:text-gray-600 hover:text-primary transition-colors duration-200'>
                            <Link href={WEBSITE_LOGIN} className='flex items-center group'>
                                <span className='w-1.5 h-1.5 bg-gray-400 rounded-full mr-2 group-hover:bg-primary transition-colors'></span>
                                Login
                            </Link>
                        </li>
                        <li className='text-gray-600 dark:text-gray-600 hover:text-primary transition-colors duration-200'>
                            <Link href={USER_DASHBOARD} className='flex items-center group'>
                                <span className='w-1.5 h-1.5 bg-gray-400 rounded-full mr-2 group-hover:bg-primary transition-colors'></span>
                                My Account
                            </Link>
                        </li>
                        <li className='text-gray-600 dark:text-gray-600 hover:text-primary transition-colors duration-200'>
                            <Link href="/privacy-policy" className='flex items-center group'>
                                <span className='w-1.5 h-1.5 bg-gray-400 rounded-full mr-2 group-hover:bg-primary transition-colors'></span>
                                Privacy Policy
                            </Link>
                        </li>
                    </ul>
                </div>
                <div>
                    <h4 className='sm:text-lg text-sm font-bold uppercase mb-6 text-gray-800 dark:text-gray-800 relative inline-block after:content-[""] after:absolute after:left-0 after:bottom-0 after:w-12 after:h-0.5 after:bg-primary'>Contact Us </h4>
                    <ul className='space-y-4'>
                        <li className='text-gray-600 dark:text-gray-600 flex gap-3 items-start group'>
                            <IoLocationOutline size={20} className='text-primary mt-0.5 flex-shrink-0' />
                            <span className='text-sm leading-relaxed'>Arihant Mall, Main Road, Ratnagiri, Maharashtra, 415612</span>
                        </li>
                        <li className='text-gray-600 dark:text-gray-600 flex gap-3 items-center group'>
                            <MdOutlinePhone size={20} className='text-primary flex-shrink-0' />
                            <Link href="tel:+91-8569874589" className='hover:text-primary transition-colors text-sm'>+91-9881339944</Link>
                        </li>
                        <li className='text-gray-600 dark:text-gray-600 flex gap-3 items-start group'>
                            <MdOutlineMail size={20} className='text-primary flex-shrink-0 mt-0.5' />
                            <Link href="mailto:support@estore.com" className='hover:text-primary transition-colors text-sm break-all'>mkjew@rediffmail.com</Link>
                        </li>

                    </ul>

                </div>

            </div>
            <div className='flex item-center justify-center gap-4 mb-3'>

                <Link href="" className='w-10 h-10 rounded-full bg-white dark:bg-white shadow-sm flex items-center justify-center hover:text-white transition-all duration-300 hover:shadow-md hover:-translate-y-1'>
                    <FaInstagram className='text-primary group-hover:text-white' size={20} />
                </Link>
                <Link href="https://wa.me/919881339944" target="_blank" rel="noopener noreferrer" className='w-10 h-10 rounded-full bg-white dark:bg-white shadow-sm flex items-center justify-center hover:text-white transition-all duration-300 hover:shadow-md hover:-translate-y-1'>
                    <FaWhatsapp className='text-primary group-hover:text-white' size={20} />
                </Link>

            </div>


            <div className='py-6 bg-gray-800 dark:bg-gray-800 border-t border-gray-700' >
                <p className='text-center text-gray-300 dark:text-gray-300 text-sm'>All Rights Reserved.</p>
            </div>

        </footer>
    )
}

export default Footer