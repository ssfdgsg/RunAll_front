import http from './http'

/**
 * 设置实例端口转发
 * @param {string} instanceId - 实例ID
 * @param {boolean} open - 是否开启端口转发
 * @param {Array} portConfigs - 端口配置列表
 * @param {number} portConfigs[].port - 端口号
 * @param {string} portConfigs[].protocol - 协议 (tcp/udp/http)
 * @param {string} portConfigs[].ingressDomain - Ingress域名（可选）
 * @returns {Promise} 返回设置结果
 */
export const setInstancePorts = (instanceId, open, portConfigs) => {
  return http.post(`/instances/${instanceId}/ports`, {
    instanceId,
    open,
    portConfigs
  })
}

