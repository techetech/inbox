import { useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { Send, X, UserPlus, Paperclip, Shield, CheckCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { mailApi } from '../services/api'

interface ComposeFormData {
  to: string
  cc?: string
  bcc?: string
  subject: string
  body: string
}

export default function ComposePage() {
  const [ccVisible, setCcVisible] = useState(false)
  const [bccVisible, setBccVisible] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<ComposeFormData>()

  const sendMailMutation = useMutation(mailApi.sendMail, {
    onSuccess: () => {
      toast.success('Email sent successfully!')
      queryClient.invalidateQueries(['inbox'])
      reset()
      navigate('/inbox')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send email')
    }
  })

  const onSubmit = (data: ComposeFormData) => {
    // Parse recipients
    const to = data.to.split(',').map(email => email.trim()).filter(Boolean)
    
    if (to.length === 0) {
      toast.error('Please enter at least one recipient')
      return
    }

    sendMailMutation.mutate({
      to: to.length === 1 ? to[0] : to,
      subject: data.subject,
      body: data.body
    })
  }

  const validateEmail = (email: string) => {
    const emails = email.split(',').map(e => e.trim())
    return emails.every(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) || 'Invalid email format'
  }

  const watchedFields = watch()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-cyber font-bold text-dark-text">
          Compose Email
        </h1>
        <button
          onClick={() => navigate('/inbox')}
          className="cyber-button text-sm"
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="cyber-card rounded-lg p-6">
          {/* Recipients */}
          <div className="space-y-4">
            {/* To Field */}
            <div>
              <label className="block text-sm font-medium text-dark-text mb-2">
                <UserPlus className="w-4 h-4 inline mr-2" />
                To *
              </label>
              <input
                type="text"
                {...register('to', { 
                  required: 'Recipients are required',
                  validate: validateEmail
                })}
                className="cyber-input w-full rounded-lg px-3 py-2"
                placeholder="recipient@example.com, another@example.com"
              />
              {errors.to && (
                <p className="text-neon-pink text-sm mt-1">{errors.to.message}</p>
              )}
              <p className="text-dark-muted text-xs mt-1">
                Separate multiple emails with commas
              </p>
            </div>

            {/* CC/BCC Toggle Buttons */}
            <div className="flex space-x-2">
              {!ccVisible && (
                <button
                  type="button"
                  onClick={() => setCcVisible(true)}
                  className="text-cyber-400 text-sm hover:text-cyber-300 transition-colors"
                >
                  + CC
                </button>
              )}
              {!bccVisible && (
                <button
                  type="button"
                  onClick={() => setBccVisible(true)}
                  className="text-cyber-400 text-sm hover:text-cyber-300 transition-colors"
                >
                  + BCC
                </button>
              )}
            </div>

            {/* CC Field */}
            {ccVisible && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-dark-text">CC</label>
                  <button
                    type="button"
                    onClick={() => setCcVisible(false)}
                    className="text-dark-muted hover:text-neon-pink transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  {...register('cc', { validate: (value) => !value || validateEmail(value) })}
                  className="cyber-input w-full rounded-lg px-3 py-2"
                  placeholder="cc@example.com"
                />
                {errors.cc && (
                  <p className="text-neon-pink text-sm mt-1">{errors.cc.message}</p>
                )}
              </div>
            )}

            {/* BCC Field */}
            {bccVisible && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-dark-text">BCC</label>
                  <button
                    type="button"
                    onClick={() => setBccVisible(false)}
                    className="text-dark-muted hover:text-neon-pink transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  {...register('bcc', { validate: (value) => !value || validateEmail(value) })}
                  className="cyber-input w-full rounded-lg px-3 py-2"
                  placeholder="bcc@example.com"
                />
                {errors.bcc && (
                  <p className="text-neon-pink text-sm mt-1">{errors.bcc.message}</p>
                )}
              </div>
            )}

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-dark-text mb-2">
                Subject *
              </label>
              <input
                type="text"
                {...register('subject', { required: 'Subject is required' })}
                className="cyber-input w-full rounded-lg px-3 py-2"
                placeholder="Enter email subject"
              />
              {errors.subject && (
                <p className="text-neon-pink text-sm mt-1">{errors.subject.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Message Body */}
        <div className="cyber-card rounded-lg p-6">
          <label className="block text-sm font-medium text-dark-text mb-2">
            Message *
          </label>
          <textarea
            {...register('body', { required: 'Message body is required' })}
            rows={12}
            className="cyber-input w-full rounded-lg px-3 py-2 resize-none"
            placeholder="Type your message here..."
          />
          {errors.body && (
            <p className="text-neon-pink text-sm mt-1">{errors.body.message}</p>
          )}
          
          {/* Message Statistics */}
          <div className="flex justify-between items-center mt-2 text-xs text-dark-muted">
            <span>{watchedFields.body?.length || 0} characters</span>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                className="flex items-center text-cyber-400 hover:text-cyber-300 transition-colors"
                disabled
              >
                <Paperclip className="w-4 h-4 mr-1" />
                Attach (Coming Soon)
              </button>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="cyber-card rounded-lg p-4 border-cyber-500/50">
          <div className="flex items-center">
            <Shield className="w-5 h-5 text-cyber-400 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-dark-text">Security Features Active</h3>
              <p className="text-xs text-dark-muted">
                All outgoing emails are automatically scanned for threats and comply with security policies
              </p>
            </div>
            <CheckCircle className="w-5 h-5 text-neon-green ml-auto" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              type="button"
              className="cyber-button"
              disabled
            >
              Save Draft
            </button>
          </div>
          
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => navigate('/inbox')}
              className="cyber-button border-dark-border text-dark-muted hover:text-dark-text hover:border-dark-border"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sendMailMutation.isLoading}
              className="cyber-button bg-cyber-500 text-dark-bg border-cyber-500 hover:bg-cyber-400"
            >
              {sendMailMutation.isLoading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-dark-bg border-t-transparent rounded-full mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
