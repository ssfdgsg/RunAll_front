import React, { useState } from 'react'
import { Modal, Form, Input, Button, Tabs, message } from 'antd'
import { login, register } from '../services/user'
import { useAuth } from '../contexts/AuthContext'
import { hashPassword } from '../utils/crypto'

const LoginModal = ({ open, onClose }) => {
  const [activeKey, setActiveKey] = useState('login')
  const [loading, setLoading] = useState(false)
  const { setToken } = useAuth()

  const handleLogin = async (values) => {
    setLoading(true)
    try {
      // 对密码进行哈希处理
      const hashedPassword = await hashPassword(values.password)
      const response = await login({
        email: values.email,
        password: hashedPassword
      })
      const token = response?.data?.token || ''
      console.log('Login successful, token:', token ? token.substring(0, 30) + '...' : 'empty')
      
      // 直接保存到 localStorage，确保立即可用
      if (token) {
        localStorage.setItem('token', token)
        console.log('Token saved to localStorage')
      }
      
      setToken(token)
      message.success('登录成功')
      onClose()
      
      // 刷新页面以重新加载数据
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (error) {
      message.error('登录失败，请检查账号信息')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (values) => {
    setLoading(true)
    try {
      // 对密码进行哈希处理
      const hashedPassword = await hashPassword(values.password)
      await register({
        email: values.email,
        password: hashedPassword,
        nickname: values.nickname
      })
      message.success('注册成功，请登录')
      setActiveKey('login')
    } catch (error) {
      message.error('注册失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={480}
      centered
      destroyOnClose
    >
      <div style={{ padding: '24px 0 8px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-bright)' }}>
          欢迎来到 RunAll
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          登录或注册以访问您的资源
        </p>
        
        <Tabs
          activeKey={activeKey}
          onChange={setActiveKey}
          items={[
            {
              key: 'login',
              label: '登录',
              children: (
                <Form layout="vertical" onFinish={handleLogin}>
                  <Form.Item
                    label="邮箱"
                    name="email"
                    rules={[{ required: true, message: '请输入邮箱' }]}
                  >
                    <Input size="large" placeholder="name@example.com" autoComplete="email" />
                  </Form.Item>
                  <Form.Item
                    label="密码"
                    name="password"
                    rules={[{ required: true, message: '请输入密码' }]}
                  >
                    <Input.Password size="large" placeholder="请输入密码" autoComplete="current-password" />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" size="large" block loading={loading}>
                    登录
                  </Button>
                </Form>
              )
            },
            {
              key: 'register',
              label: '注册',
              children: (
                <Form layout="vertical" onFinish={handleRegister}>
                  <Form.Item
                    label="邮箱"
                    name="email"
                    rules={[{ required: true, message: '请输入邮箱' }]}
                  >
                    <Input size="large" placeholder="name@example.com" autoComplete="email" />
                  </Form.Item>
                  <Form.Item
                    label="密码"
                    name="password"
                    rules={[{ required: true, message: '请输入密码' }]}
                  >
                    <Input.Password size="large" placeholder="请输入密码" autoComplete="new-password" />
                  </Form.Item>
                  <Form.Item
                    label="昵称"
                    name="nickname"
                    rules={[{ required: true, message: '请输入昵称' }]}
                  >
                    <Input size="large" placeholder="您的昵称" />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" size="large" block loading={loading}>
                    注册
                  </Button>
                </Form>
              )
            }
          ]}
        />
      </div>
    </Modal>
  )
}

export default LoginModal
