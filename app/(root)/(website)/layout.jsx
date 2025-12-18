import Header from '@/components/Application/Website/Header'
import Footer from '@/components/Application/Website/Footer'
import ThemeManager from '@/components/Application/Website/ThemeManager'
import React from 'react'
import { Kumbh_Sans } from 'next/font/google'

const kumbh = Kumbh_Sans({
    weight: ['400', '500', '600', '700', '800'],
    display: 'swap',
    subsets: ['latin']
})

const layout = ({ children }) => {
    return (
        <ThemeManager>
            <div className={kumbh.className}>
                <Header />
                <main>
                    {children}
                </main>
                <Footer />
            </div>
        </ThemeManager>
    )
}

export default layout