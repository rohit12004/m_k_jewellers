'use client'
import React from 'react';

const TimeRangeFilter = ({ selectedRange, onRangeChange }) => {
  const ranges = [
    { label: 'Last 30 Days', value: '30d' },
    { label: 'This Year', value: '12m' },
    { label: 'Lifetime', value: 'lifetime' }
  ];

  return (
    <div className='flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit'>
      {ranges.map((range) => (
        <button
          key={range.value}
          onClick={() => onRangeChange(range.value)}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
            selectedRange === range.value
              ? 'bg-white dark:bg-card shadow-sm text-indigo-600 dark:text-indigo-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
};

export default TimeRangeFilter;
