import http from './http'

/**
 * 获取商品列表
 * @param {Object} params - 查询参数
 * @param {number} params.minPrice - 最低价格
 * @param {number} params.maxPrice - 最高价格
 * @param {string} params.type - 商品类型
 * @param {string} params.sortBy - 排序字段
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.pageToken - 分页token
 */
export const listProducts = (params = {}) => {
  return http.get('/products', { params })
}

/**
 * 创建商品
 * @param {Object} data - 商品数据
 * @param {string} data.name - 商品名称
 * @param {string} data.description - 商品描述
 * @param {number} data.price - 价格
 * @param {Object} data.spec - 商品规格
 */
export const createProduct = (data) => {
  return http.post('/products', data)
}

/**
 * 购买商品
 * @param {string} productId - 商品ID
 * @param {string} userId - 用户ID
 */
export const purchaseProduct = (productId, userId) => {
  return http.post(`/products/${productId}/purchase`, {
    productId,
    userId
  })
}

/**
 * 获取商品详情
 * @param {string} productId - 商品ID
 */
export const getProduct = async (productId) => {
  // 暂时用列表接口查询后筛选
  const response = await listProducts()
  const products = response?.data?.products || []
  const product = products.find(p => p.id === productId)
  
  if (!product) {
    throw new Error('Product not found')
  }
  
  return { data: product }
}

/**
 * 获取当前秒杀商品
 */
export const getCurrentSeckill = () => {
  return http.get('/seckill/current')
}
