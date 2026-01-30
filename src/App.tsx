import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import ProjectDetail from './pages/ProjectDetail'
import ReviewQueue from './pages/ReviewQueue'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="project/:id" element={<ProjectDetail />} />
          <Route path="review" element={<ReviewQueue />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App