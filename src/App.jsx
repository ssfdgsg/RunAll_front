import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import router from './router'
import './App.css'

const App = () => {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#00d9ff',
          colorBgContainer: 'rgba(15, 15, 15, 0.95)',
          colorBorder: 'rgba(255, 255, 255, 0.1)',
          colorText: '#ffffff',
          colorTextSecondary: '#a0a0a0',
          borderRadius: 8,
          fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }
      }}
    >
      <RouterProvider router={router} />
    </ConfigProvider>
  )
}

export default App
