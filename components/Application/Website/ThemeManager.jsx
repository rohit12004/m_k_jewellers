'use client'
import { useEffect } from 'react'

const ThemeManager = ({ children }) => {
    // Force light mode on website - remove dark class if admin set it
    useEffect(() => {
        const html = document.documentElement
        html.classList.remove('dark')

        // Also set light theme in localStorage to prevent dark mode from being applied
        localStorage.setItem('theme', 'light')

        // Watch for any attempts to add dark class and remove it
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class' && html.classList.contains('dark')) {
                    html.classList.remove('dark')
                }
            })
        })

        observer.observe(html, { attributes: true })

        return () => observer.disconnect()
    }, [])

    return <>{children}</>
}

export default ThemeManager
