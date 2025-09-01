import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

// Simple test component
function TestApp() {
  return (
    <div className="min-h-screen bg-dark-bg text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-neon-green mb-4">SecureEmail Test</h1>
        <p className="text-dark-text">If you can see this, React is working!</p>
        <button 
          className="cyber-button mt-4 px-6 py-2 rounded"
          onClick={() => alert('Frontend is working!')}
        >
          Test Button
        </button>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>,
)
