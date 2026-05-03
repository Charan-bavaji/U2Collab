import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contex/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Room from './pages/Room'
import JoinRedirect from './pages/JoinRedirect'
import Home from './pages/Home'
const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/login" replace />} />
        <Route path="/room/:id" element={<ProtectedRoute><Room /></ProtectedRoute>} />
        <Route path="/join/:code" element={<ProtectedRoute><JoinRedirect /></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
)

export default App