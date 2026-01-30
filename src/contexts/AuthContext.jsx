import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [userId, setUserId] = useState(() => localStorage.getItem('userId'))
  const [userInfo, setUserInfo] = useState(null)

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  }, [token])

  useEffect(() => {
    if (userId) {
      localStorage.setItem('userId', userId)
    } else {
      localStorage.removeItem('userId')
    }
  }, [userId])

  const login = (newToken, newUserId) => {
    setToken(newToken)
    setUserId(newUserId)
  }

  const logout = () => {
    setToken(null)
    setUserId(null)
    setUserInfo(null)
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
  }

  const value = {
    token,
    userId,
    userInfo,
    setToken,
    setUserId,
    setUserInfo,
    login,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
