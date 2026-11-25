import React from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-6 font-sans">
          <div className="max-w-2xl w-full">
            <div className="bg-white rounded-[48px] p-12 shadow-2xl text-center border border-red-100">
              <div className="flex justify-center mb-8">
                <div className="h-24 w-24 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-16 w-16 text-red-600" />
                </div>
              </div>
              
              <h1 className="text-4xl font-black text-slate-900 mb-4">
                Oops! Something went wrong
              </h1>
              <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
                We encountered an unexpected error. Don't worry, your data is safe. Try refreshing the page or go back to home.
              </p>
              
              {import.meta.env.DEV && this.state.error && (
                <div className="mb-8 p-4 bg-red-50 rounded-2xl text-left">
                  <p className="text-xs font-bold text-red-800 mb-2">Error Details (Development Only):</p>
                  <pre className="text-xs text-red-600 overflow-auto max-h-40">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={this.handleReset}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[24px] font-black uppercase tracking-widest hover:shadow-2xl hover:shadow-blue-200 transition-all flex items-center gap-3 justify-center group active:scale-95"
                >
                  <RefreshCw className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
                  Refresh Page
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="px-8 py-4 bg-slate-100 text-slate-800 rounded-[24px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-3 justify-center active:scale-95"
                >
                  <Home className="h-5 w-5" />
                  Go Home
                </button>
              </div>
              
              <p className="mt-8 text-xs text-slate-400">
                If this problem persists, please contact support
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
