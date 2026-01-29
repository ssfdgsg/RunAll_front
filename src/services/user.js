import http from './http'

export const login = (payload) => {
  return http.post('/users/login', {
    email: payload.email,
    password: payload.password
  })
}

export const register = (payload) => {
  return http.post('/users/register', {
    email: payload.email,
    password: payload.password,
    nickname: payload.nickname
  })
}

export const getUser = (userId) => {
  return http.get(`/users/${userId}`)
}
