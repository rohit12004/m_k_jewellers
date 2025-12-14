import axios from 'axios';
import Link from 'next/link'
import React from 'react'
import { IoIosArrowRoundForward } from "react-icons/io";
import CategoryBox from './CategoryBox';

const FeaturedCategories = async () => {
    let categoryData = null
    try {
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/category/get-featured-categories`)
        categoryData = data
    } catch (error) {
        console.log(error)
    }

    if (!categoryData) return null

    return (
        <section className='lg:px-32 px-4 sm:py-10'>
            <div className='flex justify-between items-center mb-5'>
                <h2 className='sm:text-2xl text-lg font-semibold'>Shop by Category</h2>
                {/* <Link href="/categories" className='flex items-center gap-2 underline underline-offset-4 hover:text-primary'>
                    View All
                    <IoIosArrowRoundForward />
                </Link> */}
            </div>
            <div className='grid md:grid-cols-4 grid-cols-2 sm:gap-10 gap-2'>
                {!categoryData.success && <div className='text-center py-5'>No categories found.</div>}

                {categoryData.success && categoryData.data.map((category) => (
                    <CategoryBox key={category.id} category={category} />
                ))}

            </div>
        </section>
    )
}

export default FeaturedCategories
