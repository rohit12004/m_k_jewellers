import React from 'react'
import MainSlider from '@/components/Application/Website/MainSlider'
import banner1 from '@/public/assets/banner1.jpg'
import banner2 from '@/public/assets/banner2.jpg'
import Link from 'next/link'
import Image from 'next/image'
import SubcategoriesSection from '@/components/Application/Website/SubcategoriesSection'
import Editorial from '@/components/Application/Website/Editorial'
import advertisingBanner from '@/public/assets/advertising-banner.jpg'
import designImage from '@/public/assets/deisgn_image.png'

const page = () => {
    return (
        <>
            <section>
                <MainSlider />
            </section>

            <section className='lg:px-32 px-2 sm:px-4 sm:pt-20 pt-5 pb-10'>
                <div className='grid grid-cols-1 sm:grid-cols-2 sm:gap-10 gap-4'>

                    <div className='border rounded-lg overflow-hidden'>
                        <Link href="" >
                            <Image
                                src={banner1}
                                width={banner1.width}
                                height={banner1.height}
                                alt='banner 1'
                                className='transition-all hover:scale-110'
                            />
                        </Link>
                    </div>
                    <div className='border rounded-lg overflow-hidden'>
                        <Link href="" >
                            <Image
                                src={banner2}
                                width={banner2.width}
                                height={banner2.height}
                                alt='banner 2'
                                className='transition-all hover:scale-110'
                            />
                        </Link>
                    </div>

                </div>
            </section>

            <Editorial />

            <SubcategoriesSection />

            <section className='sm:pt-5 pt-5 sm:p-5 p-0'>
                <Image
                    src={designImage}
                    alt="Design"
                    className="w-full h-auto"
                />
            </section>

            <section className='sm:pt-5 pt-5 pb-5 px-0'>
                <Image
                    src={advertisingBanner}
                    alt="Advertisement"
                    className="w-full h-auto"
                />
            </section>

        </>
    )
}

export default page
