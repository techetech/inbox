import { Routes, Route, Navigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

import { useAuth } from './hooks/useAuth'
import Layout from './components/Layout/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import InboxPage from './pages/InboxPage'
import ComposePage from './pages/ComposePage'
import AdminPage from './pages/AdminPage'
import SettingsPage from './pages/SettingsPage'
import LoadingSpinner from './components/UI/LoadingSpinner'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <Helmet>
          <title>SecureEmail - Cyber Protection Platform</title>
          <meta name="description" content="Advanced email security platform with phishing protection" />
        </Helmet>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </>
    )
  }

  return (
    <>
      <Helmet>
        <title>SecureEmail Dashboard - Cyber Protection</title>
      </Helmet>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/inbox" element={<InboxPage />} />
          <Route path="/compose" element={<ComposePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          {user.role === 'admin' && (
            <Route path="/admin" element={<AdminPage />} />
          )}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </>
  )
}

export default App
