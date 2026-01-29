/**
 * 使用 SHA-256 对密码进行哈希
 * @param {string} password - 原始密码
 * @returns {Promise<string>} 哈希后的密码（十六进制字符串）
 */
export const hashPassword = async (password) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}
