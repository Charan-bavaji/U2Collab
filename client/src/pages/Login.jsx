import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contex/AuthContext'

const Login = () => {
    const { user } = useAuth()
    const navigate = useNavigate()

    // If already logged in, skip login page
    useEffect(() => {
        if (user) navigate('/dashboard', { replace: true })
    }, [user])

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20vh', gap: '1rem' }}>
            <h1>U2Collab</h1>
            <p>Real-time collaborative workspace</p>

            <a href="http://localhost:5000/api/auth/google">
                <button>Continue with Google</button>
            </a>
            <a href="http://localhost:5000/api/auth/github">
                <button>Continue with GitHub</button>
            </a>
        </div>
    )
}

export default Login