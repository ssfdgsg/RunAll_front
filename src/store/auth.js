import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      token: '',
      userId: '',
      setAuth: (token, userId) => set({ token: token || '', userId: userId || '' }),
      setToken: (token) => set({ token: token || '' }),
      setUserId: (userId) => set({ userId: userId || '' }),
      clear: () => set({ token: '', userId: '' })
    }),
    {
      name: 'runall-auth-storage'
    }
  )
)

export default useAuthStore

