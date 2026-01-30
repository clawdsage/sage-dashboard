import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Log error to error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
    
    // Force a hard refresh to clear any corrupted state
    window.location.reload()
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full card">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/20 mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              
              <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
              <p className="text-slate-400 mb-6">
                The application encountered an unexpected error. Our team has been notified.
              </p>

              {/* Error details (collapsed by default) */}
              <details className="mb-6 text-left">
                <summary className="text-sm text-slate-400 hover:text-slate-300 cursor-pointer mb-2">
                  Technical details
                </summary>
                <div className="bg-slate-900 rounded-lg p-4 mt-2">
                  <code className="text-xs text-slate-300 font-mono break-all">
                    {this.state.error?.toString()}
                  </code>
                  {this.state.errorInfo && (
                    <pre className="text-xs text-slate-400 font-mono mt-2 overflow-auto max-h-40">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleRetry}
                  className="flex-1 bg-primary hover:bg-primary-dark text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload Application
                </button>
                
                <Link
                  to="/"
                  onClick={this.handleReset}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Go to Dashboard
                </Link>
              </div>

              {/* Contact support */}
              <div className="mt-6 pt-6 border-t border-slate-700">
                <p className="text-sm text-slate-400">
                  If the problem persists, please contact support.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary