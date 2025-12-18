import React from 'react'
import Image from 'next/image'
import mkLogo from '@/public/assets/mk_logo.jpg'
import mkShop from '@/public/assets/MK-SHOP.jpg'
import { Mail, Phone, Award, Heart, Shield, Star, Sparkles, Crown } from 'lucide-react'

const page = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section with Logo */}
            <section className="relative bg-gradient-to-br from-amber-50 via-white to-amber-50 py-12 sm:py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                        {/* Left side - Logo and Text */}
                        <div className="flex-1 text-center lg:text-left">
                            <div className="flex justify-center lg:justify-start mb-6">
                                <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden shadow-xl ring-4 ring-amber-100 p-3 bg-white">
                                    <Image
                                        src={mkLogo}
                                        alt="MK Jewellers Logo"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            </div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                                About <span className="text-amber-600">MK Jewellers</span>
                            </h1>
                            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                                Where timeless elegance meets exceptional craftsmanship. We are a trusted jewellery brand dedicated to creating beautiful, high-quality jewellery that celebrates life's most precious moments.
                            </p>
                        </div>

                        {/* Right side - Shop Image */}
                        <div className="flex-1 flex justify-center lg:justify-end">
                            <div className="relative w-full max-w-sm aspect-[3/4] rounded-xl overflow-hidden shadow-lg">
                                <Image
                                    src={mkShop}
                                    alt="MK Jewellers Shop"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Story */}
            <section className="py-8 sm:py-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-100 rounded-full mb-3">
                            <Sparkles className="w-7 h-7 text-amber-600" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Our Story</h2>
                        <p className="text-base text-gray-600 leading-relaxed">
                            Founded with a passion for fine jewellery, MK Jewellers was created to offer designs that blend traditional artistry with modern elegance. What began as a small vision is now loved by customers who value purity, trust, and timeless beauty.
                        </p>
                    </div>
                </div>
            </section>

            {/* What We Offer */}
            <section className="py-8 sm:py-10 bg-gray-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-100 rounded-full mb-3">
                            <Crown className="w-7 h-7 text-amber-600" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">What We Offer</h2>
                        <p className="text-base text-gray-600 mb-6">
                            We offer a wide range of jewellery, including:
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
                        <div className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                            <div className="text-center">
                                <div className="text-3xl mb-2">✨</div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">Gold Jewellery</h3>
                                <p className="text-gray-600 text-sm">Exquisite gold designs</p>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                            <div className="text-center">
                                <div className="text-3xl mb-2">💎</div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">Silver Jewellery</h3>
                                <p className="text-gray-600 text-sm">Elegant silver pieces</p>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                            <div className="text-center">
                                <div className="text-3xl mb-2">👑</div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">Customized Jewellery</h3>
                                <p className="text-gray-600 text-sm">Personalized designs</p>
                            </div>
                        </div>
                    </div>
                    <p className="text-center text-gray-600 mt-6 max-w-2xl mx-auto text-sm">
                        Each design is carefully crafted to suit both traditional and contemporary tastes.
                    </p>
                </div>
            </section>

            {/* Quality Assurance */}
            <section className="py-8 sm:py-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-100 rounded-full mb-3">
                            <Shield className="w-7 h-7 text-amber-600" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Quality & Purity Assurance</h2>
                        <p className="text-base text-gray-600 mb-6">
                            Quality is at the heart of everything we do.
                        </p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
                        <div className="flex items-start space-x-3 bg-gray-50 p-5 rounded-lg border border-gray-100">
                            <Award className="w-5 h-5 text-amber-600 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1 text-sm">Hallmarked Gold Jewellery</h3>
                                <p className="text-gray-600 text-xs">Certified purity guaranteed</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3 bg-gray-50 p-5 rounded-lg border border-gray-100">
                            <Star className="w-5 h-5 text-amber-600 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1 text-sm">Transparent Pricing</h3>
                                <p className="text-gray-600 text-xs">Accurate weight & fair rates</p>
                            </div>
                        </div>
                    </div>
                    <p className="text-center text-gray-600 mt-6 text-sm">
                        We ensure every piece meets the highest standards of purity and excellence.
                    </p>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-8 sm:py-10 bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Why Choose Us</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3 max-w-3xl mx-auto">
                        <div className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-gray-100">
                            <div className="w-1.5 h-1.5 bg-amber-600 rounded-full"></div>
                            <p className="text-gray-700 text-sm">Trusted jewellery brand</p>
                        </div>
                        <div className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-gray-100">
                            <div className="w-1.5 h-1.5 bg-amber-600 rounded-full"></div>
                            <p className="text-gray-700 text-sm">Superior craftsmanship</p>
                        </div>
                        <div className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-gray-100">
                            <div className="w-1.5 h-1.5 bg-amber-600 rounded-full"></div>
                            <p className="text-gray-700 text-sm">Fair and transparent pricing</p>
                        </div>
                        <div className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-gray-100">
                            <div className="w-1.5 h-1.5 bg-amber-600 rounded-full"></div>
                            <p className="text-gray-700 text-sm">Excellent customer support</p>
                        </div>
                    </div>
                    <p className="text-center text-gray-600 mt-6 text-sm">
                        Our goal is to make your jewellery-buying experience safe, memorable, and delightful.
                    </p>
                </div>
            </section>

            {/* Our Values */}
            <section className="py-8 sm:py-10 pb-12 sm:pb-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-100 rounded-full mb-3">
                            <Heart className="w-7 h-7 text-amber-600" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Our Values</h2>
                        <p className="text-base text-gray-600 mb-6">
                            At MK Jewellers, we believe in:
                        </p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
                        <div className="bg-gray-50 p-5 rounded-lg border border-gray-100 text-center">
                            <div className="text-3xl mb-2">🤝</div>
                            <h3 className="font-semibold text-gray-900 text-sm">Trust & Transparency</h3>
                        </div>
                        <div className="bg-gray-50 p-5 rounded-lg border border-gray-100 text-center">
                            <div className="text-3xl mb-2">⭐</div>
                            <h3 className="font-semibold text-gray-900 text-sm">Quality over Quantity</h3>
                        </div>
                        <div className="bg-gray-50 p-5 rounded-lg border border-gray-100 text-center">
                            <div className="text-3xl mb-2">😊</div>
                            <h3 className="font-semibold text-gray-900 text-sm">Customer Satisfaction</h3>
                        </div>
                        <div className="bg-gray-50 p-5 rounded-lg border border-gray-100 text-center">
                            <div className="text-3xl mb-2">🌿</div>
                            <h3 className="font-semibold text-gray-900 text-sm">Ethical Sourcing</h3>
                        </div>
                    </div>
                    <p className="text-center text-amber-600 font-medium mt-6 text-sm">
                        Your trust is our greatest achievement.
                    </p>
                </div>
            </section>
        </div>
    )
}

export default page
