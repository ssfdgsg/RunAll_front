import React, { useState, useEffect } from 'react'
import { Card, Typography, Descriptions, Button, Space, Tag, Spin, Empty, message } from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { getProduct, purchaseProduct } from '../services/product'
import useAuthStore from '../store/auth'

const { Title, Text } = Typography

const ProductDetail = () => {
  const { productId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [purchasing, setPurchasing] = useState(false)
  const [product, setProduct] = useState(null)
  
  const token = useAuthStore((state) => state.token)
  const userId = useAuthStore((state) => state.userId)

  useEffect(() => {
    loadProduct()
  }, [productId])

  const loadProduct = async () => {
    setLoading(true)
    try {
      const response = await getProduct(productId)
      setProduct(response?.data)
    } catch (error) {
      console.error('Failed to load product:', error)
      message.error('加载商品详情失败')
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async () => {
    if (!token) {
      message.warning('请先登录')
      return
    }

    if (!userId) {
      message.warning('用户信息加载中，请稍后')
      return
    }

    setPurchasing(true)
    try {
      const response = await purchaseProduct(productId, userId)
      const data = response?.data
      
      if (data?.orderId) {
        message.success('购买成功！')
        message.info(`订单ID: ${data.orderId}`, 3)
        
        // 跳转到实例列表
        setTimeout(() => {
          navigate('/instances')
        }, 1500)
      } else {
        message.error('购买失败')
      }
    } catch (error) {
      console.error('Failed to purchase:', error)
      message.error('购买失败')
    } finally {
      setPurchasing(false)
    }
  }

  const renderSpec = (spec) => {
    if (!spec) return null
    
    const items = []
    if (spec.cpu || spec.cpuCores) {
      items.push({ label: 'CPU', value: `${spec.cpu || spec.cpuCores} 核` })
    }
    if (spec.memory || spec.memorySize) {
      items.push({ label: '内存', value: `${spec.memory || spec.memorySize} GB` })
    }
    if (spec.gpu) {
      items.push({ label: 'GPU', value: spec.gpu })
    }
    if (spec.disk) {
      items.push({ label: '磁盘', value: `${spec.disk} GB` })
    }
    if (spec.bandwidth) {
      items.push({ label: '带宽', value: `${spec.bandwidth} Mbps` })
    }
    if (spec.image) {
      items.push({ label: '镜像', value: spec.image })
    }
    
    return items
  }

  if (loading) {
    return (
      <div className="page fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" tip="加载商品详情中..." />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="page fade-in">
        <div className="page-header">
          <Title level={2} className="page-title">商品详情</Title>
          <Button onClick={() => navigate('/products')}>返回列表</Button>
        </div>
        <Card bordered={false}>
          <Empty description="商品不存在或已下架">
            <Button type="primary" onClick={() => navigate('/products')}>
              返回商品列表
            </Button>
          </Empty>
        </Card>
      </div>
    )
  }

  const specItems = renderSpec(product.spec)

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/products')}
            style={{ marginRight: '16px' }}
          >
            返回
          </Button>
          <Title level={2} className="page-title" style={{ display: 'inline' }}>
            商品详情
          </Title>
        </div>
      </div>

      <Card bordered={false} style={{ marginBottom: '24px' }}>
        <Title level={3}>{product.name || '未命名商品'}</Title>
        <Text type="secondary" style={{ fontSize: '16px', display: 'block', marginBottom: '16px' }}>
          {product.description || '暂无描述'}
        </Text>
        
        {product.type && (
          <div style={{ marginBottom: '16px' }}>
            <Tag color="blue">{product.type}</Tag>
          </div>
        )}

        <Descriptions column={2} bordered>
          <Descriptions.Item label="商品ID">
            <Text code>{product.id || productId}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="价格">
            <Text strong style={{ fontSize: '18px', color: '#00d9ff' }}>
              ¥{product.price || 0}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="交付方式">按需开通</Descriptions.Item>
          <Descriptions.Item label="计费模式">按量计费</Descriptions.Item>
          <Descriptions.Item label="可用区">默认区域</Descriptions.Item>
          <Descriptions.Item label="支持功能">终端连接、弹性扩容</Descriptions.Item>
        </Descriptions>

        <Space style={{ marginTop: '24px' }}>
          <Button 
            type="primary" 
            size="large"
            onClick={handlePurchase}
            loading={purchasing}
            disabled={!token}
          >
            {token ? '立即购买' : '请先登录'}
          </Button>
          <Button size="large" onClick={() => navigate('/products')}>
            返回列表
          </Button>
        </Space>
      </Card>

      {specItems && specItems.length > 0 && (
        <Card bordered={false} style={{ marginBottom: '24px' }}>
          <Title level={4} style={{ marginBottom: '16px' }}>商品规格</Title>
          <Descriptions column={2} bordered>
            {specItems.map((item, index) => (
              <Descriptions.Item key={index} label={item.label}>
                {item.value}
              </Descriptions.Item>
            ))}
          </Descriptions>
        </Card>
      )}

      {product.configJson && (
        <Card bordered={false}>
          <Title level={4} style={{ marginBottom: '16px' }}>配置详情</Title>
          <pre className="code-block">
            {typeof product.configJson === 'string' 
              ? product.configJson 
              : JSON.stringify(product.configJson, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  )
}

export default ProductDetail
