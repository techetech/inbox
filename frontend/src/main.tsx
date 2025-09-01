import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'react-hot-toast'
import { HelmetProvider } from 'react-helmet-async'

import App from './App.tsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <App />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#2a2a2a',
                  color: '#e0e0e0',
                  border: '1px solid #0ea5e9',
                  fontFamily: 'JetBrains Mono, monospace',
                },
                success: {
                  iconTheme: {
                    primary: '#00ff41',
                    secondary: '#2a2a2a',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ff1493',
                    secondary: '#2a2a2a',
                  },
                },
              }}
            />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>,
)
