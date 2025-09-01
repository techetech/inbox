import { useQuery } from 'react-query'
import { Shield, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { mailApi } from '../services/api'

interface EmailMessage {
  id: string
  from_email: string
  subject: string
  received_at: string
  status: string
  spf_result?: string
  dkim_result?: string
  dmarc_result?: string
}

export default function DashboardPage() {
  const { data: inboxData } = useQuery('inbox', mailApi.getInbox)

  const messages: EmailMessage[] = inboxData?.messages || []
  const threatCount = messages.filter((m: EmailMessage) => m.status === 'quarantined').length
  const cleanCount = messages.filter((m: EmailMessage) => m.status === 'delivered').length
  const totalMessages = messages.length

  const stats = [
    {
      name: 'Total Messages',
      value: totalMessages,
      icon: Shield,
      color: 'text-cyber-400',
      bg: 'bg-cyber-500/20'
    },
    {
      name: 'Threats Blocked',
      value: threatCount,
      icon: AlertTriangle,
      color: 'text-neon-pink',
      bg: 'bg-neon-pink/20'
    },
    {
      name: 'Clean Messages',
      value: cleanCount,
      icon: CheckCircle,
      color: 'text-neon-green',
      bg: 'bg-neon-green/20'
    },
    {
      name: 'Security Score',
      value: totalMessages > 0 ? `${Math.round((cleanCount / totalMessages) * 100)}%` : '100%',
      icon: TrendingUp,
      color: 'text-neon-blue',
      bg: 'bg-neon-blue/20'
    }
  ]

  // Get recent quarantined messages as threats
  const recentThreats = messages
    .filter((m: EmailMessage) => m.status === 'quarantined')
    .slice(0, 3)
    .map((message: EmailMessage) => ({
      type: 'Phishing',
      sender: message.from_email,
      time: formatDistanceToNow(new Date(message.received_at), { addSuffix: true }),
      threat: 'High'
    }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-cyber font-bold text-dark-text mb-2">
          Security Dashboard
        </h1>
        <p className="text-dark-muted">
          Real-time monitoring of your email security status
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="cyber-card p-6 rounded-lg">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-dark-muted">{stat.name}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Threats */}
        <div className="cyber-card rounded-lg p-6">
          <h3 className="text-lg font-semibold text-dark-text mb-4">
            Recent Threats Detected
          </h3>
          <div className="space-y-3">
            {recentThreats.map((threat: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-dark-bg rounded-md">
                <div>
                  <p className="text-sm font-medium text-dark-text">{threat.type}</p>
                  <p className="text-xs text-dark-muted">{threat.sender}</p>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-medium ${
                    threat.threat === 'Critical' ? 'text-neon-pink' :
                    threat.threat === 'High' ? 'text-neon-orange' :
                    'text-neon-green'
                  }`}>
                    {threat.threat}
                  </p>
                  <p className="text-xs text-dark-muted">{threat.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="cyber-card rounded-lg p-6">
          <h3 className="text-lg font-semibold text-dark-text mb-4">
            System Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-dark-muted">Antivirus Engine</span>
              <span className="text-sm text-neon-green">ACTIVE</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-dark-muted">URL Scanner</span>
              <span className="text-sm text-neon-green">ACTIVE</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-dark-muted">DMARC Verification</span>
              <span className="text-sm text-neon-green">ACTIVE</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-dark-muted">Quarantine System</span>
              <span className="text-sm text-neon-green">ACTIVE</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-dark-muted">Last Signature Update</span>
              <span className="text-sm text-dark-text">5 min ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
