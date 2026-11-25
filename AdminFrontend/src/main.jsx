import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { BrandingProvider } from './context/BrandingContext.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

console.log('🚀 main.jsx: Script executing...')

try {
  const rootEl = document.getElementById('root')
  console.log('🔍 main.jsx: Root element found:', !!rootEl)
  
  // Add a visible loading indicator immediately
  rootEl.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;font-size:18px;color:#333;background:#f6f4ef;">Loading WorkMatrix...</div>'
  
  const root = createRoot(rootEl)
  console.log('✅ main.jsx: createRoot successful')
  
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <BrowserRouter>
          <AuthProvider>
            <BrandingProvider>
              <App />
            </BrandingProvider>
          </AuthProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </StrictMode>,
  )
  console.log('✅ main.jsx: render() called successfully')
} catch (err) {
  console.error('💥 FATAL ERROR in main.jsx:', err)
  document.getElementById('root').innerHTML = 
    '<div style="padding:40px;font-family:sans-serif;background:#fff;min-height:100vh;">' +
    '<h1 style="color:red;">Fatal Error</h1>' +
    '<pre style="background:#f5f5f5;padding:20px;border-radius:8px;overflow:auto;white-space:pre-wrap;">' + 
    err.stack + '</pre></div>'
}
