import React from 'react'
import CountOverview from './CountOverview'
import QuickAdd from './QuickAdd'
import RecentOrders from './RecentOrders'
import MetalRatesOverview from './MetalRatesOverview'

const AdminDashboard = () => {
  return (
    <div>
      <CountOverview />
      <QuickAdd />
      <RecentOrders />
      <MetalRatesOverview />
    </div>
  )
}

export default AdminDashboard
