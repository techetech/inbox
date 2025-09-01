import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Shield, Mail, Lock, User } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../components/UI/LoadingSpinner'

interface RegisterForm {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export default function RegisterPage() {
  const { register: registerUser, loading } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterForm>()
  const password = watch('password')

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerUser(data.email, data.password, data.name)
      navigate('/login')
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
            Request Access
          </h2>
          <p className="text-dark-muted">
            Create your account to join the secure email platform
          </p>
        </div>

        {/* Register Form */}
        <div className="cyber-card rounded-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-dark-text mb-2">
                <User className="inline w-4 h-4 mr-2" />
                Full Name
              </label>
              <input
                {...register('name', { required: 'Name is required' })}
                type="text"
                className="cyber-input w-full px-3 py-2 rounded-md"
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-neon-pink">{errors.name.message}</p>
              )}
            </div>

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
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters'
                  }
                })}
                type="password"
                className="cyber-input w-full px-3 py-2 rounded-md"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-neon-pink">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-dark-text mb-2">
                <Lock className="inline w-4 h-4 mr-2" />
                Confirm Password
              </label>
              <input
                {...register('confirmPassword', { 
                  required: 'Please confirm your password',
                  validate: value => value === password || 'Passwords do not match'
                })}
                type="password"
                className="cyber-input w-full px-3 py-2 rounded-md"
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-neon-pink">{errors.confirmPassword.message}</p>
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
                'Request Access'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-dark-muted">
              Already have access?{' '}
              <Link to="/login" className="text-cyber-400 hover:text-cyber-300 font-medium">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-dark-muted">
          <p>SecureEmail v1.0 • Cyber Protection Platform</p>
          <p className="mt-1">All access requests are reviewed and approved</p>
        </div>
      </div>
    </div>
  )
}
