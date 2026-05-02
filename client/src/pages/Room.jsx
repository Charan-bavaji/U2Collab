import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePresence } from '../hooks/usePresence'
import { useSocket } from '../hooks/useSocket'
import api from '../services/api'
import CollabEditor from '../components/Editor/CollabEditor'
import Canvas from '../components/Whiteboard/Canvas'
import { useAuth } from '../contex/AuthContext'
const Room = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const socket = useSocket()
    const { user } = useAuth()
    const onlineUsers = usePresence(id)
    const [room, setRoom] = useState(null)
    const [messages, setMessages] = useState([])
    const [chatText, setChatText] = useState('')
    const [typingUsers, setTypingUsers] = useState([])
    const [connected, setConnected] = useState(true)
    useEffect(() => {
        api.get(`/rooms/${id}`).then(r => setRoom(r.data)).catch(() => navigate('/dashboard'))
        api.get(`/rooms/${id}/messages`).then(r => setMessages(r.data))
    }, [id])

    useEffect(() => {
        const handleMessage = (msg) => {
            setMessages(prev => [...prev, msg])
        }

        const handleTyping = ({ name }) => {
            setTypingUsers(prev => [...new Set([...prev, name])])

            setTimeout(() => {
                setTypingUsers(prev => prev.filter(n => n !== name))
            }, 2000)
        }

        socket.on('chat:message', handleMessage)
        socket.on('chat:typing', handleTyping)

        return () => {
            socket.off('chat:message', handleMessage)
            socket.off('chat:typing', handleTyping)
        }
    }, [socket])

    useEffect(() => {
        socket.on('disconnect', () => setConnected(false))
        socket.on('connect', () => setConnected(true))
        return () => { socket.off('disconnect'); socket.off('connect') }
    }, [])

    useEffect(() => {
        if (room) document.title = `${room.name} · U2Collab`
        return () => { document.title = 'U2Collab' }
    }, [room])

    const sendMessage = () => {
        if (!chatText.trim()) return
        socket.emit('chat:send', { roomId: id, text: chatText })
        setChatText('')
    }

    const inviteLink = `${window.location.origin}/join/${room?.inviteCode}`

    if (!room) return <div>Loading room...</div>

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            {!connected && (
                <div style={{
                    background: '#FEF2F2', color: '#991B1B', padding: '6px 1rem',
                    fontSize: 12, textAlign: 'center', borderBottom: '1px solid #FCA5A5'
                }}>
                    ⚠ Connection lost — trying to reconnect...
                </div>
            )}
            {/* Main area — editor + whiteboard go here */}
            <div style={{ flex: 1, padding: '1rem', overflow: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2>{room.name}</h2>

                    {/* Presence avatars */}
                    <div style={{ display: 'flex', gap: 4 }}>
                        {onlineUsers.map(u => (
                            <img key={u.id} src={u.avatar} title={u.name} width={32}
                                style={{ borderRadius: '50%', border: '2px solid #4ade80' }} />
                        ))}
                    </div>

                    {/* Invite link */}
                    <button onClick={() => { navigator.clipboard.writeText(inviteLink) }}>
                        Copy invite link
                    </button>
                </div>

                {/* Editor placeholder — Tiptap goes here */}
                <CollabEditor roomId={id} />

                {/* Whiteboard placeholder — Konva goes here */}
                <Canvas roomId={id} />
            </div>

            {/* Chat sidebar */}
            <div style={{ width: 280, borderLeft: '1px solid #eee', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #eee', fontWeight: 500 }}>
                    Chat · {onlineUsers.length} online

                </div>
                <div style={{ flex: 1, overflow: 'auto', padding: '0.75rem' }}>
                    {messages.map(m => (
                        <div key={m._id} style={{ marginBottom: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <img src={m.sender.avatar} width={20} style={{ borderRadius: '50%' }} />
                                <span style={{ fontSize: 12, fontWeight: 500 }}>{m.sender.name}</span>
                            </div>
                            <div style={{ fontSize: 13, marginLeft: 26, marginTop: 2 }}>{m.text}</div>
                        </div>
                    ))}

                    {typingUsers.length > 0 && (
                        <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', padding: '0 0.75rem' }}>
                            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                        </div>
                    )}
                </div>
                <div style={{ padding: '0.75rem', borderTop: '1px solid #eee', display: 'flex', gap: 6 }}>
                    <input
                        value={chatText}
                        onChange={e => {
                            setChatText(e.target.value)
                            socket.emit('chat:typing', { roomId: id, name: user.name })
                        }}
                        onKeyDown={e => e.key === 'Enter' && sendMessage()}
                        placeholder="Message..."
                        style={{ flex: 1, padding: '0.4rem' }}
                    />
                    <button onClick={sendMessage}>Send</button>
                </div>
            </div>

        </div>
    )
}

export default Room