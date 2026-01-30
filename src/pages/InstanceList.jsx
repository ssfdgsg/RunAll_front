import React, { useState, useEffect } from 'react'
import {
  Card,
  Form,
  Button,
  Space,
  Table,
  DatePicker,
  Select,
  Typography,
  Empty,
  message,
  Alert
} from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { listResources } from '../services/resource'
import { useAuth } from '../contexts/AuthContext'

const { Title, Text, Paragraph } = Typography
const { RangePicker } = DatePicker

const InstanceList = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [resources, setResources] = useState([])
  const [specs, setSpecs] = useState({})
  const { token, userId } = useAuth()

  // 自动加载用户资源
  useEffect(() => {
    if (userId) {
      handleQuery({ type: undefined, range: [] })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  // 如果未登录，提示用户登录
  if (!token) {
    return (
      <div className="page fade-in">
        <div className="page-header">
          <div>
            <Title level={2} className="page-title">我的实例</Title>
            <Paragraph className="page-desc">
              查看和管理您的云资源实例
            </Paragraph>
          </div>
        </div>
        <Alert
          message="请先登录"
          description="您需要登录后才能查看您的实例列表"
          type="info"
          showIcon
          style={{ marginTop: '24px' }}
        />
      </div>
    )
  }

  const handleQuery = async (values) => {
    if (!userId) {
      message.warning('无法获取用户信息，请重新登录')
      return
    }

    setLoading(true)
    try {
      const range = values.range || []
      const start = range[0] ? range[0].toISOString() : undefined
      const end = range[1] ? range[1].toISOString() : undefined
      const response = await listResources(userId, start, end, values.type)
      const nextResources = response?.data?.resources || []
      const nextSpecs = response?.data?.specs || {}
      setResources(nextResources)
      setSpecs(nextSpecs)
    } catch (error) {
      message.error('资源加载失败')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: '实例 ID',
      dataIndex: 'instanceId',
      key: 'instanceId',
      render: (value) => (
        <Link to={`/instances/${value}`} style={{ color: 'var(--primary)' }}>
          {value}
        </Link>
      )
    },
    { 
      title: '名称', 
      dataIndex: 'name', 
      key: 'name',
      render: (value) => value || '-'
    },
    { 
      title: '类型', 
      dataIndex: 'type', 
      key: 'type',
      render: (value) => (
        <span style={{ 
          padding: '4px 12px', 
          background: 'rgba(0, 217, 255, 0.1)', 
          border: '1px solid rgba(0, 217, 255, 0.3)',
          borderRadius: '6px',
          fontSize: '12px'
        }}>
          {value}
        </span>
      )
    },
    { 
      title: '创建时间', 
      dataIndex: 'createdAt', 
      key: 'createdAt',
      render: (value) => value ? new Date(value).toLocaleString('zh-CN') : '-'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="link" 
          onClick={() => navigate(`/instances/${record.instanceId}`)}
          style={{ padding: 0 }}
        >
          查看详情
        </Button>
      )
    }
  ]

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <Title level={2} className="page-title">我的实例</Title>
          <Paragraph className="page-desc">
            查看和管理您的云资源实例
          </Paragraph>
        </div>
      </div>

      <Card bordered={false} style={{ marginBottom: '24px' }}>
        <Form layout="inline" onFinish={handleQuery}>
          <Form.Item label="类型" name="type">
            <Select
              placeholder="全部类型"
              allowClear
              options={[
                { value: 'GPU', label: 'GPU 实例' },
                { value: 'CPU', label: 'CPU 实例' },
                { value: 'EDGE', label: '边缘实例' }
              ]}
              style={{ width: 160 }}
            />
          </Form.Item>
          <Form.Item label="时间范围" name="range">
            <RangePicker showTime />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              筛选
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card bordered={false}>
        <Table
          rowKey="instanceId"
          columns={columns}
          dataSource={resources}
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{
            emptyText: (
              <Empty 
                description="暂无实例数据" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )
          }}
        />
      </Card>
    </div>
  )
}

export default InstanceList

