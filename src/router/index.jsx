import React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import Seckill from '../pages/Seckill'
import ProductList from '../pages/ProductList'
import ProductDetail from '../pages/ProductDetail'
import InstanceList from '../pages/InstanceList'
import InstanceDetail from '../pages/InstanceDetail'
import Terminal from '../pages/Terminal'

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <ProductList /> },
      { path: 'products', element: <ProductList /> },
      { path: 'products/:productId', element: <ProductDetail /> },
      { path: 'seckill', element: <Seckill /> },
      { path: 'instances', element: <InstanceList /> },
      { path: 'instances/:instanceId', element: <InstanceDetail /> }
    ]
  },
  {
    path: '/terminal/:instanceId',
    element: <Terminal />
  }
])

export default router
