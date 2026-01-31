import axios from 'axios'
import { message } from 'antd'

const http = axios.create({
  baseURL: '/api'
})

// 请求拦截器 - 每次都重新读取 token
http.interceptors.request.use(
  (config) => {
    // 每次请求都重新从 localStorage 读取
    const token = localStorage.getItem('token')
    
    console.log('=== HTTP Request ===')
    console.log('URL:', config.url)
    console.log('Token exists:', !!token)
    
    if (token && token.length > 0) {
      config.headers['Authorization'] = `Bearer ${token}`
      console.log('Authorization header added:', `Bearer ${token.substring(0, 30)}...`)
    } else {
      console.log('No token, skipping Authorization header')
    }
    
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
let isRefreshing = false // 防止重复刷新

http.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('Response error:', error.response || error)
    
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          // 只有在已登录（有token）的情况下才提示过期并刷新
          const hasToken = localStorage.getItem('token')
          if (hasToken && !isRefreshing) {
            isRefreshing = true
            message.error('登录已过期，请重新登录')
            localStorage.removeItem('token')
            localStorage.removeItem('userId')
            
            // 3秒后才允许再次刷新
            setTimeout(() => {
              isRefreshing = false
            }, 3000)
            
            // 延迟刷新，避免无限循环
            setTimeout(() => {
              window.location.href = '/'
            }, 1500)
          }
          // 如果没有token，说明本来就没登录，不需要提示和刷新
          break
        case 403:
          message.error('没有权限访问')
          break
        case 404:
          message.error('请求的资源不存在')
          break
        case 500:
          message.error('服务器错误')
          break
        default:
          message.error(data?.message || '请求失败')
      }
    } else if (error.request) {
      message.error('网络错误，请检查连接')
    } else {
      message.error('请求配置错误')
    }
    
    return Promise.reject(error)
  }
)

export default http
