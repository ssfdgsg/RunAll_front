import http from './http'

export const buy = (uid) => {
  return http.post('/seckill/buy', { uid })
}

export const queryResult = (reqId) => {
  return http.get(`/seckill/result/${reqId}`)
}
