import { Bell, Search } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-dark-surface border-b border-dark-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-muted" />
            <input
              type="text"
              placeholder="Search emails..."
              className="w-full pl-10 pr-4 py-2 bg-dark-bg border border-dark-border rounded-md text-dark-text placeholder-dark-muted focus:border-cyber-500 focus:ring-1 focus:ring-cyber-500 transition-colors duration-200"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-dark-muted hover:text-cyber-400 transition-colors duration-200">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-neon-pink rounded-full"></span>
          </button>
          
          <div className="text-right">
            <div className="text-sm text-dark-text">
              System Status: <span className="text-neon-green">SECURE</span>
            </div>
            <div className="text-xs text-dark-muted">
              Last scan: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
