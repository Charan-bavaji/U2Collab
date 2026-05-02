import { Navigate } from 'react-router-dom'
import { useAuth } from '../contex/AuthContext'

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth()

    if (loading) return <div>Loading...</div>   // swap with a spinner later
    if (!user) return <Navigate to="/login" replace />

    return children
}

export default ProtectedRoute