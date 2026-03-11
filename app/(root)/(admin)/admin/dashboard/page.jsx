import React from 'react'
import CountOverview from './CountOverview'
import QuickAdd from './QuickAdd'
import RecentOrders from './RecentOrders'
import MetalRatesOverview from './MetalRatesOverview'
import AnalyticsCharts from './AnalyticsCharts'
import DashboardInsights from './DashboardInsights'

const AdminDashboard = () => {
  return (
    <div>
      <CountOverview />
      <AnalyticsCharts />
      <DashboardInsights />
      <QuickAdd />
      <RecentOrders />
      <MetalRatesOverview />
    </div>
  )
}

export default AdminDashboard
