import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contex/AuthContext'
import api from '../services/api'

const Dashboard = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [rooms, setRooms] = useState([])
    const [newName, setNewName] = useState('')

    useEffect(() => {
        api.get('/rooms').then(r => setRooms(r.data))
    }, [])

    const createRoom = async () => {
        if (!newName.trim()) return
        const { data } = await api.post('/rooms', { name: newName })
        setRooms(prev => [data, ...prev])
        setNewName('')
        navigate(`/room/${data._id}`)
    }

    const myRooms = rooms.filter(r => r.isOwner)
    const joinedRooms = rooms.filter(r => !r.isOwner)
    const recent = [...rooms]
        .filter(r => r.lastVisited)
        .sort((a, b) => new Date(b.lastVisited) - new Date(a.lastVisited))
        .slice(0, 3)

    return (
        <div style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>U2Collab</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img src={user?.avatar} width={36} style={{ borderRadius: '50%' }} />
                    <span>{user?.name}</span>
                    <button onClick={logout}>Logout</button>
                </div>
            </div>

            {/* Create room */}
            <div style={{ display: 'flex', gap: '0.5rem', margin: '1.5rem 0' }}>
                <input
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && createRoom()}
                    placeholder="New room name..."
                    style={{ flex: 1, padding: '0.5rem' }}
                />
                <button onClick={createRoom}>+ Create</button>
            </div>

            {/* Invite join */}
            <JoinByLink />

            {/* Recent */}
            {recent.length > 0 && <RoomSection title="Recently visited" rooms={recent} />}

            {/* My rooms */}
            <RoomSection title="My rooms" rooms={myRooms} />

            {/* Joined rooms */}
            {joinedRooms.length > 0 && <RoomSection title="Rooms I've joined" rooms={joinedRooms} />}
        </div>
    )
}

const JoinByLink = () => {
    const navigate = useNavigate()
    const [code, setCode] = useState('')

    const join = async () => {
        let c = code.trim()
        if (!c) return

        // ✅ If user pasted full URL → extract last part
        if (c.includes('/')) {
            const parts = c.split('/')
            c = parts[parts.length - 1]   // get "mygTezSH"
        }

        const { data } = await api.post(`/rooms/join/${c}`)
        navigate(`/room/${data.roomId}`)
    }

    return (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <input
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="Paste invite code..."
                style={{ flex: 1, padding: '0.5rem' }}
            />
            <button onClick={join}>Join room</button>
        </div>
    )
}

const RoomSection = ({ title, rooms }) => {
    const navigate = useNavigate()
    return (
        <div style={{ marginBottom: '2rem' }}>
            <h3>{title}</h3>
            {rooms.length === 0 && (
                <div style={{ color: 'var(--color-text-tertiary)', textAlign: 'center', marginTop: '4rem' }}>
                    No rooms yet — create one above or paste an invite code.
                </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                {rooms.map(r => (
                    <div
                        key={r._id}
                        onClick={() => navigate(`/room/${r._id}`)}
                        style={{ border: '1px solid #ddd', borderRadius: 8, padding: '1rem', cursor: 'pointer' }}
                    >
                        <div style={{ fontWeight: 500 }}>{r.name}</div>
                        <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                            {r.members.length} member{r.members.length !== 1 ? 's' : ''}
                        </div>
                        <div style={{ fontSize: 12, color: '#888' }}>
                            by {r.owner.name}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Dashboard