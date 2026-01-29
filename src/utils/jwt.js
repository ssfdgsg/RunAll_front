/**
 * 解析JWT Token获取payload
 * @param {string} token - JWT token
 * @returns {object|null} payload对象，解析失败返回null
 */
export const parseJWT = (token) => {
  if (!token) return null
  
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      console.error('Invalid JWT format')
      return null
    }
    
    const payload = JSON.parse(atob(parts[1]))
    console.log('JWT Payload:', payload)
    return payload
  } catch (error) {
    console.error('Failed to parse JWT:', error)
    return null
  }
}

/**
 * 从JWT中提取用户ID
 * @param {string} token - JWT token
 * @returns {string} 用户ID，失败返回空字符串
 */
export const extractUserId = (token) => {
  const payload = parseJWT(token)
  if (!payload) return ''
  
  // 优先使用 user_id (UUID)，其次是其他字段
  const userId = payload.user_id ||
                 payload.userId || 
                 payload.uid ||
                 payload.id ||
                 payload.sub ||
                 ''
  
  console.log('Extracted userId:', userId)
  return userId
}
