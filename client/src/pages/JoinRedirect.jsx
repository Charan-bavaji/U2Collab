// client/src/pages/JoinRedirect.jsx
import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'

const JoinRedirect = () => {
    const { code } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        api.post(`/rooms/join/${code}`)
            .then(({ data }) => navigate(`/room/${data.roomId}`, { replace: true }))
            .catch(() => navigate('/dashboard'))
    }, [])

    return <div>Joining room...</div>
}

export default JoinRedirect