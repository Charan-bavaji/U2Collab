import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contex/AuthContext'
import { motion } from 'framer-motion'

// ── Same brand palette ────────────────────────────────────────────────────────
const AVATARS = [
    { initials: "AK", color: "#2563EB" },
    { initials: "TS", color: "#10B981" },
    { initials: "PM", color: "#F59E0B" },
    { initials: "LR", color: "#8B5CF6" },
]

// ════════════════════════════════════════════════════════════
// ── FLOATING BACKGROUND (same as Hero) ──────────────────────
// ════════════════════════════════════════════════════════════

const BG_CURSORS = [
    { color: "#2563EB", x: "5%", y: "10%", dur: 14, delay: 0, size: 14, opacity: 0.18 },
    { color: "#10B981", x: "88%", y: "8%", dur: 18, delay: 2, size: 12, opacity: 0.15 },
    { color: "#F59E0B", x: "92%", y: "72%", dur: 12, delay: 1, size: 16, opacity: 0.18 },
    { color: "#8B5CF6", x: "3%", y: "78%", dur: 16, delay: 3, size: 13, opacity: 0.15 },
    { color: "#EF4444", x: "75%", y: "88%", dur: 15, delay: 4, size: 11, opacity: 0.12 },
    { color: "#2563EB", x: "48%", y: "4%", dur: 20, delay: 0.5, size: 10, opacity: 0.10 },
]

function CRDTGraph({ style }) {
    const nodes = [
        { cx: 30, cy: 30 }, { cx: 90, cy: 15 }, { cx: 140, cy: 50 },
        { cx: 60, cy: 80 }, { cx: 120, cy: 90 },
    ]
    const edges = [[0, 1], [1, 2], [0, 3], [3, 4], [2, 4], [1, 3]]
    const colors = ["#2563EB", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444"]
    return (
        <motion.div className="absolute pointer-events-none" style={style}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 1 }}>
            <motion.div
                animate={{ y: [0, -10, 0], rotate: [0, 3, 0] }}
                transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            >
                <svg width="170" height="110" viewBox="0 0 170 110">
                    {edges.map(([a, b], i) => (
                        <motion.line key={i}
                            x1={nodes[a].cx} y1={nodes[a].cy} x2={nodes[b].cx} y2={nodes[b].cy}
                            stroke="#2563EB" strokeWidth="1" strokeOpacity="0.25" strokeDasharray="4 3"
                            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                            transition={{ delay: 1 + i * 0.15, duration: 0.6 }}
                        />
                    ))}
                    {nodes.map((n, i) => (
                        <motion.circle key={i} cx={n.cx} cy={n.cy} r="5"
                            fill={colors[i]} fillOpacity="0.35"
                            stroke={colors[i]} strokeOpacity="0.5" strokeWidth="1"
                            animate={{ r: [5, 6.5, 5] }}
                            transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
                        />
                    ))}
                </svg>
                <p style={{ fontSize: "9px", color: "#2563EB", opacity: 0.4, textAlign: "center", fontFamily: "monospace", marginTop: "-4px", letterSpacing: "0.08em" }}>
                    CRDT · Yjs
                </p>
            </motion.div>
        </motion.div>
    )
}

function CodeChip({ code, color, style, delay, dur }) {
    return (
        <motion.div className="absolute pointer-events-none" style={style}
            initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay, duration: 0.5 }}>
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: dur, repeat: Infinity, ease: "easeInOut" }}>
                <div style={{
                    background: "rgba(255,255,255,0.72)", backdropFilter: "blur(6px)",
                    border: `1px solid ${color}30`, borderLeft: `2.5px solid ${color}`,
                    borderRadius: "8px", padding: "6px 10px", fontFamily: "monospace",
                    fontSize: "9.5px", color: "#374151", whiteSpace: "pre",
                    boxShadow: `0 4px 16px ${color}10`, lineHeight: 1.6,
                }}>
                    {code}
                </div>
            </motion.div>
        </motion.div>
    )
}

function WsPulse({ style, color, delay }) {
    return (
        <motion.div className="absolute pointer-events-none"
            style={{ ...style, width: 48, height: 48 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay }}>
            {[0, 0.6, 1.2].map((d, i) => (
                <motion.div key={i} style={{
                    position: "absolute", inset: 0, borderRadius: "50%",
                    border: `1.5px solid ${color}`, opacity: 0,
                }}
                    animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
                    transition={{ duration: 2.4, repeat: Infinity, delay: d, ease: "easeOut" }}
                />
            ))}
            <div style={{ position: "absolute", inset: "40%", borderRadius: "50%", backgroundColor: color, opacity: 0.6 }} />
            <p style={{ position: "absolute", top: "56px", left: "50%", transform: "translateX(-50%)", fontSize: "8px", color, opacity: 0.5, whiteSpace: "nowrap", fontFamily: "monospace" }}>
                ws://sync
            </p>
        </motion.div>
    )
}

function StickyNote({ text, color, style, delay, dur }) {
    return (
        <motion.div className="absolute pointer-events-none" style={style}
            initial={{ opacity: 0, rotate: -6 }} animate={{ opacity: 1, rotate: -3 }} transition={{ delay, duration: 0.5 }}>
            <motion.div animate={{ y: [0, -7, 0], rotate: [-3, 0, -3] }} transition={{ duration: dur, repeat: Infinity, ease: "easeInOut" }}>
                <div style={{
                    width: "82px", padding: "8px", background: color,
                    borderRadius: "4px", boxShadow: "2px 4px 12px rgba(0,0,0,0.10)",
                    fontSize: "9px", color: "#1f2937", lineHeight: 1.5, fontFamily: "sans-serif",
                }}>
                    {text}
                </div>
            </motion.div>
        </motion.div>
    )
}

function FloatingBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {/* dot grid */}
            <div style={{
                position: "absolute", inset: 0, opacity: 0.45,
                backgroundImage: "radial-gradient(circle, #2563EB18 1px, transparent 1px)",
                backgroundSize: "32px 32px",
            }} />

            {/* colour glows */}
            <div style={{ position: "absolute", top: "-80px", left: "50%", transform: "translateX(-50%)", width: 700, height: 340, background: "radial-gradient(ellipse, rgba(37,99,235,0.08) 0%, transparent 70%)", borderRadius: "50%" }} />
            <div style={{ position: "absolute", bottom: 0, right: "-100px", width: 400, height: 400, background: "radial-gradient(ellipse, rgba(16,185,129,0.06) 0%, transparent 70%)", borderRadius: "50%" }} />
            <div style={{ position: "absolute", top: "30%", left: "-80px", width: 320, height: 320, background: "radial-gradient(ellipse, rgba(245,158,11,0.05) 0%, transparent 70%)", borderRadius: "50%" }} />

            {/* drifting cursors */}
            {BG_CURSORS.map((c, i) => (
                <motion.div key={i}
                    style={{ position: "absolute", left: c.x, top: c.y, opacity: c.opacity }}
                    animate={{ y: [0, -18, 8, -10, 0], x: [0, 6, -4, 8, 0] }}
                    transition={{ duration: c.dur, repeat: Infinity, ease: "easeInOut", delay: c.delay }}
                >
                    <svg width={c.size} height={c.size * 1.2} viewBox="0 0 18 20" fill="none">
                        <path d="M0 0L0 16L4.5 12L7 18L9 17L6.5 11L11 11L0 0Z" fill={c.color} />
                    </svg>
                </motion.div>
            ))}

            {/* CRDT graphs */}
            <CRDTGraph style={{ left: "1%", top: "20%", opacity: 0.6 }} />
            <CRDTGraph style={{ right: "1%", top: "50%", opacity: 0.45, transform: "scaleX(-1)" }} />

            {/* code chips */}
            <CodeChip code={`doc.getText('body')\n  .insert(0, 'Hello')`} color="#2563EB" style={{ left: "2%", top: "6%" }} delay={0.6} dur={11} />
            <CodeChip code={`socket.emit(\n  'sync', delta)`} color="#10B981" style={{ right: "2%", top: "14%" }} delay={0.9} dur={13} />
            <CodeChip code={`Y.applyUpdate(\n  doc, update)`} color="#8B5CF6" style={{ right: "2%", bottom: "18%" }} delay={1.2} dur={10} />
            <CodeChip code={`merge(opA, opB)\n// conflict-free`} color="#F59E0B" style={{ left: "2%", bottom: "14%" }} delay={1.5} dur={14} />

            {/* WebSocket pulses */}
            <WsPulse style={{ left: "44%", top: "5%" }} color="#2563EB" delay={0.5} />
            <WsPulse style={{ left: "12%", bottom: "10%" }} color="#10B981" delay={1.2} />
            <WsPulse style={{ right: "7%", top: "38%" }} color="#8B5CF6" delay={2.0} />

            {/* sticky notes */}
            <StickyNote text="✏️ Aria editing intro..." color="#FEF9C3" style={{ left: "37%", top: "2%" }} delay={1.0} dur={12} />
            <StickyNote text="💬 Review by EOD" color="#D1FAE5" style={{ right: "13%", bottom: "6%" }} delay={1.4} dur={9} />
            <StickyNote text="🎨 Whiteboard idea" color="#EDE9FE" style={{ left: "7%", top: "50%" }} delay={1.8} dur={11} />
        </div>
    )
}

// ── Google Icon ───────────────────────────────────────────────────────────────
function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
    )
}

// ── GitHub Icon ───────────────────────────────────────────────────────────────
function GitHubIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
    )
}

// ── Main Login Page ───────────────────────────────────────────────────────────
const Login = () => {
    const { user } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (user) navigate('/dashboard', { replace: true })
    }, [user])

    return (
        <div className="relative min-h-screen bg-[#F2F2F2] overflow-hidden flex items-center justify-center">

            {/* ── FLOATING BACKGROUND ── */}
            <FloatingBackground />

            {/* ── LOGIN CARD ── */}
            <motion.div
                className="relative z-10 w-full max-w-md mx-4"
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className="bg-white/85 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-2xl shadow-gray-200/60 p-8">

                    {/* Logo */}
                    <div className="flex flex-col items-center mb-8">
                        <motion.div
                            className="relative w-12 h-12 mb-4"
                            initial={{ rotate: -10, scale: 0.8 }}
                            animate={{ rotate: 0, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 200 }}
                        >
                            <div className="absolute inset-0 rounded-xl bg-blue-600 shadow-lg shadow-blue-200" />
                            <svg className="absolute inset-0 w-full h-full p-2.5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </motion.div>

                        <motion.h1
                            className="text-[22px] font-black text-gray-900 tracking-tight"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25, duration: 0.4 }}
                        >
                            Welcome to U2Collab
                        </motion.h1>
                        <motion.p
                            className="text-[13.5px] text-gray-400 mt-1 text-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.35, duration: 0.4 }}
                        >
                            Real-time collaborative workspace
                        </motion.p>

                        {/* live avatars row */}
                        <motion.div
                            className="flex items-center gap-2 mt-4"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.45, duration: 0.4 }}
                        >
                            <div className="flex -space-x-1.5">
                                {AVATARS.map((a) => (
                                    <div key={a.initials}
                                        className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white shadow-sm"
                                        style={{ backgroundColor: a.color }}>
                                        {a.initials}
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <motion.div
                                    className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                                    animate={{ scale: [1, 1.5, 1] }}
                                    transition={{ duration: 1.8, repeat: Infinity }}
                                />
                                <span className="text-[11px] text-gray-400 font-medium">2,400+ online now</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* divider */}
                    <motion.div
                        className="border-t border-gray-100 mb-6"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                    />

                    {/* OAuth buttons */}
                    <div className="flex flex-col gap-3">
                        {/* Google */}
                        <motion.a
                            href="http://localhost:5000/api/auth/google"
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.55, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            whileHover={{ scale: 1.02, boxShadow: "0 6px 24px rgba(0,0,0,0.08)" }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center justify-center gap-3 w-full px-5 py-3.5 bg-white border border-gray-200 rounded-xl text-[14px] font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all no-underline shadow-sm"
                        >
                            <GoogleIcon />
                            Continue with Google
                        </motion.a>

                        {/* GitHub */}
                        <motion.a
                            href="http://localhost:5000/api/auth/github"
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.65, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            whileHover={{ scale: 1.02, boxShadow: "0 6px 24px rgba(0,0,0,0.12)" }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center justify-center gap-3 w-full px-5 py-3.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl text-[14px] font-semibold text-white transition-all no-underline shadow-sm"
                        >
                            <GitHubIcon />
                            Continue with GitHub
                        </motion.a>
                    </div>

                    {/* footer note */}
                    <motion.p
                        className="mt-6 text-center text-[11.5px] text-gray-400 leading-relaxed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.4 }}
                    >
                        By continuing, you agree to our{" "}
                        <a href="#" className="text-blue-600 hover:underline font-medium">Terms</a>{" "}
                        and{" "}
                        <a href="#" className="text-blue-600 hover:underline font-medium">Privacy Policy</a>
                    </motion.p>
                </div>

                {/* floating feature tags below card */}
                <motion.div
                    className="flex flex-wrap items-center justify-center gap-2 mt-5"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.4 }}
                >
                    {[
                        { icon: "⚡", text: "<50ms sync" },
                        { icon: "🔒", text: "SOC 2 compliant" },
                        { icon: "∞", text: "Infinite canvas" },
                        { icon: "🔄", text: "CRDT conflict-free" },
                    ].map((b) => (
                        <div key={b.text}
                            className="flex items-center gap-1.5 bg-white/70 backdrop-blur-sm border border-gray-100 rounded-full px-3 py-1.5 shadow-sm">
                            <span className="text-[11px]">{b.icon}</span>
                            <span className="text-[11px] font-medium text-gray-500">{b.text}</span>
                        </div>
                    ))}
                </motion.div>
            </motion.div>
        </div>
    )
}

export default Login