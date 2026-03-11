'use client'
import React, { useState } from 'react'
import CountOverview from './CountOverview'
import QuickAdd from './QuickAdd'
import RecentOrders from './RecentOrders'
import MetalRatesOverview from './MetalRatesOverview'
import AnalyticsCharts from './AnalyticsCharts'
import DashboardInsights from './DashboardInsights'
import TimeRangeFilter from './TimeRangeFilter'

const AdminDashboard = () => {
  const [range, setRange] = useState('30d')

  return (
    <div className='space-y-6'>
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2'>
        <h2 className='text-2xl font-bold text-gray-800 dark:text-white'>Business Overview</h2>
        <TimeRangeFilter selectedRange={range} onRangeChange={setRange} />
      </div>

      <CountOverview range={range} />
      <AnalyticsCharts range={range} />
      <DashboardInsights range={range} />
      <QuickAdd />
      <RecentOrders />
      <MetalRatesOverview />
    </div>
  )
}

export default AdminDashboard
