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

export default function LoginPage() {
  const [formData, setFormData] = useState({
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields")
      return
    }    setIsLoading(true)
    setError("")

    try {
      const data = await apiClient.post('/users/signin', formData)
      
      // Store JWT token in localStorage
      localStorage.setItem('bookmyslot_token', data.token)
      
      // Load user from token
      loadUserFromToken()
      
      // Redirect to events page
      navigate('/events')    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'status' in err && 'data' in err) {
        // This is an HTTP error with response data
        const errorData = err as { status: number; data: { error?: string } }
        setError(errorData.data.error || 'Login failed')
      } else if (err instanceof Error && err.message.includes('HTTP error')) {
        setError('Invalid email or password')
      } else {
        setError('Network error. Please try again.')
      }
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Login to your account</CardTitle>
            <CardDescription>
              Enter your email below to login to your account
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
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input 
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div className="flex flex-col gap-3">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Login"}
                  </Button>
                  <Button variant="outline" className="w-full" type="button" disabled={isLoading}>
                    Login with Google
                  </Button>
                </div>
              </div>
              
              <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link to="/signup" className="underline underline-offset-4 hover:text-primary">
                  Sign up
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
