import React, { useEffect, useRef, useState } from 'react'
import { Card, Button, Typography, message, Alert, Progress, Space, Tag, Spin, Row, Col } from 'antd'
import { ThunderboltOutlined, CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined, FireOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { buy, queryResult } from '../services/seckill'
import { getCurrentSeckill, listProducts } from '../services/product'
import { useAuth } from '../contexts/AuthContext'

const { Title, Text, Paragraph } = Typography

const Seckill = () => {
  const [reqId, setReqId] = useState('')
  const [status, setStatus] = useState('')
  const [info, setInfo] = useState('')
  const [polling, setPolling] = useState(false)
  const [seckillInfo, setSeckillInfo] = useState(null)
  const [productDetail, setProductDetail] = useState(null)
  const [loading, setLoading] = useState(false)
  const [buying, setBuying] = useState(false)
  const timerRef = useRef(null)
  
  const { token, userId } = useAuth()

  // 渲染商品规格标签
  const renderSpecTags = () => {
    if (!productDetail?.spec) return null

    const tags = []
    const spec = productDetail.spec

    // CPU
    if (spec.cpu > 0) {
      tags.push(
        <Tag key="cpu" color="blue" style={{ fontSize: '13px', padding: '4px 12px' }}>
          {spec.cpu} 核 CPU
        </Tag>
      )
    }

    // 内存
    if (spec.memory > 0) {
      tags.push(
        <Tag key="memory" color="green" style={{ fontSize: '13px', padding: '4px 12px' }}>
            {spec.memory}MB 内存
        </Tag>
      )
    }

    // GPU
    if (spec.gpu > 0) {
      tags.push(
        <Tag key="gpu" color="purple" style={{ fontSize: '13px', padding: '4px 12px' }}>
          🎮 {spec.gpu} GPU
        </Tag>
      )
    }

    // 镜像
    if (spec.image) {
      tags.push(
        <Tag key="image" color="geekblue" style={{ fontSize: '13px', padding: '4px 12px' }}>
          {spec.image}
        </Tag>
      )
    }

    // 解析 configJson
    if (spec.configJson) {
      try {
        const config = JSON.parse(spec.configJson)
        if (config.disk) {
          tags.push(
            <Tag key="disk" color="orange" style={{ fontSize: '13px', padding: '4px 12px' }}>
              {config.disk} 存储
            </Tag>
          )
        }
        if (config.bandwidth) {
          tags.push(
            <Tag key="bandwidth" color="cyan" style={{ fontSize: '13px', padding: '4px 12px' }}>
               {config.bandwidth} 带宽
            </Tag>
          )
        }
      } catch (e) {
        console.error('Failed to parse configJson:', e)
      }
    }

    // 类型
    if (productDetail.type) {
      tags.push(
        <Tag key="type" color="magenta" style={{ fontSize: '13px', padding: '4px 12px' }}>
          {productDetail.type}
        </Tag>
      )
    }

    return tags
  }

  // 加载当前秒杀信息和商品详情
  useEffect(() => {
    if (token && userId) {
      loadSeckillInfo()
    }
  }, [token, userId])

  const loadSeckillInfo = async () => {
    setLoading(true)
    try {
      // 1. 获取当前秒杀信息
      const seckillResponse = await getCurrentSeckill()
      console.log('Seckill API response:', seckillResponse)
      
      let seckillData = null
      if (seckillResponse?.data?.products && Array.isArray(seckillResponse.data.products)) {
        seckillData = seckillResponse.data.products[0]
      } else if (Array.isArray(seckillResponse?.data)) {
        seckillData = seckillResponse.data[0]
      } else if (seckillResponse?.data) {
        seckillData = seckillResponse.data
      }
      
      console.log('Parsed seckill data:', seckillData)
      setSeckillInfo(seckillData)
      
      // 2. 如果有商品ID，获取商品详情
      if (seckillData?.productId) {
        try {
          const productsResponse = await listProducts()
          const allProducts = productsResponse?.data?.products || []
          const product = allProducts.find(p => p.id === seckillData.productId)
          console.log('Found product detail:', product)
          setProductDetail(product)
        } catch (error) {
          console.error('Failed to load product detail:', error)
        }
      }
    } catch (error) {
      console.error('Failed to load seckill info:', error)
    } finally {
      setLoading(false)
    }
  }

  const stopPolling = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setPolling(false)
  }

  const startPolling = (nextReqId) => {
    stopPolling()
    if (!nextReqId) {
      return
    }
    setPolling(true)
    timerRef.current = setInterval(async () => {
      try {
        const response = await queryResult(nextReqId)
        const nextStatus = response?.data?.status || ''
        setStatus(nextStatus)
        
        if (nextStatus === 'success' || nextStatus === 'failed') {
          stopPolling()
          setBuying(false)
          if (nextStatus === 'success') {
            message.success('秒杀成功！')
            loadSeckillInfo()
          } else {
            message.error('很遗憾，秒杀失败，商品已售罄')
          }
        }
      } catch (error) {
        setStatus('查询失败')
        stopPolling()
        setBuying(false)
      }
    }, 2000)
  }

  const handleBuy = async () => {
    if (!userId) {
      message.warning('请先登录')
      return
    }

    if (!seckillInfo?.active) {
      message.warning('秒杀活动未开始或已结束')
      return
    }

    if (seckillInfo?.stock === 0) {
      message.error('商品已售罄')
      return
    }

    setBuying(true)
    try {
      const response = await buy(userId)
      const nextReqId = response?.data?.reqId || ''
      const nextInfo = response?.data?.message || '请求已提交'
      setReqId(nextReqId)
      setInfo(nextInfo)
      setStatus('排队中')
      message.success('秒杀请求已提交，正在排队...')
      startPolling(nextReqId)
    } catch (error) {
      message.error('秒杀请求失败')
      setBuying(false)
    }
  }

  useEffect(() => {
    return () => {
      stopPolling()
    }
  }, [])

  if (!token) {
    return (
      <div className="page fade-in">
        <div className="page-header">
          <div>
            <Title level={2} className="page-title">
              <FireOutlined style={{ color: '#ff3366', marginRight: '8px' }} />
              限时秒杀
            </Title>
            <Paragraph className="page-desc">
              抢购热门云资源实例，先到先得
            </Paragraph>
          </div>
        </div>
        <Alert
          message="请先登录"
          description="您需要登录后才能参与秒杀活动"
          type="info"
          showIcon
          style={{ marginTop: '24px' }}
        />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="page fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" tip="加载秒杀信息中..." />
      </div>
    )
  }

  if (!seckillInfo) {
    return (
      <div className="page fade-in">
        <div className="page-header">
          <div>
            <Title level={2} className="page-title">
              <FireOutlined style={{ color: '#ff3366', marginRight: '8px' }} />
              限时秒杀
            </Title>
          </div>
        </div>
        <Card bordered={false} style={{ textAlign: 'center', padding: '60px 20px' }}>
          <ClockCircleOutlined style={{ fontSize: '64px', color: 'var(--text-muted)', marginBottom: '24px' }} />
          <Title level={3}>当前暂无秒杀活动</Title>
          <Paragraph type="secondary">敬请期待下一场秒杀</Paragraph>
          <Button type="primary" onClick={loadSeckillInfo} style={{ marginTop: '16px' }}>
            刷新
          </Button>
        </Card>
      </div>
    )
  }

  const stockPercent = seckillInfo.stock > 0 ? Math.min((seckillInfo.stock / 100) * 100, 100) : 0

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <Title level={2} className="page-title">
            <FireOutlined style={{ color: '#ff3366', marginRight: '8px' }} />
            限时秒杀
          </Title>
          <Paragraph className="page-desc">
            {seckillInfo.active ? '🔥 秒杀进行中，手慢无！' : '⏰ 秒杀已结束'}
          </Paragraph>
        </div>
        <Button onClick={loadSeckillInfo} loading={loading}>
          刷新
        </Button>
      </div>

      {reqId && (
        <Card 
          bordered={false}
          style={{ 
            marginBottom: '24px',
            background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.05), rgba(255, 51, 102, 0.05))',
            border: '1px solid var(--border-bright)'
          }}
        >
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {status === 'success' && <CheckCircleOutlined style={{ fontSize: '32px', color: '#52c41a' }} />}
              {status === 'failed' && <CloseCircleOutlined style={{ fontSize: '32px', color: '#ff4d4f' }} />}
              {polling && <LoadingOutlined style={{ fontSize: '32px', color: 'var(--primary)' }} />}
              <div>
                <Text strong style={{ fontSize: '18px' }}>
                  {status === 'success' ? '🎉 秒杀成功！' : status === 'failed' ? '😢 秒杀失败' : '⏳ 排队中...'}
                </Text>
                {info && (
                  <Text type="secondary" style={{ display: 'block', fontSize: '14px', marginTop: '4px' }}>
                    {info}
                  </Text>
                )}
              </div>
            </div>
            
            {polling && (
              <Progress 
                percent={100} 
                status="active" 
                showInfo={false}
                strokeColor={{
                  from: '#00d9ff',
                  to: '#ff3366',
                }}
              />
            )}

            <div style={{ display: 'flex', gap: '24px', fontSize: '13px', flexWrap: 'wrap' }}>
              <div>
                <Text type="secondary">请求号：</Text>
                <Text code>{reqId}</Text>
              </div>
              <div>
                <Text type="secondary">状态：</Text>
                <Tag color={status === 'success' ? 'success' : status === 'failed' ? 'error' : 'processing'}>
                  {status || '处理中'}
                </Tag>
              </div>
            </div>

            {polling && (
              <Button onClick={stopPolling} size="small">
                停止轮询
              </Button>
            )}
          </Space>
        </Card>
      )}

      <Card 
        bordered={false}
        style={{
          background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.08), rgba(255, 51, 102, 0.08))',
          border: '2px solid var(--border-bright)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {seckillInfo.active && (
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '-35px',
            background: 'linear-gradient(135deg, #ff3366, #ff1a4d)',
            color: '#fff',
            padding: '8px 50px',
            transform: 'rotate(45deg)',
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(255, 51, 102, 0.5)',
            zIndex: 1
          }}>
            HOT
          </div>
        )}

        <Row gutter={[32, 32]}>
          <Col xs={24} md={14}>
            <Space direction="vertical" size={20} style={{ width: '100%' }}>
              <div>
                <Tag color={seckillInfo.active ? 'red' : 'default'} style={{ marginBottom: '12px', fontSize: '13px' }}>
                  {seckillInfo.active ? '🔥 秒杀进行中' : '⏰ 已结束'}
                </Tag>
                <Title level={3} style={{ marginBottom: '8px' }}>
                  {productDetail?.name || `秒杀商品 #${seckillInfo.productId}`}
                </Title>
                <Paragraph type="secondary" style={{ fontSize: '15px', marginBottom: 0 }}>
                  {productDetail?.description || '限时秒杀，数量有限，先到先得！'}
                </Paragraph>
              </div>

              {productDetail?.spec && (
                <div style={{ 
                  padding: '16px', 
                  background: 'rgba(0, 0, 0, 0.2)', 
                  borderRadius: '8px',
                  border: '1px solid var(--border)'
                }}>
                  <Text strong style={{ display: 'block', marginBottom: '12px' }}>商品规格</Text>
                  <Space size={[12, 8]} wrap>
                    {renderSpecTags()}
                  </Space>
                </div>
              )}

              {productDetail?.price && (
                <div style={{ 
                  padding: '20px', 
                  background: 'rgba(0, 217, 255, 0.1)', 
                  borderRadius: '8px',
                  border: '1px solid var(--border-bright)'
                }}>
                  <Row gutter={16} align="middle">
                    <Col>
                      <Text type="secondary" style={{ fontSize: '14px', display: 'block' }}>秒杀价</Text>
                      <Space align="baseline">
                        <Text strong style={{ fontSize: '32px', color: 'var(--primary)' }}>
                          ¥{(productDetail.price / 100).toFixed(2)}
                        </Text>
                        <Text type="secondary">/小时</Text>
                      </Space>
                    </Col>
                    {productDetail.originalPrice && productDetail.originalPrice > productDetail.price && (
                      <Col>
                        <Text type="secondary" style={{ fontSize: '14px', display: 'block' }}>原价</Text>
                        <Text delete type="secondary" style={{ fontSize: '18px' }}>
                          ¥{(productDetail.originalPrice / 100).toFixed(2)}
                        </Text>
                      </Col>
                    )}
                  </Row>
                </div>
              )}
            </Space>
          </Col>

          <Col xs={24} md={10}>
            <Card 
              size="small"
              style={{ 
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <Space direction="vertical" size={24} style={{ width: '100%', textAlign: 'center' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginBottom: '12px' }}>
                    剩余库存
                  </Text>
                  <div style={{ marginBottom: '16px' }}>
                    <Text strong style={{ 
                      fontSize: '48px', 
                      color: seckillInfo.stock > 10 ? 'var(--primary)' : '#ff3366',
                      lineHeight: 1
                    }}>
                      {seckillInfo.stock}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '16px', marginLeft: '8px' }}>件</Text>
                  </div>
                  <Progress 
                    percent={stockPercent} 
                    strokeColor={{
                      '0%': '#00d9ff',
                      '100%': seckillInfo.stock > 10 ? '#00d9ff' : '#ff3366',
                    }}
                    showInfo={false}
                  />
                  {seckillInfo.stock <= 10 && seckillInfo.stock > 0 && (
                    <Text type="danger" style={{ fontSize: '13px', display: 'block', marginTop: '8px' }}>
                      ⚠️ 库存紧张，抓紧抢购！
                    </Text>
                  )}
                </div>

                <Button 
                  type="primary" 
                  size="large"
                  block
                  icon={<ThunderboltOutlined />}
                  onClick={handleBuy}
                  loading={buying}
                  disabled={!seckillInfo.active || seckillInfo.stock === 0 || polling}
                  danger={seckillInfo.stock <= 10 && seckillInfo.stock > 0}
                  style={{ 
                    height: '56px', 
                    fontSize: '18px',
                    fontWeight: 'bold'
                  }}
                >
                  {seckillInfo.stock === 0 ? '已售罄' : buying || polling ? '秒杀中...' : '立即秒杀'}
                </Button>

                {!seckillInfo.active && (
                  <Text type="secondary" style={{ fontSize: '13px' }}>
                    秒杀活动已结束
                  </Text>
                )}
              </Space>
            </Card>
          </Col>
        </Row>
      </Card>

      <Alert
        message="秒杀规则"
        description="点击「立即秒杀」按钮参与抢购，系统将自动为您排队。秒杀商品数量有限，先到先得，售完即止。请耐心等待结果，不要重复提交。"
        type="info"
        showIcon
        style={{ marginTop: '24px' }}
      />
    </div>
  )
}

export default Seckill
