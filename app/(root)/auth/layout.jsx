import React from 'react'

const layout = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex justify-center items-center overflow-x-hidden">
      {children}
    </div>
  )
}

export default layout
