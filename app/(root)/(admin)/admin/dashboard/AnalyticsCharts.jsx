'use client'
import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { formatINR } from '@/lib/formatters';

const COLORS = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6'];

const AnalyticsCharts = () => {
  const { data: analyticsData, isLoading: loading } = useQuery({
    queryKey: ['adminDashboardAnalytics'],
    queryFn: async () => {
      const { data } = await axios.get('/api/dashboard/admin/analytics')
      return data
    },
    staleTime: 5 * 60 * 1000
  });
  
  if (loading) return <div className="h-64 flex items-center justify-center">Loading charts...</div>;
  
  const charts = analyticsData?.data?.charts || {};
  const salesTrend = charts.salesTrend || [];
  const categorySales = charts.categorySales || [];

  return (
    <div className='grid lg:grid-cols-2 grid-cols-1 gap-6 mt-6'>
      {/* Sales Trend Area Chart */}
      <div className='bg-white dark:bg-card p-5 rounded-xl border shadow-sm dark:border-gray-800'>
        <h3 className='text-lg font-bold mb-4 text-gray-800 dark:text-white'>30-Day Sales Trend (₹)</h3>
        <div className='h-[300px] w-full'>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesTrend}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{fontSize: 10}} 
                tickFormatter={(str) => {
                  const date = new Date(str);
                  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                }}
              />
              <YAxis 
                tick={{fontSize: 10}} 
                tickFormatter={(val) => `₹${val >= 1000 ? (val/1000).toFixed(0)+'K' : val}`}
              />
              <Tooltip 
                formatter={(value) => [formatINR(value, false), 'Revenue']}
                labelFormatter={(label) => new Date(label).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#6366f1" 
                fillOpacity={1} 
                fill="url(#colorAmount)" 
                strokeWidth={3}
                animationBegin={0}
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Revenue Pie Chart */}
      <div className='bg-white dark:bg-card p-5 rounded-xl border shadow-sm dark:border-gray-800'>
        <h3 className='text-lg font-bold mb-4 text-gray-800 dark:text-white'>Revenue by Category (₹)</h3>
        <div className='h-[300px] w-full'>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categorySales}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="revenue"
                nameKey="category"
              >
                {categorySales.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => formatINR(value, false)}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
