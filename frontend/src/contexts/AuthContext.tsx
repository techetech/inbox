import { createContext, useContext, useState, ReactNode } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import toast from 'react-hot-toast'
import { authApi } from '../services/api'

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

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'))
  const [initializationError, setInitializationError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  // Query to get current user
  const { data: user, isLoading } = useQuery<User>(
    'currentUser',
    authApi.getProfile,
    {
      enabled: !!token,
      retry: 1,
      staleTime: 5 * 60 * 1000,
      onError: (error: any) => {
        console.error('Auth profile error:', error)
        // If backend is not available or token is invalid, clear it
        localStorage.removeItem('auth_token')
        setToken(null)
        // Set a user-friendly initialization error
        if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
          setInitializationError('Backend server is not available')
        }
      }
    }
  )

  // If there's an initialization error and no token, show it
  if (initializationError && !token) {
    console.warn('Auth initialization error:', initializationError)
    // Clear the error after showing it
    setInitializationError(null)
  }

  const loginMutation = useMutation(authApi.login, {
    onSuccess: (data) => {
      const { token: newToken, user: userData } = data.data
      setToken(newToken)
      localStorage.setItem('auth_token', newToken)
      queryClient.setQueryData('currentUser', userData)
      toast.success('Login successful! Welcome to SecureEmail.')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Login failed')
    }
  })

  const registerMutation = useMutation(authApi.register, {
    onSuccess: () => {
      toast.success('Registration successful! Please log in.')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Registration failed')
    }
  })

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password })
  }

  const register = async (email: string, password: string, name: string) => {
    await registerMutation.mutateAsync({ email, password, name })
  }

  const logout = () => {
    setToken(null)
    localStorage.removeItem('auth_token')
    queryClient.removeQueries()
    toast.success('Logged out successfully')
  }

  return (
    <AuthContext.Provider value={{
      user: user || null,
      login,
      register,
      logout,
      loading: isLoading || loginMutation.isLoading || registerMutation.isLoading
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
