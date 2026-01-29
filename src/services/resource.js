import http from './http'

export const listResources = (userId, start, end, type) => {
  return http.get(`/users/${userId}/resources`, {
    params: {
      start: start || undefined,
      end: end || undefined,
      type: type || undefined
    }
  })
}
