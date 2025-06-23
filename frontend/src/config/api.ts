// Backend API configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8787',
  ENDPOINTS: {
    EVENTS: {
      LIST: '/events/list',
      DETAILS: (id: string) => `/events/${id}`,
      BOOK_SLOT: (id: string) => `/events/${id}/bookings`,
      CREATE: '/events'
    },
    BOOKINGS: {
      LIST: '/events/bookings'
    }
  }
} as const

// API helper functions
export const apiClient = {
  get: async (endpoint: string) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  },
  
  post: async (endpoint: string, data: Record<string, unknown>) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  }
}
