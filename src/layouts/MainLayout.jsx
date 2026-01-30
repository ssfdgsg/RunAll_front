import React, { useState, useEffect } from 'react'
import { Layout, Menu, Button } from 'antd'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { UserOutlined, LogoutOutlined } from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'
import { getUser } from '../services/user'
import LoginModal from '../components/LoginModal'
import { extractUserId } from '../utils/jwt'

const { Header, Content } = Layout

const navItems = [
  { key: '/products', label: '商品', to: '/products' },
  { key: '/seckill', label: '秒杀', to: '/seckill' },
  { key: '/instances', label: '我的实例', to: '/instances' }
]

const MainLayout = () => {
  const location = useLocation()
  const currentPath = location.pathname.startsWith('/products') ? '/products' : location.pathname
  
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [localUserInfo, setLocalUserInfo] = useState(null)
  const { token, userId, setUserId, logout } = useAuth()

  // 从JWT解析userId
  useEffect(() => {
    if (token) {
      const uid = extractUserId(token)
      if (uid && uid !== userId) {
        console.log('Setting userId from JWT:', uid)
        setUserId(uid)
      }
    }
  }, [token, userId, setUserId])

  // 获取用户信息
  useEffect(() => {
    if (userId) {
      console.log('Fetching user info for userId:', userId)
      getUser(userId)
        .then((res) => {
          console.log('User info fetched:', res.data)
          setLocalUserInfo(res.data)
        })
        .catch((err) => {
          console.error('Failed to fetch user info:', err)
        })
    } else {
      setLocalUserInfo(null)
    }
  }, [userId])

  const handleLogout = () => {
    logout()
    setLocalUserInfo(null)
  }

  return (
    <Layout className="app-shell">
      <Header className="app-header">
        <div className="brand">
          <span className="brand-mark">RunAll</span>
          <span className="brand-tag">云资源 · 秒杀平台</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <Menu
            mode="horizontal"
            theme="dark"
            selectedKeys={[currentPath]}
            items={navItems.map((item) => ({
              key: item.key,
              label: <Link to={item.to}>{item.label}</Link>
            }))}
            style={{ flex: 1, minWidth: 0, border: 'none' }}
          />
          <div className="user-section">
            {token ? (
              localUserInfo ? (
                <div className="user-info">
                  <div className="user-avatar">
                    {localUserInfo.nickname?.charAt(0).toUpperCase() || localUserInfo.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="user-name">
                    {localUserInfo.nickname || localUserInfo.email?.split('@')[0] || '用户'}
                  </span>
                  <Button
                    type="text"
                    icon={<LogoutOutlined />}
                    onClick={handleLogout}
                    style={{ color: 'var(--text-muted)' }}
                  />
                </div>
              ) : (
                <div className="user-info">
                  <div className="user-avatar">
                    <UserOutlined style={{ fontSize: '14px' }} />
                  </div>
                  <span className="user-name">加载中...</span>
                </div>
              )
            ) : (
              <Button
                type="primary"
                icon={<UserOutlined />}
                onClick={() => setLoginModalOpen(true)}
              >
                登录
              </Button>
            )}
          </div>
        </div>
      </Header>
      <Content className="app-content">
        <Outlet />
      </Content>
      <LoginModal open={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </Layout>
  )
}

export default MainLayout
