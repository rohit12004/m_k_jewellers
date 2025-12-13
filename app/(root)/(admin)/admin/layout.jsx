"use client"
import AppSideBar from '@/components/Application/Admin/AppSideBar'
import ThemeProvider from '@/components/Application/Admin/ThemeProvider'
import Topbar from '@/components/Application/Admin/Topbar'
import { SidebarProvider } from '@/components/ui/sidebar'
import React from 'react'

const layout = ({ children }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SidebarProvider>
        <AppSideBar />
        <main className='md:w-[calc(100vw-16rem)] w-full'>
          <div className='pt-[70px] px-8 min-h-[calc(100vh-40px)] pb-10'>
            <Topbar />
            {children}
          </div>
          <div className='border-t h-[40px] flex justify-center items-center bg-gray-50 dark:bg-background text-sm'>
            M.K.JEWELLERS-Ratnagiri
          </div>
        </main>
      </SidebarProvider>
    </ThemeProvider>
  )
}

export default layout
