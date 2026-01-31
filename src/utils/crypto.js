import CryptoJS from 'crypto-js'

/**
 * 使用 SHA-256 对密码进行哈希
 * @param {string} password - 原始密码
 * @returns {string} 哈希后的密码（十六进制字符串）
 */
export const hashPassword = (password) => {
  return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex)
}
