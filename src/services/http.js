import axios from 'axios'
import { message } from 'antd'

const http = axios.create({
  baseURL: '/api'
})

// 请求拦截器
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    console.log('=== HTTP Request Interceptor ===')
    console.log('Token from localStorage:', token ? token.substring(0, 30) + '...' : 'null')
    console.log('Request URL:', config.url)
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('Authorization header set:', config.headers.Authorization.substring(0, 40) + '...')
    } else {
      console.log('No token found, request without auth')
    }
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
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
          message.error('登录已过期，请重新登录')
          // 清除token
          localStorage.removeItem('token')
          localStorage.removeItem('userId')
          // 刷新页面让 Context 重新加载
          window.location.reload()
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
