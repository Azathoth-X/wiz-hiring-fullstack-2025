import { create } from 'zustand'
import { jwtDecode } from 'jwt-decode'

interface User {
  id: string,
  username: string,
  name?: string
}

interface UserState {
  user: User | null,
  isAuthenticated: boolean,
  setUser: (user: User | null) => void,
  loadUserFromToken: () => void
  logout: () => void,
  getToken: () => string | null
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  loadUserFromToken: () => {
    try {
      const token = localStorage.getItem('bookmyslot_token')
      if (token) {
        const decoded = jwtDecode<User>(token)
        set({ user: decoded, isAuthenticated: true })
      } else {
        set({ user: null, isAuthenticated: false })
      }
    } catch (error) {
      console.error('Failed to decode token:', error)
      set({ user: null, isAuthenticated: false })
      localStorage.removeItem('bookmyslot_token')
    }
  },

  logout: () => {
    localStorage.removeItem('bookmyslot_token')
    set({ user: null, isAuthenticated: false })
  },

  getToken: () => {
    return localStorage.getItem('bookmyslot_token')
  },
}))

// Initialize user from token on store creation
useUserStore.getState().loadUserFromToken()
