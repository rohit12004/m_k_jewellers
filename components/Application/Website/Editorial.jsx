'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import editorial1 from '@/public/assets/editorial1.png'
import editorial2 from '@/public/assets/editorial2.png'
import editorial3 from '@/public/assets/editorial3.png'
import editorial4 from '@/public/assets/editorial4.png'
import editorial5 from '@/public/assets/editorial5.png'
import editorial6 from '@/public/assets/editorial6.png'

const Editorial = () => {
    return (
        <section className="pb-8 md:py-12 bg-white dark:bg-gray-950">
            <div className="w-full px-4 md:px-8">
                <div className="text-center mb-8 md:mb-12">
                    <h2 className="text-2xl md:text-6xl font-serif italic text-gray-900 dark:text-gray-100 mb-2 tracking-tight">Editorial</h2>
                    <p className="text-gray-400 dark:text-gray-500 uppercase tracking-[0.4em] text-[8px] md:text-xs font-bold px-4">The Art of Storytelling • MK Jewellers</p>
                </div>                {/* Unified Optimized Grid: 2 columns on mobile, 10 columns on desktop */}
                <div className="grid grid-cols-2 lg:grid-cols-10 lg:grid-rows-2 gap-3 md:gap-4 lg:h-[650px]">
                    
                    {/* 1. Left Portrait - Spans 2 rows on desktop to match central grid height */}
                    <div className="relative group overflow-hidden rounded-xl md:rounded-3xl h-[250px] md:h-[400px] lg:h-full col-span-1 lg:col-span-3 lg:row-span-2">
                        <Image src={editorial1} alt="Editorial 1" fill className="object-cover transition-transform duration-1000 lg:group-hover:scale-105" />
                    </div>

                    {/* 2. Middle Row 1 - Left Square */}
                    <div className="relative group overflow-hidden rounded-xl md:rounded-2xl h-[250px] lg:h-full lg:col-span-2 shadow-sm">
                        <Image src={editorial2} alt="Trending 1" fill className="object-cover transition-transform duration-700 lg:group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/40 hidden lg:flex opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 items-center justify-center">
                            <span className="text-white text-[9px] tracking-[0.2em] font-black border-2 border-white/50 px-4 py-2 rounded-full backdrop-blur-md">TRENDING</span>
                        </div>
                    </div>

                    {/* 3. Middle Row 1 - Right Square */}
                    <div className="relative group overflow-hidden rounded-xl md:rounded-2xl h-[250px] lg:h-full lg:col-span-2 shadow-sm">
                        <Image src={editorial3} alt="Trending 2" fill className="object-cover transition-transform duration-700 lg:group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/40 hidden lg:flex opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 items-center justify-center">
                            <span className="text-white text-[9px] tracking-[0.2em] font-black border-2 border-white/50 px-4 py-2 rounded-full backdrop-blur-md">MUST HAVE</span>
                        </div>
                    </div>

                    {/* 4. Right Portrait - Spans 2 rows on desktop */}
                    <div className="relative group overflow-hidden rounded-xl md:rounded-3xl h-[250px] md:h-[400px] lg:h-full col-span-1 lg:col-span-3 lg:row-span-2 lg:order-none order-2">
                        <Image src={editorial6} alt="Editorial 6" fill className="object-cover transition-transform duration-1000 lg:group-hover:scale-105" />
                    </div>

                    {/* 5. Middle Row 2 - Left Square */}
                    <div className="relative group overflow-hidden rounded-xl md:rounded-2xl h-[250px] lg:h-full lg:col-span-2 shadow-sm">
                        <Image src={editorial4} alt="Trending 3" fill className="object-cover transition-transform duration-700 lg:group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/40 hidden lg:flex opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 items-center justify-center">
                            <span className="text-white text-[9px] tracking-[0.2em] font-black border-2 border-white/50 px-4 py-2 rounded-full backdrop-blur-md">NEW ERA</span>
                        </div>
                    </div>

                    {/* 6. Middle Row 2 - Right Square */}
                    <div className="relative group overflow-hidden rounded-xl md:rounded-2xl h-[250px] lg:h-full lg:col-span-2 shadow-sm">
                        <Image src={editorial5} alt="Trending 4" fill className="object-cover transition-transform duration-700 lg:group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/40 hidden lg:flex opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 items-center justify-center">
                            <span className="text-white text-[9px] tracking-[0.2em] font-black border-2 border-white/50 px-4 py-2 rounded-full backdrop-blur-md">ESSENTIALS</span>
                        </div>
                    </div>

                </div>

                <div className="mt-8 md:mt-10 text-center">
                    <Link 
                        href="/shop" 
                        className="group inline-flex items-center gap-4 px-10 md:px-14 py-4 md:py-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 uppercase tracking-[0.4em] text-[10px] font-black hover:shadow-xl transition-all duration-500 rounded-full"
                    >
                        Explore Shop
                        <div className="w-8 h-[1px] bg-white/30 dark:bg-black/30 group-hover:w-12 transition-all duration-500" />
                    </Link>
                </div>
            </div>
        </section>
    )
}

export default Editorial
