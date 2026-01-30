import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Layout from './components/Layout'
import { Loader2 } from 'lucide-react'

// Lazy load page components for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Login = lazy(() => import('./pages/Login'))
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'))
const ReviewQueue = lazy(() => import('./pages/ReviewQueue'))
const Agents = lazy(() => import('./pages/Agents'))

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="text-center">
      <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
      <div className="mt-4 text-slate-400">Loading...</div>
    </div>
  </div>
)

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="project/:id" element={<ProjectDetail />} />
            <Route path="agents" element={<Agents />} />
            <Route path="review" element={<ReviewQueue />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App