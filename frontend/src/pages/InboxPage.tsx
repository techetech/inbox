import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Mail, Calendar, User, Shield, AlertTriangle, CheckCircle, Trash2, Reply, Forward, ReplyAll } from 'lucide-react'
import { mailApi } from '../services/api'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

interface EmailMessage {
  id: string
  from_email: string
  subject: string
  received_at: string
  status: string
  spf_result?: string
  dkim_result?: string
  dmarc_result?: string
  body_text?: string
}

export default function InboxPage() {
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'reply' | 'forward'>('list')
  const [replyText, setReplyText] = useState('')
  const [forwardRecipients, setForwardRecipients] = useState('')
  const [forwardText, setForwardText] = useState('')
  const [replyAll, setReplyAll] = useState(false)
  
  const queryClient = useQueryClient()

  const { data: inboxData, isLoading, error } = useQuery({
    queryKey: ['inbox'],
    queryFn: mailApi.getInbox
  })

  const replyMutation = useMutation(
    ({ messageId, body, replyAll }: { messageId: string; body: string; replyAll: boolean }) =>
      mailApi.replyToMail(messageId, { body, replyAll }),
    {
      onSuccess: () => {
        toast.success('Reply sent successfully!')
        queryClient.invalidateQueries(['inbox'])
        setViewMode('detail')
        setReplyText('')
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to send reply')
      }
    }
  )

  const forwardMutation = useMutation(
    ({ messageId, to, body }: { messageId: string; to: string[]; body?: string }) =>
      mailApi.forwardMail(messageId, { to, body }),
    {
      onSuccess: () => {
        toast.success('Message forwarded successfully!')
        queryClient.invalidateQueries(['inbox'])
        setViewMode('detail')
        setForwardText('')
        setForwardRecipients('')
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to forward message')
      }
    }
  )

  const deleteMutation = useMutation(mailApi.deleteMail, {
    onSuccess: () => {
      toast.success('Message deleted successfully!')
      queryClient.invalidateQueries(['inbox'])
      setViewMode('list')
      setSelectedEmail(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete message')
    }
  })

  const messages = inboxData?.messages || []

  const getSecurityStatus = (message: EmailMessage) => {
    const spf = message.spf_result === 'pass'
    const dkim = message.dkim_result === 'pass'  
    const dmarc = message.dmarc_result === 'pass'
    
    if (spf && dkim && dmarc) return { status: 'secure', color: 'text-neon-green', icon: CheckCircle }
    if (spf || dkim) return { status: 'warning', color: 'text-neon-orange', icon: AlertTriangle }
    return { status: 'risk', color: 'text-neon-pink', icon: AlertTriangle }
  }

  const handleEmailSelect = (message: EmailMessage) => {
    setSelectedEmail(message)
    setViewMode('detail')
  }

  const handleBackToList = () => {
    setSelectedEmail(null)
    setViewMode('list')
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-cyber font-bold text-dark-text">Secure Inbox</h1>
        <div className="cyber-card rounded-lg p-8 text-center">
          <div className="animate-pulse">
            <p className="text-dark-muted">Loading emails...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-cyber font-bold text-dark-text">Secure Inbox</h1>
        <div className="cyber-card rounded-lg p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-neon-pink mx-auto mb-4" />
          <p className="text-neon-pink">Failed to load emails</p>
        </div>
      </div>
    )
  }

  if (viewMode === 'detail' && selectedEmail) {
    const security = getSecurityStatus(selectedEmail)
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBackToList}
            className="cyber-button text-sm"
          >
            ← Back to Inbox
          </button>
          <div className="flex space-x-2">
            <button 
              onClick={() => {
                setReplyAll(false)
                setViewMode('reply')
              }}
              className="cyber-button text-sm"
            >
              <Reply className="w-4 h-4 mr-2" />
              Reply
            </button>
            <button 
              onClick={() => {
                setReplyAll(true)
                setViewMode('reply')
              }}
              className="cyber-button text-sm"
            >
              <ReplyAll className="w-4 h-4 mr-2" />
              Reply All
            </button>
            <button 
              onClick={() => setViewMode('forward')}
              className="cyber-button text-sm"
            >
              <Forward className="w-4 h-4 mr-2" />
              Forward
            </button>
            <button 
              onClick={() => deleteMutation.mutate(selectedEmail.id)}
              className="cyber-button text-sm text-neon-pink border-neon-pink"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        </div>

        <div className="cyber-card rounded-lg p-6">
          <div className="border-b border-dark-border pb-4 mb-6">
            <h1 className="text-2xl font-cyber font-bold text-dark-text mb-4">
              {selectedEmail.subject || 'No Subject'}
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2 text-cyber-400" />
                <span className="text-dark-muted">From:</span>
                <span className="ml-2 text-dark-text">{selectedEmail.from_email}</span>
              </div>
              
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-cyber-400" />
                <span className="text-dark-muted">Received:</span>
                <span className="ml-2 text-dark-text">
                  {formatDistanceToNow(new Date(selectedEmail.received_at), { addSuffix: true })}
                </span>
              </div>
              
              <div className="flex items-center">
                <security.icon className={`w-4 h-4 mr-2 ${security.color}`} />
                <span className="text-dark-muted">Security:</span>
                <span className={`ml-2 font-medium ${security.color}`}>
                  {security.status.toUpperCase()}
                </span>
              </div>
              
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-cyber-400" />
                <span className="text-dark-muted">Status:</span>
                <span className="ml-2 text-dark-text capitalize">{selectedEmail.status}</span>
              </div>
            </div>
          </div>

          <div className="prose prose-invert max-w-none">
            <div className="bg-dark-bg/50 rounded-lg p-4 font-mono text-sm">
              {selectedEmail.body_text || 'No content available'}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-cyber font-bold text-dark-text">
          Secure Inbox
        </h1>
        <div className="flex items-center space-x-4">
          <span className="text-dark-muted text-sm">
            {messages.length} messages
          </span>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="cyber-card rounded-lg p-8 text-center">
          <Mail className="w-16 h-16 text-dark-muted mx-auto mb-4" />
          <p className="text-dark-muted">No emails in your inbox</p>
        </div>
      ) : (
        <div className="cyber-card rounded-lg overflow-hidden">
          <div className="divide-y divide-dark-border">
            {messages.map((message: EmailMessage) => {
              const security = getSecurityStatus(message)
              
              return (
                <div
                  key={message.id}
                  onClick={() => handleEmailSelect(message)}
                  className="email-item p-4 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center mb-2">
                        <security.icon className={`w-4 h-4 mr-2 flex-shrink-0 ${security.color}`} />
                        <span className="text-dark-text font-medium truncate">
                          {message.from_email}
                        </span>
                        <span className="ml-auto text-xs text-dark-muted">
                          {formatDistanceToNow(new Date(message.received_at), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <h3 className="text-dark-text font-medium mb-2 truncate">
                        {message.subject || 'No Subject'}
                      </h3>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-xs">
                          <span className={`security-badge ${
                            message.status === 'quarantined' 
                              ? 'bg-neon-pink/20 text-neon-pink' 
                              : 'bg-neon-green/20 text-neon-green'
                          }`}>
                            {message.status.toUpperCase()}
                          </span>
                          
                          {message.spf_result && (
                            <span className={`security-badge ${
                              message.spf_result === 'pass' 
                                ? 'bg-neon-green/20 text-neon-green' 
                                : 'bg-neon-orange/20 text-neon-orange'
                            }`}>
                              SPF: {message.spf_result}
                            </span>
                          )}
                          
                          {message.dkim_result && (
                            <span className={`security-badge ${
                              message.dkim_result === 'pass' 
                                ? 'bg-neon-green/20 text-neon-green' 
                                : 'bg-neon-orange/20 text-neon-orange'
                            }`}>
                              DKIM: {message.dkim_result}
                            </span>
                          )}
                        </div>
                        
                        <Shield className={`w-5 h-5 ${security.color}`} />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
      
      {viewMode === 'reply' && selectedEmail && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setViewMode('detail')}
              className="cyber-button text-sm"
            >
              ← Back to Message
            </button>
            <h1 className="text-xl font-cyber font-bold text-dark-text">
              {replyAll ? 'Reply All' : 'Reply'}
            </h1>
          </div>
          
          <div className="cyber-card rounded-lg p-6 space-y-4">
            <div className="border-b border-dark-border pb-4">
              <p className="text-dark-muted text-sm">Replying to:</p>
              <p className="text-dark-text font-medium">{selectedEmail.subject}</p>
              <p className="text-dark-muted text-sm">From: {selectedEmail.from_email}</p>
            </div>
            
            <div>
              <label className="block text-dark-text font-medium mb-2">
                Your Reply:
              </label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full h-40 px-4 py-3 bg-dark-surface border border-dark-border rounded-lg 
                          text-dark-text placeholder-dark-muted focus:outline-none focus:border-cyber-400 
                          focus:ring-1 focus:ring-cyber-400/50 resize-none"
                placeholder="Type your reply here..."
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setViewMode('detail')
                  setReplyText('')
                }}
                type="button"
                className="px-6 py-2 border border-dark-border text-dark-muted hover:text-dark-text 
                          hover:border-dark-text transition-colors rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (replyText.trim()) {
                    replyMutation.mutate({
                      messageId: selectedEmail.id,
                      body: replyText,
                      replyAll
                    })
                  }
                }}
                disabled={!replyText.trim() || replyMutation.isLoading}
                className="cyber-button disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {replyMutation.isLoading ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {viewMode === 'forward' && selectedEmail && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setViewMode('detail')}
              className="cyber-button text-sm"
            >
              ← Back to Message
            </button>
            <h1 className="text-xl font-cyber font-bold text-dark-text">Forward Message</h1>
          </div>
          
          <div className="cyber-card rounded-lg p-6 space-y-4">
            <div className="border-b border-dark-border pb-4">
              <p className="text-dark-muted text-sm">Forwarding:</p>
              <p className="text-dark-text font-medium">{selectedEmail.subject}</p>
              <p className="text-dark-muted text-sm">From: {selectedEmail.from_email}</p>
            </div>
            
            <div>
              <label className="block text-dark-text font-medium mb-2">
                To: <span className="text-neon-pink">*</span>
              </label>
              <input
                type="email"
                value={forwardRecipients}
                onChange={(e) => setForwardRecipients(e.target.value)}
                className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg 
                          text-dark-text placeholder-dark-muted focus:outline-none focus:border-cyber-400 
                          focus:ring-1 focus:ring-cyber-400/50"
                placeholder="recipient@example.com (separate multiple emails with commas)"
                required
              />
            </div>
            
            <div>
              <label className="block text-dark-text font-medium mb-2">
                Additional Message (optional):
              </label>
              <textarea
                value={forwardText}
                onChange={(e) => setForwardText(e.target.value)}
                className="w-full h-32 px-4 py-3 bg-dark-surface border border-dark-border rounded-lg 
                          text-dark-text placeholder-dark-muted focus:outline-none focus:border-cyber-400 
                          focus:ring-1 focus:ring-cyber-400/50 resize-none"
                placeholder="Add a message to include with the forwarded email..."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setViewMode('detail')
                  setForwardText('')
                  setForwardRecipients('')
                }}
                type="button"
                className="px-6 py-2 border border-dark-border text-dark-muted hover:text-dark-text 
                          hover:border-dark-text transition-colors rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const recipients = forwardRecipients
                    .split(',')
                    .map(email => email.trim())
                    .filter(email => email.length > 0)
                  
                  if (recipients.length > 0) {
                    forwardMutation.mutate({
                      messageId: selectedEmail.id,
                      to: recipients,
                      body: forwardText.trim() || undefined
                    })
                  }
                }}
                disabled={!forwardRecipients.trim() || forwardMutation.isLoading}
                className="cyber-button disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {forwardMutation.isLoading ? 'Forwarding...' : 'Forward Message'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
