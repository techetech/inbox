import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Shield, Mail, Lock } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../components/UI/LoadingSpinner'

interface LoginForm {
  email: string
  password: string
}

export default function LoginPage() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password)
      navigate('/dashboard')
    } catch (error) {
      // Error is handled by the auth context
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg matrix-bg animate-matrix flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center">
              <Shield className="w-12 h-12 text-neon-green mr-3" />
              <span className="text-3xl font-cyber font-bold neon-text">SecureEmail</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-dark-text mb-2">
            Access Secure Terminal
          </h2>
          <p className="text-dark-muted">
            Enter your credentials to access the cyber protection platform
          </p>
        </div>

        {/* Login Form */}
        <div className="cyber-card rounded-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-text mb-2">
                <Mail className="inline w-4 h-4 mr-2" />
                Email Address
              </label>
              <input
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@([A-Z0-9.-]+\.[A-Z]{2,}|localhost)$/i,
                    message: 'Invalid email address'
                  }
                })}
                type="email"
                className="cyber-input w-full px-3 py-2 rounded-md"
                placeholder="user@secure.local"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-neon-pink">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark-text mb-2">
                <Lock className="inline w-4 h-4 mr-2" />
                Password
              </label>
              <input
                {...register('password', { required: 'Password is required' })}
                type="password"
                className="cyber-input w-full px-3 py-2 rounded-md"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-neon-pink">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full cyber-button py-3 rounded-md font-medium flex items-center justify-center"
            >
              {loading ? (
                <LoadingSpinner size="small" />
              ) : (
                'Initialize Connection'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-dark-muted">
              Need access credentials?{' '}
              <Link to="/register" className="text-cyber-400 hover:text-cyber-300 font-medium">
                Request Access
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-dark-muted">
          <p>SecureEmail v1.0 • Cyber Protection Platform</p>
          <p className="mt-1">Unauthorized access is prohibited</p>
        </div>
      </div>
    </div>
  )
}
