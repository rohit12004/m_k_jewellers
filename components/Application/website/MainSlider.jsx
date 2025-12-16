'use client'
import React from 'react'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";

import slider1 from '@/public/assets/slider1.jpg'
import slider2 from '@/public/assets/slider2.jpg'
import slider3 from '@/public/assets/slider3.jpg'
import slider4 from '@/public/assets/slider4.jpg'
import Image from 'next/image';
import { LuChevronRight } from "react-icons/lu";
import { LuChevronLeft } from "react-icons/lu";


const ArrowNext = (props) => {
    const { onClick } = props
    return (
        <button onClick={onClick} type='button' className='w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 flex justify-center items-center rounded-full absolute z-10 top-1/2 -translate-y-1/2 bg-white right-2 sm:right-4 lg:right-10' >
            <LuChevronRight className='text-gray-600 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6' />
        </button>
    )
}
const ArrowPrev = (props) => {
    const { onClick } = props
    return (
        <button onClick={onClick} type='button' className='w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 flex justify-center items-center rounded-full absolute z-10 top-1/2 -translate-y-1/2 bg-white left-2 sm:left-4 lg:left-10' >
            <LuChevronLeft className='text-gray-600 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6' />
        </button>
    )
}

const MainSlider = () => {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        autoplay: true,
        nextArrow: <ArrowNext />,
        prevArrow: <ArrowPrev />,

        responsive: [
            {
                breakpoint: 480,
                settings: {
                    dots: false,
                    arrows: false,
                    nextArrow: '',
                    prevArrow: ''
                }
            }
        ]
    }
    return (
        <div>
            <Slider {...settings}>
                <div>
                    <Image src={slider1.src} width={slider1.width} height={slider1.height} alt='slider 1' />
                </div>
                <div>
                    <Image src={slider2.src} width={slider2.width} height={slider2.height} alt='slider 2' />
                </div>
                <div>
                    <Image src={slider3.src} width={slider3.width} height={slider3.height} alt='slider 3' />
                </div>
                <div>
                    <Image src={slider4.src} width={slider4.width} height={slider4.height} alt='slider 4' />
                </div>
            </Slider>
        </div>
    )
}

export default MainSlider