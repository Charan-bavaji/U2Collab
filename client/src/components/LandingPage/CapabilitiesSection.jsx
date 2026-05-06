import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

// ── Feature data ─────────────────────────────────────────────────────────────
const FEATURES = [
    {
        id: "editor",
        label: "Rich-text editor",
        desc: "Format text, embed links, and collaborate on documents with real-time sync across your team.",
        color: "#2563EB",
        bg: "bg-blue-50",
        accent: "bg-blue-600",
        tag: "CRDT-powered",
        tagColor: "text-blue-600 bg-blue-100",
        image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80",
        stats: { value: "<50ms", label: "sync latency" },
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
        ),
        mockup: "editor",
    },
    {
        id: "whiteboard",
        label: "Infinite whiteboard",
        desc: "Draw, sketch, and arrange ideas freely. Add shapes, sticky notes, and freehand drawings instantly.",
        color: "#10B981",
        bg: "bg-emerald-50",
        accent: "bg-emerald-500",
        tag: "Infinite canvas",
        tagColor: "text-emerald-700 bg-emerald-100",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80",
        stats: { value: "∞", label: "canvas size" },
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
            </svg>
        ),
        mockup: "whiteboard",
    },
    {
        id: "chat",
        label: "Team chat",
        desc: "Message your team without leaving the workspace. Keep conversations tied to the work itself.",
        color: "#F59E0B",
        bg: "bg-amber-50",
        accent: "bg-amber-500",
        tag: "Context-aware",
        tagColor: "text-amber-700 bg-amber-100",
        image: "https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=600&auto=format&fit=crop&q=80",
        stats: { value: "0", label: "app switching" },
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        ),
        mockup: "chat",
    },
    {
        id: "presence",
        label: "Live presence",
        desc: "See who's online, watch their cursors move, and know when they're typing in real time.",
        color: "#8B5CF6",
        bg: "bg-violet-50",
        accent: "bg-violet-500",
        tag: "Real-time",
        tagColor: "text-violet-700 bg-violet-100",
        image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600&auto=format&fit=crop&q=80",
        stats: { value: "2.4k", label: "online now" },
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
        mockup: "presence",
    },
];

// ── Mini Mockups ─────────────────────────────────────────────────────────────
function EditorMockup() {
    return (
        <div className="p-3 space-y-2">
            {["Heading — Q2 Planning", "• Define sprint goals for May", "• Review backlog items", "• Assign owners per feature"].map((line, i) => (
                <motion.div
                    key={i}
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                >
                    <div
                        className="h-2.5 rounded-sm bg-gray-200"
                        style={{ width: i === 0 ? "75%" : `${55 + i * 8}%`, backgroundColor: i === 0 ? "#2563EB22" : "#e5e7eb" }}
                    />
                    {i === 1 && (
                        <motion.div className="w-0.5 h-3.5 bg-blue-500 rounded-full" animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.9, repeat: Infinity }} />
                    )}
                </motion.div>
            ))}
            <div className="mt-3 flex items-center gap-1.5">
                {["B", "I", "U", "⌘", "🔗"].map((t, i) => (
                    <div key={i} className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-[9px] font-bold text-gray-500">{t}</div>
                ))}
            </div>
        </div>
    );
}

function WhiteboardMockup() {
    const shapes = [
        { type: "rect", x: 12, y: 14, w: 36, h: 24, color: "#2563EB22", border: "#2563EB" },
        { type: "rect", x: 58, y: 10, w: 32, h: 20, color: "#10B98122", border: "#10B981" },
        { type: "rect", x: 36, y: 50, w: 28, h: 28, color: "#F59E0B22", border: "#F59E0B" },
    ];
    return (
        <div className="p-2 h-full relative">
            <svg viewBox="0 0 100 90" className="w-full h-full">
                {shapes.map((s, i) => (
                    <motion.rect
                        key={i} x={s.x} y={s.y} width={s.w} height={s.h} rx="3"
                        fill={s.color} stroke={s.border} strokeWidth="1"
                        initial={{ scale: 0, originX: "50%", originY: "50%" }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.15, type: "spring", stiffness: 200 }}
                    />
                ))}
                <motion.path
                    d="M20 70 Q40 55 60 68 Q75 78 88 65"
                    stroke="#8B5CF6" strokeWidth="1.5" fill="none" strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                />
                <motion.text x="14" y="29" fontSize="4" fill="#2563EB" fontWeight="600"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                    Idea A
                </motion.text>
                <motion.text x="60" y="23" fontSize="4" fill="#10B981" fontWeight="600"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
                    Idea B
                </motion.text>
                <motion.text x="38" y="68" fontSize="4" fill="#F59E0B" fontWeight="600"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                    Notes
                </motion.text>
            </svg>
        </div>
    );
}

function ChatMockup() {
    const msgs = [
        { from: "AK", color: "#2563EB", text: "Updated the roadmap doc ✅", align: "left" },
        { from: "TS", color: "#10B981", text: "On it — reviewing now", align: "right" },
        { from: "PM", color: "#F59E0B", text: "Added comments in editor 👍", align: "left" },
    ];
    return (
        <div className="p-3 space-y-2.5">
            {msgs.map((m, i) => (
                <motion.div
                    key={i}
                    className={`flex items-end gap-1.5 ${m.align === "right" ? "flex-row-reverse" : ""}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.15 }}
                >
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0" style={{ backgroundColor: m.color }}>
                        {m.from}
                    </div>
                    <div className={`px-2.5 py-1.5 rounded-xl text-[11px] font-medium max-w-[75%] ${m.align === "right" ? "bg-blue-600 text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"}`}>
                        {m.text}
                    </div>
                </motion.div>
            ))}
            <motion.div className="flex items-center gap-1.5 pt-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                <div className="flex-1 bg-gray-100 rounded-full px-3 py-1.5 text-[10px] text-gray-400">Reply to thread...</div>
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" /></svg>
                </div>
            </motion.div>
        </div>
    );
}

function PresenceMockup() {
    const users = [
        { name: "Aria K.", color: "#2563EB", status: "editing" },
        { name: "Tom S.", color: "#10B981", status: "viewing" },
        { name: "Priya M.", color: "#F59E0B", status: "typing..." },
        { name: "Luis R.", color: "#8B5CF6", status: "idle" },
    ];
    return (
        <div className="p-3 space-y-2">
            {users.map((u, i) => (
                <motion.div
                    key={i}
                    className="flex items-center gap-2.5"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                >
                    <div className="relative">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ backgroundColor: u.color }}>
                            {u.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <motion.div
                            className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
                            style={{ backgroundColor: u.status === "idle" ? "#d1d5db" : "#10B981" }}
                            animate={{ scale: u.status !== "idle" ? [1, 1.3, 1] : 1 }}
                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-gray-800 leading-none">{u.name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{u.status}</p>
                    </div>
                    {u.status === "typing..." && (
                        <div className="flex items-end gap-0.5">
                            {[0, 0.15, 0.3].map((d, j) => (
                                <motion.div key={j} className="w-1 h-1 rounded-full bg-amber-400"
                                    animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: d }} />
                            ))}
                        </div>
                    )}
                </motion.div>
            ))}
        </div>
    );
}

const MOCKUP_MAP = {
    editor: <EditorMockup />,
    whiteboard: <WhiteboardMockup />,
    chat: <ChatMockup />,
    presence: <PresenceMockup />,
};

// ── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({ feature, index, isActive, onHover }) {
    return (
        <motion.div
            className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer group"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: index * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -6, boxShadow: `0 20px 48px ${feature.color}22` }}
            onHoverStart={() => onHover(feature.id)}
            onHoverEnd={() => onHover(null)}
        >
            {/* top accent line */}
            <motion.div
                className="absolute top-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: feature.color }}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
            />

            {/* image */}
            <div className="relative h-44 overflow-hidden">
                <motion.img
                    src={feature.image}
                    alt={feature.label}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.06 }}
                    transition={{ duration: 0.5 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                {/* tag */}
                <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold ${feature.tagColor} backdrop-blur-sm`}>
                    {feature.tag}
                </div>

                {/* stat */}
                <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-2.5 py-1.5 text-center shadow-sm">
                    <p className="text-[15px] font-black text-gray-900 leading-none">{feature.stats.value}</p>
                    <p className="text-[9px] text-gray-500 font-medium">{feature.stats.label}</p>
                </div>
            </div>

            {/* content */}
            <div className="p-5">
                <div className="flex items-center gap-2.5 mb-2">
                    <motion.div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${feature.color}15`, color: feature.color }}
                        whileHover={{ rotate: 8, scale: 1.1 }}
                    >
                        {feature.icon}
                    </motion.div>
                    <h3 className="text-[15px] font-bold text-gray-900">{feature.label}</h3>
                </div>
                <p className="text-[13px] text-gray-500 leading-relaxed">{feature.desc}</p>

                {/* mini mockup — expands on hover */}
                <AnimatePresence>
                    {isActive && (
                        <motion.div
                            className="mt-4 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        >
                            {MOCKUP_MAP[feature.mockup]}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* learn more */}
                <motion.div
                    className="mt-4 flex items-center gap-1.5 text-[12.5px] font-semibold"
                    style={{ color: feature.color }}
                    whileHover={{ gap: "8px" }}
                >
                    <span>Learn more</span>
                    <motion.span animate={{ x: isActive ? 3 : 0 }} transition={{ duration: 0.2 }}>→</motion.span>
                </motion.div>
            </div>
        </motion.div>
    );
}

// ── Main Section ─────────────────────────────────────────────────────────────
export default function CapabilitiesSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-80px" });
    const [activeCard, setActiveCard] = useState(null);

    return (
        <section ref={ref} className="relative bg-[#F2F2F2] py-24 overflow-hidden">
            {/* bg decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-6xl mx-auto px-4 sm:px-6">

                {/* ── Header ── */}
                <div className="text-center mb-16">
                    {/* <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3.5 py-1.5 mb-5 shadow-sm"
          >
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-blue-500"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-[11.5px] font-semibold uppercase tracking-widest text-gray-500">
              Capabilities
            </span>
          </motion.div> */}

                    <motion.h2
                        className="text-[42px] sm:text-[52px] font-black text-gray-900 leading-tight tracking-tight mb-5"
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.1, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                    >
                        Everything you need to{" "}
                        <span className="relative inline-block">
                            collaborate
                            <motion.svg
                                className="absolute -bottom-1 left-0 w-full"
                                viewBox="0 0 280 10"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
                                transition={{ delay: 0.7, duration: 0.6 }}
                            >
                                <motion.path
                                    d="M0 6 Q70 1 140 6 Q210 11 280 6"
                                    stroke="#2563EB" strokeWidth="3" fill="none" strokeLinecap="round"
                                    initial={{ pathLength: 0 }}
                                    animate={isInView ? { pathLength: 1 } : {}}
                                    transition={{ delay: 0.7, duration: 0.6 }}
                                />
                            </motion.svg>
                        </span>
                    </motion.h2>

                    <motion.p
                        className="text-[16px] text-gray-500 max-w-xl mx-auto leading-relaxed"
                        initial={{ opacity: 0, y: 12 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.2, duration: 0.45 }}
                    >
                        Rich editor, infinite canvas, instant messaging, and live presence all in one place.{" "}
                        <span className="font-medium text-gray-700">No switching between apps.</span>
                    </motion.p>
                </div>

                {/* ── Cards grid ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {FEATURES.map((feature, i) => (
                        <FeatureCard
                            key={feature.id}
                            feature={feature}
                            index={i}
                            isActive={activeCard === feature.id}
                            onHover={setActiveCard}
                        />
                    ))}
                </div>

                {/* ── CTA row ── */}
                <motion.div
                    className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4"
                    initial={{ opacity: 0, y: 16 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.55, duration: 0.45 }}
                >
                    <motion.a
                        href="#"
                        whileHover={{ scale: 1.04, boxShadow: "0 8px 30px rgba(37,99,235,0.3)" }}
                        whileTap={{ scale: 0.97 }}
                        className="inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[14.5px] rounded-xl shadow-md shadow-blue-100 transition-colors no-underline"
                    >
                        Explore all features
                        <motion.span animate={{ x: [0, 3, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>→</motion.span>
                    </motion.a>

                    <motion.a
                        href="#"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="inline-flex items-center gap-2 px-7 py-3.5 bg-white border border-gray-200 text-gray-700 font-semibold text-[14.5px] rounded-xl hover:bg-gray-50 transition-colors no-underline shadow-sm"
                    >
                        View roadmap
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </motion.a>
                </motion.div>

                {/* ── trust badges ── */}
                {/* <motion.div
                    className="mt-10 flex flex-wrap items-center justify-center gap-6"
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ delay: 0.7 }}
                >
                    {[
                        { icon: "🔒", text: "SOC 2 Type II" },
                        { icon: "⚡", text: "99.9% uptime SLA" },
                        { icon: "🌍", text: "GDPR compliant" },
                        { icon: "🔄", text: "CRDT conflict-free" },
                    ].map((b) => (
                        <div key={b.text} className="flex items-center gap-1.5 text-[12px] text-gray-400 font-medium">
                            <span>{b.icon}</span>
                            <span>{b.text}</span>
                        </div>
                    ))}
                </motion.div> */}
            </div>
        </section>
    );
}