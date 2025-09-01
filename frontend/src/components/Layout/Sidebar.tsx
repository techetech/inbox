import { NavLink } from 'react-router-dom'
import { 
  Shield,
  Mail,
  MailPlus, 
  Settings,
  BarChart3,
  AlertTriangle,
  LogOut
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Inbox', href: '/inbox', icon: Mail },
  { name: 'Compose', href: '/compose', icon: MailPlus },
  { name: 'Settings', href: '/settings', icon: Settings },
]

const adminNavigation = [
  { name: 'Admin Panel', href: '/admin', icon: AlertTriangle },
]

export default function Sidebar() {
  const { user, logout } = useAuth()

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-dark-surface border-r border-dark-border">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center px-6 py-4 border-b border-dark-border">
          <Shield className="w-8 h-8 text-neon-green mr-3" />
          <span className="text-xl font-cyber font-bold neon-text">SecureEmail</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                      isActive
                        ? 'bg-cyber-500/20 text-cyber-400 border border-cyber-500'
                        : 'text-dark-muted hover:text-cyber-400 hover:bg-dark-card'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </NavLink>
              </li>
            ))}
            
            {user?.role === 'admin' && (
              <>
                <li className="pt-4">
                  <div className="text-xs font-semibold text-dark-muted uppercase tracking-wider mb-2">
                    Admin
                  </div>
                </li>
                {adminNavigation.map((item) => (
                  <li key={item.name}>
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                          isActive
                            ? 'bg-neon-pink/20 text-neon-pink border border-neon-pink'
                            : 'text-dark-muted hover:text-neon-pink hover:bg-dark-card'
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </NavLink>
                  </li>
                ))}
              </>
            )}
          </ul>
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-dark-border">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-cyber-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-sm font-bold text-dark-bg">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-dark-text truncate">
                {user?.name}
              </p>
              <p className="text-xs text-dark-muted truncate">
                {user?.email}
              </p>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-dark-muted hover:text-neon-pink hover:bg-dark-card rounded-md transition-colors duration-200"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
