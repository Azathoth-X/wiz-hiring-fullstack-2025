import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUserStore } from "@/stores/user-store"
import { apiClient } from "@/config/api"

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
  const navigate = useNavigate()
  const { loadUserFromToken, isAuthenticated } = useUserStore()

  useEffect(() => {
    // Try to load user from token on mount
    loadUserFromToken()
  }, [loadUserFromToken])

  useEffect(() => {
    // Redirect to events if already authenticated
    if (isAuthenticated) {
      navigate('/events')
    }
  }, [isAuthenticated, navigate])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (error) setError("")
  }

  const validateForm = () => {
    if (!formData.name || !formData.username || !formData.email || !formData.password) {
      return "Please fill in all fields"
    }
    
    if (formData.name.length < 2) {
      return "Name must be at least 2 characters long"
    }
    
    if (formData.username.length < 3) {
      return "Username must be at least 3 characters long"
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      return "Username must contain only letters, numbers, and underscores"
    }
    
    if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
      return "Name must contain only letters and spaces"
    }
    
    if (formData.password.length < 8) {
      return "Password must be at least 8 characters long"
    }
    
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      return "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    }
    
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }    setIsLoading(true)
    setError("")

    try {
      const data = await apiClient.post('/users/signup', formData)
      
      // Store JWT token in localStorage
      localStorage.setItem('bookmyslot_token', data.token)
      
      // Load user from token
      loadUserFromToken()
      
      // Redirect to events page
      navigate('/events')
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'status' in err && 'data' in err) {
        // This is an HTTP error with response data
        const errorData = err as { status: number; data: { error?: string } }
        setError(errorData.data.error || 'Signup failed')
      } else if (err instanceof Error && err.message.includes('HTTP error')) {
        setError('Signup failed')
      } else {
        setError('Network error. Please try again.')      }
      console.error('Signup error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Create an account</CardTitle>
            <CardDescription>
              Enter your information below to create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {error}
                  </div>
                )}
                
                <div className="grid gap-3">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div className="grid gap-3">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="johndoe"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div className="grid gap-3">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Must be at least 8 characters with uppercase, lowercase, and number
                  </p>
                </div>
                
                <div className="flex flex-col gap-3">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create account"}
                  </Button>
                </div>
              </div>
              
              <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link to="/login" className="underline underline-offset-4 hover:text-primary">
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
