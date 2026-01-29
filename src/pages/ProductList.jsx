import React, { useState, useEffect } from 'react'
import { Card, Tag, Typography, Button, Spin, Empty, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { ThunderboltOutlined, CloudOutlined, RocketOutlined } from '@ant-design/icons'
import { listProducts } from '../services/product'

const { Title, Text, Paragraph } = Typography

const iconMap = {
  GPU: <ThunderboltOutlined style={{ fontSize: '32px', color: '#00d9ff' }} />,
  CPU: <CloudOutlined style={{ fontSize: '32px', color: '#00d9ff' }} />,
  EDGE: <RocketOutlined style={{ fontSize: '32px', color: '#00d9ff' }} />
}

const ProductList = () => {
  const [selectedId, setSelectedId] = useState('')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const response = await listProducts()
      const productList = response?.data?.products || []
      setProducts(productList)
      console.log('Loaded products:', productList)
    } catch (error) {
      console.error('Failed to load products:', error)
      // 如果是401错误，说明需要登录
      if (error.response?.status === 401) {
        message.warning('请先登录以查看商品列表')
      } else {
        message.error('加载商品列表失败')
      }
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    if (!price) return '价格面议'
    return `¥${(price / 100).toFixed(2)}/小时`
  }

  const getProductIcon = (type) => {
    return iconMap[type] || iconMap.CPU
  }

  const getProductTags = (product) => {
    const tags = []
    if (product.type) tags.push(product.type)
    if (product.spec?.cpuCores) tags.push(`${product.spec.cpuCores}核`)
    if (product.spec?.memorySize) tags.push(`${product.spec.memorySize}GB`)
    if (product.spec?.gpu) tags.push(`${product.spec.gpu} GPU`)
    return tags
  }

  const getProductSpecs = (product) => {
    const specs = []
    if (product.spec?.cpuCores) specs.push(`${product.spec.cpuCores} 核 CPU`)
    if (product.spec?.memorySize) specs.push(`${product.spec.memorySize}GB 内存`)
    if (product.spec?.gpu) specs.push(`${product.spec.gpu} GPU`)
    if (product.spec?.diskSize) specs.push(`${product.spec.diskSize}GB 存储`)
    return specs.length > 0 ? specs : ['配置详情请查看详情页']
  }

  if (loading) {
    return (
      <div className="page fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <Title level={2} className="page-title">云资源实例</Title>
          <Paragraph className="page-desc">
            选择适合您业务需求的云计算实例，按需付费，弹性扩展
          </Paragraph>
        </div>
      </div>
      
      {products.length === 0 ? (
        <Empty 
          description="暂无商品" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ marginTop: '48px' }}
        />
      ) : (
        <div className="card-grid">
          {products.map((item) => (
            <Card
              key={item.id}
              className={`product-card ${selectedId === item.id ? 'selected' : ''}`}
              onClick={() => setSelectedId(item.id)}
              bordered={false}
              hoverable
            >
              <div style={{ marginBottom: '20px' }}>
                {getProductIcon(item.type)}
              </div>
              <Title level={4} style={{ marginBottom: '8px', fontSize: '20px' }}>
                {item.name || '未命名商品'}
              </Title>
              <Text type="secondary" style={{ display: 'block', marginBottom: '16px', lineHeight: '1.6' }}>
                {item.description || '暂无描述'}
              </Text>
              
              <div style={{ marginBottom: '16px' }}>
                {getProductSpecs(item).map((spec, idx) => (
                  <div key={idx} style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    • {spec}
                  </div>
                ))}
              </div>

              <div className="product-tags" style={{ marginBottom: '16px' }}>
                {getProductTags(item).map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                <Text strong style={{ fontSize: '18px', color: 'var(--primary)' }}>
                  {formatPrice(item.price)}
                </Text>
                <Button 
                  type="primary" 
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/products/${item.id}`)
                  }}
                >
                  查看详情
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductList

