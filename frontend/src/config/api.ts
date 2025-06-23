// Backend API configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL||'https://bookmyslot.tankkmaster25.workers.dev/v1',
  ENDPOINTS: {
    EVENTS: {
      LIST: '/events/list',
      DETAILS: (id: string) => `/events/details/${id}`,
      BOOK_SLOT: (id: string) => `/events/${id}/bookings`,
      CREATE: '/events'
    },
    BOOKINGS: {
      LIST: '/events/bookings'
    }
  }
} as const

// Helper function to get auth headers
const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  const token = localStorage.getItem('bookmyslot_token')
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  return headers
}

// API helper functions
export const apiClient = {
  get: async (endpoint: string) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  },
  post: async (endpoint: string, data: Record<string, unknown>) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    
    const responseData = await response.json()
    
    if (!response.ok) {
      if (endpoint.includes('/users/signin') || endpoint.includes('/users/signup')) {
        throw { status: response.status, data: responseData }
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return responseData
  }
}
