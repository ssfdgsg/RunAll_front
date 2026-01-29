import http from './http'

/**
 * 获取订单列表
 * @param {Object} params - 查询参数
 * @param {string} params.status - 订单状态
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.pageToken - 分页token
 */
export const listOrders = (params = {}) => {
  return http.get('/orders', { params })
}

/**
 * 获取订单详情
 * @param {string} orderId - 订单ID
 */
export const getOrder = (orderId) => {
  return http.get(`/orders/${orderId}`)
}

/**
 * 获取订单关联的资源
 * @param {string} orderId - 订单ID
 */
export const getOrderResource = (orderId) => {
  return http.get(`/orders/${orderId}/resource`)
}
