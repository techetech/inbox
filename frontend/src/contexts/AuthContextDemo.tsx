import { createContext, useContext, useState, ReactNode } from 'react'
import toast from 'react-hot-toast'

interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

// Demo mode - bypasses backend for frontend testing
const DEMO_MODE = true

const demoUsers = {
  'admin@demo.com': {
    id: '1',
    email: 'admin@demo.com',
    name: 'Admin User',
    role: 'admin' as const,
    password: 'admin123'
  },
  'user@demo.com': {
    id: '2', 
    email: 'user@demo.com',
    name: 'Regular User',
    role: 'user' as const,
    password: 'user123'
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(
    DEMO_MODE ? JSON.parse(localStorage.getItem('demo_user') || 'null') : null
  )
  const [loading, setLoading] = useState(false)

  const login = async (email: string, password: string) => {
    setLoading(true)
    
    if (DEMO_MODE) {
      // Demo login
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      const demoUser = demoUsers[email as keyof typeof demoUsers]
      if (demoUser && demoUser.password === password) {
        const userData = {
          id: demoUser.id,
          email: demoUser.email,
          name: demoUser.name,
          role: demoUser.role
        }
        setUser(userData)
        localStorage.setItem('demo_user', JSON.stringify(userData))
        toast.success(`Welcome ${demoUser.name}! (Demo Mode)`)
      } else {
        toast.error('Invalid credentials. Valid options:\n• admin@demo.com / admin123 (Admin)\n• user@demo.com / user123 (User)')
        throw new Error('Invalid credentials')
      }
    } else {
      // Real API call would go here
      toast.error('Backend not configured. Set DEMO_MODE to true for testing.')
      throw new Error('Backend not available')
    }
    
    setLoading(false)
  }

  const register = async (email: string, password: string, name: string) => {
    setLoading(true)
    
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Demo registration:', { email, password, name })
      toast.success('Demo registration complete! Use existing credentials:\n• admin@demo.com / admin123 (Admin)\n• user@demo.com / user123 (User)')
    } else {
      toast.error('Backend not configured')
      throw new Error('Backend not available')
    }
    
    setLoading(false)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('demo_user')
    toast.success('Logged out successfully')
  }

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
