interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  className?: string
}

export default function LoadingSpinner({ size = 'medium', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8', 
    large: 'w-12 h-12'
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-cyber-500 border-t-transparent ${sizeClasses[size]}`} />
    </div>
  )
}
