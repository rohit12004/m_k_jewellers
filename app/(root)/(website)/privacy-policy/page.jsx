import React from 'react'
import { Shield, Lock, FileText, Mail, Phone } from 'lucide-react'

const page = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Privacy Policy Section */}
            <section className="py-8 sm:py-12 bg-gradient-to-br from-amber-50 via-white to-amber-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-100 rounded-full mb-3">
                            <Shield className="w-7 h-7 text-amber-600" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Privacy Policy</h1>
                        <p className="text-base text-gray-600">
                            At MK Jewellers, we respect your privacy and are committed to protecting your personal information.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Information We Collect */}
                        <div className="bg-white p-5 rounded-lg border border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
                            <p className="text-gray-600 text-sm mb-3">We may collect the following information:</p>
                            <ul className="space-y-1.5 text-gray-600 text-sm">
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                    Full Name
                                </li>
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                    Email Address
                                </li>
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                    Mobile Number
                                </li>
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                    Billing & Shipping Address
                                </li>
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                    Order & Purchase Details
                                </li>
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                    PAN card number
                                </li>
                            </ul>
                        </div>

                        {/* How We Use Your Information */}
                        <div className="bg-white p-5 rounded-lg border border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
                            <p className="text-gray-600 text-sm mb-3">Your information is used to:</p>
                            <ul className="space-y-1.5 text-gray-600 text-sm">
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                    Process and deliver jewellery orders
                                </li>
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                    Confirm payments and invoices
                                </li>
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                    Provide customer support
                                </li>
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                    Send order updates and notifications
                                </li>
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                    Improve our website and services
                                </li>
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                    Prevent fraud and unauthorized transactions
                                </li>
                            </ul>
                        </div>

                        {/* Payment Information */}
                        <div className="bg-white p-5 rounded-lg border border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Payment Information</h2>
                            <p className="text-gray-600 text-sm mb-2">All payments are processed through <strong>secure third-party payment gateways</strong>.</p>
                            <p className="text-gray-600 text-sm">We <strong>do not store</strong> credit card, debit card, or UPI details.</p>
                        </div>

                        {/* Information Sharing */}
                        <div className="bg-white p-5 rounded-lg border border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Information Sharing</h2>
                            <p className="text-gray-600 text-sm mb-3">We do <strong>not sell or rent</strong> personal information. Data may be shared with:</p>
                            <ul className="space-y-1.5 text-gray-600 text-sm">
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                    Courier & logistics partners
                                </li>
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                    Payment service providers
                                </li>
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                    Government or legal authorities (if required by law)
                                </li>
                            </ul>
                        </div>

                        {/* Data Security */}
                        <div className="bg-white p-5 rounded-lg border border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data Security</h2>
                            <p className="text-gray-600 text-sm">We implement appropriate security measures to protect your data. However, no online platform can guarantee 100% security.</p>
                        </div>

                        {/* Your Rights */}
                        <div className="bg-white p-5 rounded-lg border border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Your Rights</h2>
                            <p className="text-gray-600 text-sm mb-3">You have the right to:</p>
                            <ul className="space-y-1.5 text-gray-600 text-sm">
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                    Access your personal data
                                </li>
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                    Request corrections
                                </li>
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                    Request deletion (subject to legal requirements)
                                </li>
                            </ul>
                        </div>

                        {/* Third-Party Links */}
                        <div className="bg-white p-5 rounded-lg border border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Third-Party Links</h2>
                            <p className="text-gray-600 text-sm">Our website may contain links to third-party sites. We are not responsible for their privacy practices.</p>
                        </div>

                        {/* Policy Changes */}
                        <div className="bg-white p-5 rounded-lg border border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Policy Changes</h2>
                            <p className="text-gray-600 text-sm">We may update this Privacy Policy at any time. Changes will be posted on this page.</p>
                        </div>

                        {/* Contact */}
                        <div className="bg-gradient-to-br from-amber-50 to-white p-5 rounded-lg border border-amber-100">
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Contact Us</h2>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <a href="mailto:mkjew1976@gmail.com" className="flex items-center text-gray-700 hover:text-amber-600 transition-colors text-sm">
                                    <Mail className="w-4 h-4 mr-2" />
                                    mkjew1976@gmail.com
                                </a>
                                <a href="tel:9881339944" className="flex items-center text-gray-700 hover:text-amber-600 transition-colors text-sm">
                                    <Phone className="w-4 h-4 mr-2" />
                                    9881339944
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Terms and Conditions Section */}
            <section className="py-8 sm:py-12 bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-100 rounded-full mb-3">
                            <FileText className="w-7 h-7 text-amber-600" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Terms and Conditions</h1>
                        <p className="text-base text-gray-600">
                            By accessing or purchasing from MK Jewellers, you agree to the following Terms and Conditions.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* General */}
                        <div className="bg-white p-5 rounded-lg border border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. General</h2>
                            <ul className="space-y-1.5 text-gray-600 text-sm">
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                    Users must be <strong>18 years or older</strong> to place an order
                                </li>
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                    All information provided must be accurate and complete
                                </li>
                            </ul>
                        </div>

                        {/* Product Information */}
                        <div className="bg-white p-5 rounded-lg border border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Product Information</h2>
                            <ul className="space-y-1.5 text-gray-600 text-sm">
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                    Jewellery images are for <strong>reference only</strong>
                                </li>
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                    Actual product may vary in color, design, or finish
                                </li>
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                    Weight may slightly vary due to craftsmanship
                                </li>
                            </ul>
                        </div>

                        {/* Pricing */}
                        <div className="bg-white p-5 rounded-lg border border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Pricing</h2>
                            <ul className="space-y-1.5 text-gray-600 text-sm">
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                    Prices are in <strong>INR</strong> and inclusive of GST as mentioned
                                </li>
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                    Prices may change due to gold, silver, or gemstone market fluctuations
                                </li>
                            </ul>
                        </div>

                        {/* Orders & Acceptance */}
                        <div className="bg-white p-5 rounded-lg border border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Orders & Acceptance</h2>
                            <ul className="space-y-1.5 text-gray-600 text-sm">
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                    Order confirmation does not guarantee acceptance
                                </li>
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                    We reserve the right to cancel orders due to pricing errors, stock issues, or suspected fraud
                                </li>
                            </ul>
                        </div>

                        {/* Payments */}
                        <div className="bg-white p-5 rounded-lg border border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Payments</h2>
                            <ul className="space-y-1.5 text-gray-600 text-sm">
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                    Full payment is required before order processing
                                </li>
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                    We accept online payments via secure gateways
                                </li>
                            </ul>
                        </div>

                        {/* Shipping & Delivery */}
                        <div className="bg-white p-5 rounded-lg border border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Shipping & Delivery</h2>
                            <ul className="space-y-1.5 text-gray-600 text-sm">
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                    Delivery timelines are estimated
                                </li>
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                    Delays due to courier partners, festivals, or unforeseen events are not our responsibility
                                </li>
                            </ul>
                        </div>

                        {/* Returns, Exchanges & Refunds */}
                        <div className="bg-white p-5 rounded-lg border border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Returns, Exchanges & Refunds</h2>
                            <ul className="space-y-1.5 text-gray-600 text-sm">
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                    <strong>Customized / made-to-order jewellery is non-returnable</strong>
                                </li>
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                    Returns or exchanges are subject to inspection
                                </li>
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                    Refunds (if approved) will be processed within 7 working days
                                </li>
                            </ul>
                        </div>

                        {/* Purity & Certification */}
                        <div className="bg-white p-5 rounded-lg border border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Purity & Certification</h2>
                            <ul className="space-y-1.5 text-gray-600 text-sm">
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                    Gold and silver jewellery are Hallmarked where applicable
                                </li>
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                    Diamond jewellery comes with certification
                                </li>
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                    Certificates must be preserved by the customer
                                </li>
                            </ul>
                        </div>

                        {/* Jewellery Care */}
                        <div className="bg-white p-5 rounded-lg border border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Jewellery Care</h2>
                            <p className="text-gray-600 text-sm">Normal wear & tear, damage, or mishandling is not covered under returns or refunds.</p>
                        </div>

                        {/* Limitation of Liability */}
                        <div className="bg-white p-5 rounded-lg border border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Limitation of Liability</h2>
                            <p className="text-gray-600 text-sm">We are not liable for indirect, incidental, or consequential damages.</p>
                        </div>

                        {/* Changes to Terms */}
                        <div className="bg-white p-5 rounded-lg border border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Changes to Terms</h2>
                            <p className="text-gray-600 text-sm">We reserve the right to modify these Terms & Conditions at any time.</p>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-gradient-to-br from-amber-50 to-white p-5 rounded-lg border border-amber-100">
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Contact Information</h2>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <a href="mailto:mkjew1976@gmail.com" className="flex items-center text-gray-700 hover:text-amber-600 transition-colors text-sm">
                                    <Mail className="w-4 h-4 mr-2" />
                                    mkjew1976@gmail.com
                                </a>
                                <a href="tel:9881339944" className="flex items-center text-gray-700 hover:text-amber-600 transition-colors text-sm">
                                    <Phone className="w-4 h-4 mr-2" />
                                    9881339944
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default page
