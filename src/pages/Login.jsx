import React, { useState } from 'react'
import { Card, Form, Input, Button, Tabs, Typography, message } from 'antd'
import { login, register } from '../services/user'
import useAuthStore from '../store/auth'
import { hashPassword } from '../utils/crypto'

const { Title, Text } = Typography

const Login = () => {
  const [activeKey, setActiveKey] = useState('login')
  const [loading, setLoading] = useState(false)
  const token = useAuthStore((state) => state.token)
  const setToken = useAuthStore((state) => state.setToken)
  const setUserId = useAuthStore((state) => state.setUserId)

  const handleLogin = async (values) => {
    setLoading(true)
    try {
      // 对密码进行哈希处理
      const hashedPassword = await hashPassword(values.password)
      const response = await login({
        email: values.email,
        password: hashedPassword
      })
      const nextToken = response?.data?.token || ''
      setToken(nextToken)
      message.success('登录成功')
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
      const response = await register({
        email: values.email,
        password: hashedPassword,
        nickname: values.nickname
      })
      const nextUserId = response?.data?.userId || ''
      if (nextUserId) {
        setUserId(nextUserId)
      }
      message.success('注册成功，请登录')
    } catch (error) {
      message.error('注册失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page login-page fade-in">
      <Card className="login-card" bordered={false}>
        <div className="login-brand">
          <Title level={2} className="login-title">
            RunAll
          </Title>
          <Text type="secondary">统一入口，掌控实例与秒杀任务</Text>
        </div>
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
                    <Input placeholder="name@example.com" autoComplete="email" />
                  </Form.Item>
                  <Form.Item
                    label="密码"
                    name="password"
                    rules={[{ required: true, message: '请输入密码' }]}
                  >
                    <Input.Password placeholder="请输入密码" autoComplete="current-password" />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" block loading={loading}>
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
                    <Input placeholder="name@example.com" autoComplete="email" />
                  </Form.Item>
                  <Form.Item
                    label="密码"
                    name="password"
                    rules={[{ required: true, message: '请输入密码' }]}
                  >
                    <Input.Password placeholder="请输入密码" autoComplete="new-password" />
                  </Form.Item>
                  <Form.Item
                    label="昵称"
                    name="nickname"
                    rules={[{ required: true, message: '请输入昵称' }]}
                  >
                    <Input placeholder="例如：RunAll 用户" />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" block loading={loading}>
                    注册
                  </Button>
                </Form>
              )
            }
          ]}
        />
        {token ? (
          <div className="login-hint">
            <Text type="secondary">已保存登录 Token，可前往实例列表继续操作。</Text>
          </div>
        ) : null}
      </Card>
    </div>
  )
}

export default Login
