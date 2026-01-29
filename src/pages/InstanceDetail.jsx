import React, { useState, useEffect } from 'react'
import { Card, Typography, Descriptions, Button, Space, Empty, Spin, message, Tag, Table, Input, Select, Switch, Modal, Form } from 'antd'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeftOutlined, ReloadOutlined, CodeOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { listResources } from '../services/resource'
import { setInstancePorts } from '../services/instance'
import useAuthStore from '../store/auth'

const { Title, Text, Paragraph } = Typography

const InstanceDetail = () => {
  const { instanceId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [resource, setResource] = useState(null)
  const [spec, setSpec] = useState(null)
  const [portEnabled, setPortEnabled] = useState(false)
  const [portConfigs, setPortConfigs] = useState([])
  const [portModalVisible, setPortModalVisible] = useState(false)
  const [portForm] = Form.useForm()
  const [savingPorts, setSavingPorts] = useState(false)
  
  const token = useAuthStore((state) => state.token)
  const userId = useAuthStore((state) => state.userId)

  useEffect(() => {
    if (userId) {
      loadInstanceDetail()
    }
  }, [userId, instanceId])

  const loadInstanceDetail = async () => {
    if (!userId) {
      message.warning('请先登录')
      return
    }

    setLoading(true)
    try {
      const response = await listResources(userId)
      const resources = response?.data?.resources || []
      const specs = response?.data?.specs || {}
      
      const matched = resources.find((item) => item.instanceId === instanceId)
      setResource(matched)
      setSpec(specs[instanceId])
      
      if (!matched) {
        message.warning('未找到该实例')
      }
    } catch (error) {
      console.error('Failed to load instance detail:', error)
      message.error('加载实例详情失败')
    } finally {
      setLoading(false)
    }
  }

  const renderSpecValue = (value, unit = '') => {
    if (value === null || value === undefined || value === '') return '—'
    return `${value}${unit}`
  }

  const renderConfigJson = (configJson) => {
    if (!configJson) return '{}'
    try {
      const config = typeof configJson === 'string' ? JSON.parse(configJson) : configJson
      return JSON.stringify(config, null, 2)
    } catch (e) {
      return configJson
    }
  }

  const handleAddPort = () => {
    portForm.resetFields()
    setPortModalVisible(true)
  }

  const handlePortModalOk = async () => {
    try {
      const values = await portForm.validateFields()
      setPortConfigs([...portConfigs, { ...values, key: Date.now(), accessUrl: null }])
      setPortModalVisible(false)
      message.success('端口配置已添加')
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  const handleDeletePort = (key) => {
    setPortConfigs(portConfigs.filter(item => item.key !== key))
    message.success('端口配置已删除')
  }

  const handleSavePorts = async () => {
    if (!instanceId) return

    setSavingPorts(true)
    try {
      const configs = portConfigs.map(({ port, protocol, ingressDomain }) => ({
        port: parseInt(port),
        protocol: protocol.toUpperCase(), // 转换为大写
        ...(ingressDomain && { ingressDomain })
      }))

      const response = await setInstancePorts(instanceId, portEnabled, configs)
      
      if (response?.data?.success) {
        message.success('端口转发设置成功')
        
        // 更新端口配置，添加访问地址
        const results = response.data.results || []
        const updatedConfigs = portConfigs.map(config => {
          const result = results.find(r => r.port === parseInt(config.port))
          return {
            ...config,
            accessUrl: result?.accessUrl || null,
            error: result?.error || null
          }
        })
        setPortConfigs(updatedConfigs)
        
        // 显示结果消息
        results.forEach(result => {
          if (!result.success && result.error) {
            message.error(`端口 ${result.port} 设置失败: ${result.error}`)
          }
        })
      } else {
        message.error(response?.data?.message || '端口转发设置失败')
      }
    } catch (error) {
      console.error('Failed to set ports:', error)
      message.error('端口转发设置失败')
    } finally {
      setSavingPorts(false)
    }
  }

  const portColumns = [
    {
      title: '端口',
      dataIndex: 'port',
      key: 'port',
      width: 100
    },
    {
      title: '协议',
      dataIndex: 'protocol',
      key: 'protocol',
      width: 100,
      render: (protocol) => <Tag color="blue">{protocol.toUpperCase()}</Tag>
    },
    {
      title: 'Ingress 域名',
      dataIndex: 'ingressDomain',
      key: 'ingressDomain',
      render: (domain) => domain || <Text type="secondary">—</Text>
    },
    {
      title: '访问地址',
      dataIndex: 'accessUrl',
      key: 'accessUrl',
      render: (url, record) => {
        if (record.error) {
          return <Text type="danger">{record.error}</Text>
        }
        if (url) {
          return (
            <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#00d9ff' }}>
              {url}
            </a>
          )
        }
        return <Text type="secondary">保存后显示</Text>
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Button 
          type="text" 
          danger 
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleDeletePort(record.key)}
        >
          删除
        </Button>
      )
    }
  ]

  if (!token) {
    return (
      <div className="page fade-in">
        <div className="page-header">
          <div>
            <Title level={2} className="page-title">实例详情</Title>
          </div>
        </div>
        <Card bordered={false}>
          <Empty description="请先登录查看实例详情" />
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="page fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" tip="加载实例详情中..." />
      </div>
    )
  }

  if (!resource) {
    return (
      <div className="page fade-in">
        <div className="page-header">
          <div>
            <Title level={2} className="page-title">实例详情</Title>
          </div>
          <Button onClick={() => navigate('/instances')}>
            返回列表
          </Button>
        </div>
        <Card bordered={false}>
          <Empty description="未找到该实例">
            <Text type="secondary" style={{ display: 'block', marginTop: '8px' }}>
              实例 ID：{instanceId}
            </Text>
            <Space style={{ marginTop: '16px' }}>
              <Button type="primary" onClick={() => navigate('/instances')}>
                返回实例列表
              </Button>
              <Button onClick={loadInstanceDetail} icon={<ReloadOutlined />}>
                重新加载
              </Button>
            </Space>
          </Empty>
        </Card>
      </div>
    )
  }

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/instances')}
            style={{ marginRight: '16px' }}
          >
            返回
          </Button>
          <Title level={2} className="page-title" style={{ display: 'inline' }}>
            实例详情
          </Title>
        </div>
        <Button onClick={loadInstanceDetail} icon={<ReloadOutlined />} loading={loading}>
          刷新
        </Button>
      </div>

      {/* 基本信息 */}
      <Card bordered={false} style={{ marginBottom: '24px' }}>
        <Title level={4} style={{ marginBottom: '16px' }}>基本信息</Title>
        <Descriptions column={{ xs: 1, sm: 2, md: 2 }} bordered>
          <Descriptions.Item label="实例 ID">
            <Text code>{resource.instanceId}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="名称">
            {resource.name || <Text type="secondary">未命名</Text>}
          </Descriptions.Item>
          <Descriptions.Item label="类型">
            <Tag color="blue">{resource.type || '—'}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="用户 ID">
            <Text code>{resource.userId || '—'}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {resource.createdAt ? new Date(resource.createdAt).toLocaleString('zh-CN') : '—'}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            {resource.updatedAt ? new Date(resource.updatedAt).toLocaleString('zh-CN') : '—'}
          </Descriptions.Item>
        </Descriptions>

        <Space style={{ marginTop: '24px' }}>
          <Button type="primary" icon={<CodeOutlined />}>
            <Link to={`/terminal/${resource.instanceId}`}>连接终端</Link>
          </Button>
        </Space>
      </Card>

      {/* 规格配置 */}
      <Card bordered={false} style={{ marginBottom: '24px' }}>
        <Title level={4} style={{ marginBottom: '16px' }}>规格配置</Title>
        {spec ? (
          <>
            <Descriptions column={{ xs: 1, sm: 2, md: 2 }} bordered>
              <Descriptions.Item label="CPU 核心">
                {renderSpecValue(spec.cpu || spec.cpuCores, ' 核')}
              </Descriptions.Item>
              <Descriptions.Item label="内存">
                {renderSpecValue(spec.memory || spec.memorySize, ' GB')}
              </Descriptions.Item>
              <Descriptions.Item label="GPU">
                {renderSpecValue(spec.gpu)}
              </Descriptions.Item>
              <Descriptions.Item label="镜像">
                {spec.image ? <Tag color="geekblue">{spec.image}</Tag> : '—'}
              </Descriptions.Item>
            </Descriptions>

            {(spec.configJson || spec.customConfig) && (
              <div style={{ marginTop: '16px' }}>
                <Text strong style={{ display: 'block', marginBottom: '8px' }}>自定义配置</Text>
                <pre className="code-block">
                  {renderConfigJson(spec.configJson || spec.customConfig)}
                </pre>
              </div>
            )}
          </>
        ) : (
          <Empty description="暂无规格配置数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Card>

      {/* 端口转发 */}
      <Card bordered={false}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Title level={4} style={{ margin: 0 }}>端口转发</Title>
          <Space>
            <span>启用端口转发</span>
            <Switch checked={portEnabled} onChange={setPortEnabled} />
          </Space>
        </div>

        <Table
          columns={portColumns}
          dataSource={portConfigs}
          pagination={false}
          locale={{ emptyText: '暂无端口配置' }}
          style={{ marginBottom: '16px' }}
        />

        <Space>
          <Button icon={<PlusOutlined />} onClick={handleAddPort}>
            添加端口
          </Button>
          <Button 
            type="primary" 
            onClick={handleSavePorts} 
            loading={savingPorts}
            disabled={!portEnabled && portConfigs.length === 0}
          >
            保存配置
          </Button>
        </Space>
      </Card>

      {/* 添加端口弹窗 */}
      <Modal
        title="添加端口配置"
        open={portModalVisible}
        onOk={handlePortModalOk}
        onCancel={() => setPortModalVisible(false)}
        okText="添加"
        cancelText="取消"
      >
        <Form form={portForm} layout="vertical">
          <Form.Item
            name="port"
            label="端口号"
            rules={[
              { required: true, message: '请输入端口号' },
              { pattern: /^\d+$/, message: '端口号必须是数字' },
              { 
                validator: (_, value) => {
                  const port = parseInt(value)
                  if (port < 1 || port > 65535) {
                    return Promise.reject('端口号范围: 1-65535')
                  }
                  return Promise.resolve()
                }
              }
            ]}
          >
            <Input placeholder="例如: 8080" />
          </Form.Item>

          <Form.Item
            name="protocol"
            label="协议"
            rules={[{ required: true, message: '请选择协议' }]}
            initialValue="http"
          >
            <Select>
              <Select.Option value="http">HTTP</Select.Option>
              <Select.Option value="tcp">TCP</Select.Option>
              <Select.Option value="udp">UDP</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="ingressDomain"
            label="Ingress 域名（可选）"
          >
            <Input placeholder="例如: myapp.example.com" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default InstanceDetail
