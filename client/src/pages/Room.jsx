import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { usePresence } from '../hooks/usePresence'
import { useSocket } from '../hooks/useSocket'
import api from '../services/api'
import CollabEditor from '../components/Editor/CollabEditor'
import Canvas from '../components/Whiteboard/Canvas'
import { useAuth } from '../contex/AuthContext'

// ── Theme ─────────────────────────────────────────────────────────────────────
const THEMES = {
    dark: {
        bg: '#0D0D0F',
        surface: '#131316',
        surfaceHover: '#1A1A1F',
        border: '#222228',
        borderStrong: '#2E2E38',
        text: '#F0F0F4',
        textMuted: '#7C7C8A',
        textFaint: '#45454F',
        accent: '#7C6AF7',
        accentHover: '#9080FF',
        accentFaint: 'rgba(124,106,247,0.12)',
        green: '#34D399',
        red: '#F87171',
        shadow: '0 8px 32px rgba(0,0,0,0.6)',
        shadowSm: '0 2px 8px rgba(0,0,0,0.4)',
        glass: 'rgba(13,13,15,0.85)',
    },
    light: {
        bg: '#F5F5F7',
        surface: '#FFFFFF',
        surfaceHover: '#F9F9FB',
        border: '#E5E5EA',
        borderStrong: '#D1D1D8',
        text: '#18181B',
        textMuted: '#6B6B78',
        textFaint: '#A0A0AB',
        accent: '#6355E8',
        accentHover: '#7C6AF7',
        accentFaint: 'rgba(99,85,232,0.08)',
        green: '#059669',
        red: '#DC2626',
        shadow: '0 8px 32px rgba(0,0,0,0.10)',
        shadowSm: '0 2px 8px rgba(0,0,0,0.07)',
        glass: 'rgba(245,245,247,0.88)',
    }
}

// ── Drag hook ─────────────────────────────────────────────────────────────────
const useDraggable = (initial) => {
    const [pos, setPos] = useState(initial)
    const dragging = useRef(false)
    const offset = useRef({ x: 0, y: 0 })

    const onMouseDown = useCallback((e) => {
        if (e.target.closest('[data-no-drag]')) return
        dragging.current = true
        offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }
        e.preventDefault()
    }, [pos])

    useEffect(() => {
        const onMove = (e) => {
            if (!dragging.current) return
            setPos({
                x: Math.max(0, Math.min(window.innerWidth - 320, e.clientX - offset.current.x)),
                y: Math.max(0, Math.min(window.innerHeight - 100, e.clientY - offset.current.y)),
            })
        }
        const onUp = () => { dragging.current = false }
        window.addEventListener('mousemove', onMove)
        window.addEventListener('mouseup', onUp)
        return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    }, [])

    return { pos, onMouseDown }
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 16, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d={d} />
    </svg>
)
const Icons = {
    moon: "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z",
    sun: "M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 6a6 6 0 100 12A6 6 0 0012 6z",
    link: "M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71",
    check: "M20 6L9 17l-5-5",
    edit: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
    grid: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
    chevDown: "M6 9l6 6 6-6",
    chevUp: "M18 15l-6-6-6 6",
    x: "M18 6L6 18M6 6l12 12",
    send: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
    users: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
    maximize: "M8 3H5a2 2 0 00-2 2v3M21 8V5a2 2 0 00-2-2h-3M16 21h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3",
    minimize: "M8 3v3a2 2 0 01-2 2H3M21 8h-3a2 2 0 01-2-2V3M3 16h3a2 2 0 012 2v3M16 21v-3a2 2 0 012-2h3",
    board: "M18 3a3 3 0 00-3 3v12a3 3 0 003 3 3 3 0 003-3 3 3 0 00-3-3H6a3 3 0 00-3 3 3 3 0 003 3 3 3 0 003-3V6a3 3 0 00-3-3 3 3 0 00-3 3 3 3 0 003 3h12a3 3 0 003-3 3 3 0 00-3-3z",
}

// ── Main Room Component ───────────────────────────────────────────────────────
const Room = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const socket = useSocket()
    const { user } = useAuth()
    const onlineUsers = usePresence(id)

    const [theme, setTheme] = useState('dark')
    const [view, setView] = useState('whiteboard') // 'whiteboard' | 'editor'
    const [room, setRoom] = useState(null)
    const [messages, setMessages] = useState([])
    const [chatText, setChatText] = useState('')
    const [typingUsers, setTypingUsers] = useState([])
    const [connected, setConnected] = useState(true)
    const [chatOpen, setChatOpen] = useState(true)
    const [copied, setCopied] = useState(false)
    const messagesEndRef = useRef(null)

    const T = THEMES[theme]
    const { pos: chatPos, onMouseDown: chatDrag } = useDraggable({ x: 24, y: 72 })

    // scroll chat to bottom
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

    useEffect(() => {
        api.get(`/rooms/${id}`).then(r => setRoom(r.data)).catch(() => navigate('/dashboard'))
        api.get(`/rooms/${id}/messages`).then(r => setMessages(r.data))
    }, [id])

    useEffect(() => {
        const handleMessage = (msg) => setMessages(prev => [...prev, msg])
        const handleTyping = ({ name }) => {
            setTypingUsers(prev => [...new Set([...prev, name])])
            setTimeout(() => setTypingUsers(prev => prev.filter(n => n !== name)), 2000)
        }
        socket.on('chat:message', handleMessage)
        socket.on('chat:typing', handleTyping)
        return () => { socket.off('chat:message', handleMessage); socket.off('chat:typing', handleTyping) }
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

    const copyInvite = () => {
        const link = `${window.location.origin}/join/${room?.inviteCode}`
        navigator.clipboard.writeText(link)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (!room) return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '100vh', background: THEMES.dark.bg, color: THEMES.dark.textMuted,
            fontFamily: "'DM Mono', monospace", fontSize: 13, letterSpacing: '.05em'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                    width: 6, height: 6, borderRadius: '50%', background: THEMES.dark.accent,
                    animation: 'pulse 1.2s ease-in-out infinite'
                }} />
                loading room...
            </div>
            <style>{`@keyframes pulse { 0%,100%{opacity:.3} 50%{opacity:1} }`}</style>
        </div>
    )

    const chatH = chatOpen ? 'min(52vh, 480px)' : '44px'

    return (
        <div style={{
            width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative',
            background: T.bg, fontFamily: "'DM Sans', 'DM Mono', sans-serif"
        }}>

            {/* ── Google Fonts ── */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.borderStrong}; border-radius: 2px; }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
        @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes spin    { to{transform:rotate(360deg)} }
      `}</style>

            {/* ── Top bar ── */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50,
                height: 48,
                background: T.glass,
                backdropFilter: 'blur(12px)',
                borderBottom: `1px solid ${T.border}`,
                display: 'flex', alignItems: 'center', gap: 0,
                padding: '0 16px',
            }}>
                {/* Logo */}
                <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 20 }}>
                    <div style={{
                        width: 22, height: 22, borderRadius: 6,
                        background: `linear-gradient(135deg, ${T.accent}, ${T.accentHover})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                            <rect x="1" y="1" width="4" height="4" rx="1" />
                            <rect x="7" y="1" width="4" height="4" rx="1" />
                            <rect x="1" y="7" width="4" height="4" rx="1" />
                            <rect x="7" y="7" width="4" height="4" rx="1" />
                        </svg>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: T.text, letterSpacing: '-.01em' }}>
                        U2Collab
                    </span>
                </Link>

                {/* Divider */}
                <div style={{ width: 1, height: 20, background: T.border, marginRight: 16 }} />

                {/* Room name */}
                <span style={{ fontSize: 13, fontWeight: 500, color: T.text, letterSpacing: '-.01em' }}>
                    {room.name}
                </span>

                {/* View switcher */}
                <div style={{
                    marginLeft: 20, display: 'flex', gap: 2,
                    background: T.border, borderRadius: 8, padding: 2
                }}>
                    {[['whiteboard', 'Whiteboard', Icons.grid], ['editor', 'Editor', Icons.edit]].map(([v, label, icon]) => (
                        <button key={v} onClick={() => setView(v)} style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                            fontSize: 12, fontWeight: 500, transition: 'all .15s',
                            background: view === v ? T.surface : 'transparent',
                            color: view === v ? T.text : T.textMuted,
                            boxShadow: view === v ? T.shadowSm : 'none',
                        }}>
                            <Icon d={icon} size={12} />
                            {label}
                        </button>
                    ))}
                </div>

                <div style={{ flex: 1 }} />

                {/* Connection status */}
                {!connected && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px',
                        borderRadius: 6, background: 'rgba(248,113,113,0.1)', border: `1px solid rgba(248,113,113,0.2)`,
                        fontSize: 11, color: T.red, marginRight: 12
                    }}>
                        <div style={{
                            width: 6, height: 6, borderRadius: '50%', background: T.red,
                            animation: 'blink 1s ease-in-out infinite'
                        }} />
                        Reconnecting...
                    </div>
                )}

                {/* Presence avatars */}
                <div style={{ display: 'flex', alignItems: 'center', gap: -4, marginRight: 12 }}>
                    {onlineUsers.slice(0, 5).map((u, i) => (
                        <div key={u.id} title={u.name} style={{
                            width: 26, height: 26, borderRadius: '50%',
                            border: `2px solid ${T.bg}`,
                            marginLeft: i === 0 ? 0 : -8,
                            overflow: 'hidden', zIndex: 5 - i,
                            boxShadow: `0 0 0 1.5px ${T.green}`,
                        }}>
                            <img src={u.avatar} width={22} height={22} style={{ display: 'block' }} />
                        </div>
                    ))}
                    {onlineUsers.length > 0 && (
                        <span style={{ marginLeft: 10, fontSize: 11, color: T.textMuted }}>
                            {onlineUsers.length} online
                        </span>
                    )}
                </div>

                {/* Copy invite */}
                <Btn T={T} onClick={copyInvite} variant="ghost" small>
                    <Icon d={copied ? Icons.check : Icons.link} size={13}
                        style={{ color: copied ? T.green : 'currentColor' }} />
                    <span style={{ marginLeft: 5 }}>{copied ? 'Copied!' : 'Invite'}</span>
                </Btn>

                {/* Theme toggle */}
                <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
                    title="Toggle theme"
                    style={{
                        marginLeft: 8, width: 32, height: 32, borderRadius: 8,
                        background: T.surfaceHover, border: `1px solid ${T.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: T.textMuted, transition: 'all .15s',
                    }}>
                    <Icon d={theme === 'dark' ? Icons.sun : Icons.moon} size={14} />
                </button>
            </div>

            {/* ── Full-screen view area ── */}
            <div style={{ position: 'absolute', inset: 0, top: 48 }}>
                {/* Whiteboard — always mounted, hidden when editor active */}
                <div style={{
                    position: 'absolute', inset: 0,
                    opacity: view === 'whiteboard' ? 1 : 0,
                    pointerEvents: view === 'whiteboard' ? 'all' : 'none',
                    transition: 'opacity .2s ease',
                }}>
                    <Canvas roomId={id} theme={theme} />
                </div>

                {/* Editor — always mounted, hidden when whiteboard active */}
                <div style={{
                    position: 'absolute', inset: 0,
                    opacity: view === 'editor' ? 1 : 0,
                    pointerEvents: view === 'editor' ? 'all' : 'none',
                    transition: 'opacity .2s ease',
                    overflow: 'auto',
                    background: T.bg,
                    padding: '2rem',
                }}>
                    <div style={{ maxWidth: 780, margin: '0 auto' }}>
                        <CollabEditor roomId={id} theme={theme} />
                    </div>
                </div>
            </div>

            {/* ── Floating view-switch pill (bottom center) ── */}
            <div style={{
                position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
                zIndex: 60,
                display: 'flex', alignItems: 'center', gap: 2,
                background: T.glass, backdropFilter: 'blur(12px)',
                border: `1px solid ${T.border}`,
                borderRadius: 12, padding: 4,
                boxShadow: T.shadow,
                animation: 'fadeIn .3s ease',
            }}>
                <button onClick={() => setView('whiteboard')} style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    fontSize: 12, fontWeight: 500, transition: 'all .15s',
                    background: view === 'whiteboard' ? T.accent : 'transparent',
                    color: view === 'whiteboard' ? '#fff' : T.textMuted,
                    boxShadow: view === 'whiteboard' ? `0 2px 12px ${T.accentFaint}` : 'none',
                }}>
                    <Icon d={Icons.grid} size={13} />
                    Whiteboard
                </button>
                <button onClick={() => setView('editor')} style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    fontSize: 12, fontWeight: 500, transition: 'all .15s',
                    background: view === 'editor' ? T.accent : 'transparent',
                    color: view === 'editor' ? '#fff' : T.textMuted,
                    boxShadow: view === 'editor' ? `0 2px 12px ${T.accentFaint}` : 'none',
                }}>
                    <Icon d={Icons.edit} size={13} />
                    Editor
                </button>
            </div>

            {/* ── Floating Chat Panel ── */}
            <div style={{
                position: 'fixed',
                left: chatPos.x,
                top: chatPos.y,
                width: '20vw',
                minWidth: 240,
                maxWidth: 320,
                height: chatH,
                zIndex: 100,
                background: T.glass,
                backdropFilter: 'blur(16px)',
                border: `1px solid ${T.border}`,
                borderRadius: 14,
                boxShadow: T.shadow,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                transition: 'height .25s cubic-bezier(.4,0,.2,1)',
                animation: 'slideIn .25s ease',
            }}>
                {/* Chat header — drag handle */}
                <div onMouseDown={chatDrag} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 12px',
                    borderBottom: chatOpen ? `1px solid ${T.border}` : 'none',
                    cursor: 'grab', userSelect: 'none', flexShrink: 0,
                }}>
                    {/* Drag grip dots */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, opacity: .4 }}>
                        {[0, 1, 2].map(i => (
                            <div key={i} style={{ display: 'flex', gap: 3 }}>
                                <div style={{ width: 3, height: 3, borderRadius: '50%', background: T.textMuted }} />
                                <div style={{ width: 3, height: 3, borderRadius: '50%', background: T.textMuted }} />
                            </div>
                        ))}
                    </div>

                    <Icon d={Icons.users} size={13} style={{ color: T.accent }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: T.text, flex: 1, letterSpacing: '-.01em' }}>
                        Chat
                    </span>

                    {/* Online badge */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '2px 7px', borderRadius: 20,
                        background: `rgba(52,211,153,0.1)`, border: `1px solid rgba(52,211,153,0.2)`
                    }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: T.green }} />
                        <span style={{ fontSize: 10, fontWeight: 500, color: T.green }}>{onlineUsers.length}</span>
                    </div>

                    {/* Collapse / expand */}
                    <button data-no-drag="true"
                        onClick={() => setChatOpen(o => !o)}
                        style={{
                            width: 22, height: 22, borderRadius: 6, border: 'none',
                            background: T.surfaceHover, cursor: 'pointer', color: T.textMuted,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all .15s'
                        }}>
                        <Icon d={chatOpen ? Icons.chevUp : Icons.chevDown} size={12} />
                    </button>
                </div>

                {/* Messages */}
                {chatOpen && (
                    <>
                        <div style={{ flex: 1, overflow: 'auto', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {messages.length === 0 && (
                                <div style={{
                                    textAlign: 'center', color: T.textFaint, fontSize: 11,
                                    marginTop: 'auto', marginBottom: 'auto', padding: '1rem'
                                }}>
                                    No messages yet
                                </div>
                            )}
                            {messages.map((m, i) => {
                                const isMine = m.sender._id === user?._id || m.sender.name === user?.name
                                return (
                                    <div key={m._id} style={{
                                        animation: `fadeIn .2s ease ${i > messages.length - 3 ? '.05s' : '0s'} both`,
                                        alignSelf: isMine ? 'flex-end' : 'flex-start',
                                        maxWidth: '85%',
                                    }}>
                                        {!isMine && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                                                <img src={m.sender.avatar} width={16} height={16}
                                                    style={{ borderRadius: '50%', flexShrink: 0 }} />
                                                <span style={{ fontSize: 10, fontWeight: 500, color: T.textMuted }}>
                                                    {m.sender.name}
                                                </span>
                                            </div>
                                        )}
                                        <div style={{
                                            padding: '7px 10px', borderRadius: isMine ? '10px 10px 2px 10px' : '10px 10px 10px 2px',
                                            background: isMine ? T.accent : T.surfaceHover,
                                            color: isMine ? '#fff' : T.text,
                                            fontSize: 12, lineHeight: 1.5,
                                            border: isMine ? 'none' : `1px solid ${T.border}`,
                                        }}>
                                            {m.text}
                                        </div>
                                    </div>
                                )
                            })}

                            {typingUsers.length > 0 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 2px' }}>
                                    <div style={{ display: 'flex', gap: 3 }}>
                                        {[0, 1, 2].map(i => (
                                            <div key={i} style={{
                                                width: 4, height: 4, borderRadius: '50%',
                                                background: T.textFaint,
                                                animation: `blink 1.2s ease-in-out ${i * 0.2}s infinite`
                                            }} />
                                        ))}
                                    </div>
                                    <span style={{ fontSize: 10, color: T.textFaint }}>
                                        {typingUsers.join(', ')} typing
                                    </span>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div style={{
                            padding: '8px 10px', borderTop: `1px solid ${T.border}`, flexShrink: 0,
                            display: 'flex', gap: 6, alignItems: 'center'
                        }} data-no-drag="true">
                            <input
                                value={chatText}
                                onChange={e => {
                                    setChatText(e.target.value)
                                    socket.emit('chat:typing', { roomId: id, name: user.name })
                                }}
                                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                placeholder="Message…"
                                style={{
                                    flex: 1, padding: '7px 10px', borderRadius: 8, outline: 'none',
                                    border: `1px solid ${T.border}`,
                                    background: T.surfaceHover,
                                    color: T.text, fontSize: 12,
                                    fontFamily: 'inherit',
                                    transition: 'border-color .15s',
                                }}
                                onFocus={e => e.target.style.borderColor = T.accent}
                                onBlur={e => e.target.style.borderColor = T.border}
                            />
                            <button onClick={sendMessage} disabled={!chatText.trim()} style={{
                                width: 30, height: 30, borderRadius: 8, border: 'none',
                                background: chatText.trim() ? T.accent : T.surfaceHover,
                                color: chatText.trim() ? '#fff' : T.textFaint,
                                cursor: chatText.trim() ? 'pointer' : 'default',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all .15s', flexShrink: 0,
                            }}>
                                <Icon d={Icons.send} size={13} />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

// ── Reusable Button ───────────────────────────────────────────────────────────
const Btn = ({ T, children, onClick, variant = 'default', small }) => {
    const [hover, setHover] = useState(false)
    const base = {
        display: 'flex', alignItems: 'center',
        padding: small ? '5px 10px' : '7px 14px',
        borderRadius: 8, border: 'none', cursor: 'pointer',
        fontSize: 12, fontWeight: 500,
        fontFamily: 'inherit',
        transition: 'all .15s',
    }
    const styles = {
        default: { background: hover ? T.accentHover : T.accent, color: '#fff' },
        ghost: {
            background: hover ? T.surfaceHover : 'transparent',
            color: hover ? T.text : T.textMuted,
            border: `1px solid ${hover ? T.borderStrong : T.border}`
        },
    }
    return (
        <button onClick={onClick}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{ ...base, ...styles[variant] }}>
            {children}
        </button>
    )
}

export default Room