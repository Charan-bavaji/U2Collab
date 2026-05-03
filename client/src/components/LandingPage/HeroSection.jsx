import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

// ── Floating presence avatars ───────────────────────────────────────────────
const AVATARS = [
    { name: "Aria K.", color: "#2563EB", initials: "AK", x: "18%", y: "22%", delay: 0.6 },
    { name: "Tom S.", color: "#10B981", initials: "TS", x: "74%", y: "15%", delay: 0.75 },
    { name: "Priya M.", color: "#F59E0B", initials: "PM", x: "82%", y: "58%", delay: 0.9 },
    { name: "Luis R.", color: "#8B5CF6", initials: "LR", x: "10%", y: "65%", delay: 1.0 },
];

// ── Typing indicator ────────────────────────────────────────────────────────
function TypingDot({ delay }) {
    return (
        <motion.span
            className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay, ease: "easeInOut" }}
        />
    );
}

// ── Live cursor ─────────────────────────────────────────────────────────────
function LiveCursor({ color, name, x, y, delay }) {
    return (
        <motion.div
            className="absolute pointer-events-none z-20"
            style={{ left: x, top: y }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.4, ease: "backOut" }}
        >
            {/* cursor svg */}
            <motion.div
                animate={{ x: [0, 8, -4, 6, 0], y: [0, -6, 4, -3, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: delay * 2 }}
            >
                <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
                    <path d="M0 0L0 16L4.5 12L7 18L9 17L6.5 11L11 11L0 0Z" fill={color} stroke="white" strokeWidth="1" />
                </svg>
                <motion.div
                    className="mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white whitespace-nowrap shadow-sm"
                    style={{ backgroundColor: color }}
                >
                    {name}
                </motion.div>
            </motion.div>
        </motion.div>
    );
}

// ── Floating UI card ────────────────────────────────────────────────────────
function FloatingCard({ children, className, delay = 0, floatY = 8 }) {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
            <motion.div
                animate={{ y: [0, -floatY, 0] }}
                transition={{ duration: 4 + delay, repeat: Infinity, ease: "easeInOut", delay: delay * 0.5 }}
            >
                {children}
            </motion.div>
        </motion.div>
    );
}

// ── Animated word reveal ────────────────────────────────────────────────────
function AnimatedHeading({ text }) {
    const words = text.split(" ");
    return (
        <span>
            {words.map((word, i) => (
                <motion.span
                    key={i}
                    className="inline-block mr-[0.22em]"
                    initial={{ opacity: 0, y: 32, rotateX: -20 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{
                        delay: 0.2 + i * 0.08,
                        duration: 0.55,
                        ease: [0.16, 1, 0.3, 1],
                    }}
                >
                    {word}
                </motion.span>
            ))}
        </span>
    );
}

// ── Stats row ───────────────────────────────────────────────────────────────
const STATS = [
    { value: "50k+", label: "Teams" },
    { value: "2M+", label: "Docs created" },
    { value: "99.9%", label: "Uptime" },
    { value: "<50ms", label: "Sync latency" },
];

// ── Mock editor preview ─────────────────────────────────────────────────────
function EditorPreview() {
    const [text, setText] = useState("Collaborative editing in real time...");
    const [caretPos, setCaretPos] = useState(35);

    useEffect(() => {
        const additions = [" ✦", " ideas", " flow", " sync"];
        let i = 0;
        const interval = setInterval(() => {
            setText((t) => t + additions[i % additions.length]);
            setCaretPos((p) => p + additions[i % additions.length].length);
            i++;
        }, 2200);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
            {/* toolbar */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-gray-50/60">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-3 bg-gray-100 rounded-md px-3 py-1 text-[11px] text-gray-400 font-mono">
                    syncspace.app/room/design-sprint-q2
                </div>
                {/* live avatars in bar */}
                <div className="flex -space-x-1.5">
                    {AVATARS.slice(0, 3).map((a) => (
                        <div
                            key={a.initials}
                            className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white"
                            style={{ backgroundColor: a.color }}
                        >
                            {a.initials}
                        </div>
                    ))}
                </div>
            </div>

            {/* editor body */}
            <div className="px-6 py-5 min-h-[180px] relative">
                {/* selection highlight */}
                <div className="absolute top-8 left-6 right-6 h-[22px] bg-blue-100/70 rounded-sm" />

                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-300 mb-3">
                    Design Sprint Q2 — Notes
                </p>
                <p className="text-[15px] text-gray-800 leading-relaxed font-medium relative z-10">
                    {text}
                    <motion.span
                        className="inline-block w-0.5 h-4 bg-blue-500 ml-0.5 align-middle"
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.9, repeat: Infinity }}
                    />
                </p>

                {/* typing indicator */}
                <div className="absolute bottom-4 left-6 flex items-center gap-1.5 bg-white border border-gray-100 rounded-full px-3 py-1.5 shadow-sm">
                    <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-[7px] font-bold text-white">T</div>
                    <div className="flex items-end gap-0.5 pb-0.5">
                        <TypingDot delay={0} />
                        <TypingDot delay={0.15} />
                        <TypingDot delay={0.3} />
                    </div>
                    <span className="text-[11px] text-gray-400">Tom is typing</span>
                </div>
            </div>
        </div>
    );
}

// ── Main HeroSection ────────────────────────────────────────────────────────
export default function HeroSection() {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
    const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
    const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);
    const textY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
    const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    return (
        <section ref={ref} className="relative bg-[#F2F2F2] overflow-hidden">
            {/* subtle grid bg */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(37,99,235,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.07) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                }}
            />

            {/* radial glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* ── TEXT BLOCK ── */}
            <motion.div
                style={{ y: textY, opacity: textOpacity }}
                className="relative z-10 max-w-4xl mx-auto px-4 pt-20 pb-14 text-center"
            >
                {/* badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.05 }}
                    className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3.5 py-1.5 mb-8 shadow-sm"
                >
                    <motion.div
                        className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 1.8, repeat: Infinity }}
                    />
                    <span className="text-[12px] font-medium text-gray-600">
                        Now with AI-powered conflict resolution
                    </span>
                    <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        New
                    </span>
                </motion.div>

                {/* heading */}
                <h1 className="text-[52px] sm:text-[68px] font-black leading-[1.05] tracking-tight text-gray-900 mb-6">
                    <AnimatedHeading text="Work together in" />
                    <br />
                    <span className="relative">
                        <AnimatedHeading text="real time," />
                        {/* underline accent */}
                        <motion.svg
                            className="absolute -bottom-1 left-0 w-full"
                            viewBox="0 0 300 10"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ delay: 0.9, duration: 0.7, ease: "easeOut" }}
                        >
                            <motion.path
                                d="M0 6 Q75 1 150 6 Q225 11 300 6"
                                stroke="#2563EB"
                                strokeWidth="3"
                                fill="none"
                                strokeLinecap="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ delay: 0.9, duration: 0.7 }}
                            />
                        </motion.svg>
                    </span>{" "}
                    <motion.span
                        className="text-blue-600"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                    >
                        <AnimatedHeading text="no delays" />
                    </motion.span>
                </h1>

                {/* subtext */}
                <motion.p
                    className="text-[17px] text-gray-500 leading-relaxed max-w-xl mx-auto mb-10"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55, duration: 0.5 }}
                >
                    SyncSpace brings your team into one shared space. Edit documents, sketch ideas, and chat instantly with everyone on the same page.
                </motion.p>

                {/* CTAs */}
                <motion.div
                    className="flex flex-col sm:flex-row items-center justify-center gap-3"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.65, duration: 0.45 }}
                >
                    <motion.a
                        href="#"
                        whileHover={{ scale: 1.04, boxShadow: "0 8px 30px rgba(37,99,235,0.35)" }}
                        whileTap={{ scale: 0.97 }}
                        className="inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[15px] rounded-xl shadow-md shadow-blue-200 transition-colors no-underline"
                    >
                        Start free
                        <motion.span
                            animate={{ x: [0, 3, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            →
                        </motion.span>
                    </motion.a>

                    <motion.a
                        href="#"
                        whileHover={{ scale: 1.03, backgroundColor: "#fff" }}
                        whileTap={{ scale: 0.97 }}
                        className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-white border border-gray-200 text-gray-800 font-semibold text-[15px] rounded-xl transition-colors no-underline shadow-sm"
                    >
                        <motion.div
                            className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center"
                            whileHover={{ scale: 1.15 }}
                        >
                            <svg width="10" height="12" viewBox="0 0 10 12" fill="white">
                                <path d="M0 0L10 6L0 12V0Z" />
                            </svg>
                        </motion.div>
                        Watch demo
                    </motion.a>
                </motion.div>

                {/* social proof */}
                <motion.div
                    className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.85 }}
                >
                    <div className="flex -space-x-2">
                        {AVATARS.map((a) => (
                            <div
                                key={a.initials}
                                className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                                style={{ backgroundColor: a.color }}
                            >
                                {a.initials}
                            </div>
                        ))}
                    </div>
                    <p className="text-[13px] text-gray-500">
                        <span className="font-semibold text-gray-800">2,400+</span> teams collaborating right now
                    </p>
                    <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                            <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="#F59E0B">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                        ))}
                        <span className="text-[12px] text-gray-500 ml-1">4.9/5</span>
                    </div>
                </motion.div>
            </motion.div>

            {/* ── HERO IMAGE + OVERLAY CARDS ── */}
            <div className="relative max-w-6xl mx-auto px-4 pb-0">
                {/* image container with parallax */}
                <motion.div
                    className="relative rounded-t-2xl overflow-hidden shadow-2xl shadow-gray-400/20"
                    style={{ y: imageY, scale: imageScale }}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                    {/* image */}
                    <img
                        src="https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=1400&auto=format&fit=crop&q=80"
                        alt="Team collaborating"
                        className="w-full object-cover"
                        style={{ height: "520px" }}
                    />

                    {/* dark gradient overlay at bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/30 via-transparent to-transparent" />

                    {/* Live cursors floating over image */}
                    {AVATARS.map((a) => (
                        <LiveCursor key={a.initials} {...a} />
                    ))}

                    {/* ── floating UI cards ── */}

                    {/* Editor card — top left */}
                    <FloatingCard
                        className="absolute top-6 left-6 w-64 z-30"
                        delay={1.1}
                        floatY={6}
                    >
                        <div className="bg-white/95 backdrop-blur-md rounded-xl border border-gray-100 shadow-lg shadow-gray-300/30 p-3.5">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Live editor</span>
                            </div>
                            <p className="text-[13px] text-gray-800 font-medium leading-snug">
                                "Q2 roadmap synced across 8 members instantly"
                            </p>
                            <div className="mt-2 flex items-center gap-1.5">
                                <TypingDot delay={0} />
                                <TypingDot delay={0.15} />
                                <TypingDot delay={0.3} />
                                <span className="text-[10px] text-gray-400 ml-1">3 editing now</span>
                            </div>
                        </div>
                    </FloatingCard>

                    {/* Sync card — top right */}
                    <FloatingCard
                        className="absolute top-6 right-6 w-52 z-30"
                        delay={1.25}
                        floatY={7}
                    >
                        <div className="bg-white/95 backdrop-blur-md rounded-xl border border-gray-100 shadow-lg p-3.5">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Sync speed</span>
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">● Live</span>
                            </div>
                            <div className="text-[28px] font-black text-gray-900 leading-none">
                                47<span className="text-[14px] font-medium text-gray-400">ms</span>
                            </div>
                            <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-blue-500 rounded-full"
                                    initial={{ width: "0%" }}
                                    animate={{ width: ["40%", "85%", "55%", "90%", "60%"] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                                />
                            </div>
                        </div>
                    </FloatingCard>

                    {/* Whiteboard activity — bottom left */}
                    <FloatingCard
                        className="absolute bottom-8 left-6 w-56 z-30"
                        delay={1.4}
                        floatY={5}
                    >
                        <div className="bg-white/95 backdrop-blur-md rounded-xl border border-gray-100 shadow-lg p-3.5">
                            <div className="flex items-center gap-2 mb-2.5">
                                <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2">
                                        <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
                                    </svg>
                                </div>
                                <span className="text-[12px] font-semibold text-gray-700">Whiteboard</span>
                            </div>
                            <div className="grid grid-cols-3 gap-1.5">
                                {["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#F2F2F2"].map((c, i) => (
                                    <motion.div
                                        key={i}
                                        className="h-7 rounded-lg border border-gray-100"
                                        style={{ backgroundColor: c }}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 1.5 + i * 0.07 }}
                                    />
                                ))}
                            </div>
                            <p className="text-[10.5px] text-gray-400 mt-2">4 sticky notes added</p>
                        </div>
                    </FloatingCard>

                    {/* Members active — bottom right */}
                    <FloatingCard
                        className="absolute bottom-8 right-6 w-52 z-30"
                        delay={1.5}
                        floatY={6}
                    >
                        <div className="bg-white/95 backdrop-blur-md rounded-xl border border-gray-100 shadow-lg p-3.5">
                            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2.5">
                                Online now
                            </p>
                            <div className="flex flex-col gap-1.5">
                                {AVATARS.map((a, i) => (
                                    <motion.div
                                        key={a.initials}
                                        className="flex items-center gap-2"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 1.6 + i * 0.08 }}
                                    >
                                        <div
                                            className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0"
                                            style={{ backgroundColor: a.color }}
                                        >
                                            {a.initials}
                                        </div>
                                        <span className="text-[12px] text-gray-700 font-medium">{a.name}</span>
                                        <motion.div
                                            className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"
                                            animate={{ opacity: [1, 0.4, 1] }}
                                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </FloatingCard>
                </motion.div>
            </div>

            {/* ── STATS ROW ── */}
            <motion.div
                className="relative z-10 max-w-4xl mx-auto px-4 py-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.5 }}
            >
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {STATS.map((s, i) => (
                        <motion.div
                            key={s.label}
                            className="text-center bg-white rounded-xl border border-gray-100 py-4 shadow-sm"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.1 + i * 0.08 }}
                            whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(0,0,0,0.07)" }}
                        >
                            <p className="text-[24px] font-black text-gray-900">{s.value}</p>
                            <p className="text-[12px] text-gray-400 font-medium mt-0.5">{s.label}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </section>
    );
}