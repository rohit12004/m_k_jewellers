import Header from '@/components/Application/Website/Header'
import Footer from '@/components/Application/Website/Footer'
import ThemeManager from '@/components/Application/Website/ThemeManager'
import React from 'react'
import { Space_Grotesk } from 'next/font/google'

const spaceGrotesk = Space_Grotesk({
    weight: ['400', '500', '600', '700'],
    display: 'swap',
    subsets: ['latin']
})

const layout = ({ children }) => {
    return (
        <ThemeManager>
            <div className={spaceGrotesk.className}>
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