import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

const steps = [
    {
        number: "One",
        title: "Create a room",
        description: "Start a new workspace in seconds and invite your team.",
        image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80",
        hasImage: true,
        actions: [
            { label: "Learn more", primary: true },
            { label: "Arrow", icon: "→", primary: false },
        ],
        bg: "bg-transparent",
        overlay: true,
    },
    {
        number: "Two",
        title: "Collaborate live",
        description: "Edit, draw, and chat simultaneously with instant sync.",
        image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80",
        hasImage: true,
        actions: [{ label: "Arrow", icon: "→", primary: false }],
        bg: "bg-teal-600",
        overlay: true,
    },
    {
        number: "Three",
        title: "Save and share",
        description: "Your work is always saved. Share access with a link.",
        image: null,
        hasImage: false,
        actions: [{ label: "Arrow", icon: "→", primary: false }],
        bg: "bg-zinc-700",
        overlay: false,
    },
];

const galleryImages = [
    "https://images.unsplash.com/photo-1543269664-56d93c1b41a6?w=700&q=80",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=700&q=80",
    "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=700&q=80",
    "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=700&q=80",
];

const BoxIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-white">
        <path
            d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <polyline
            points="3.27 6.96 12 12.01 20.73 6.96"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <line
            x1="12"
            y1="22.08"
            x2="12"
            y2="12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
};

const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export default function HowItWorks() {
    const [activeSlide, setActiveSlide] = useState(0);
    const sectionRef = useRef(null);
    const actionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, margin: "-80px" });
    const actionInView = useInView(actionRef, { once: true, margin: "-80px" });

    const totalDots = galleryImages.length + 4;

    const prevSlide = () => setActiveSlide((p) => Math.max(0, p - 1));
    const nextSlide = () => setActiveSlide((p) => Math.min(galleryImages.length - 1, p + 1));

    return (
        <div
            style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}
            className="min-h-screen bg-black text-white"
        >
            {/* How it works section */}
            <section className="px-4 sm:px-8 py-16 sm:py-24 max-w-4xl mx-auto" ref={sectionRef}>
                {/* Header */}
                <motion.div
                    className="text-center mb-10 sm:mb-14"
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    variants={fadeUp}
                >
                    <p className="text-xs uppercase tracking-[0.18em] text-zinc-400 mb-2 font-medium">
                        Process
                    </p>
                    <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-3">
                        How it works
                    </h2>
                    <p className="text-zinc-400 text-sm sm:text-base">
                        Three simple steps to start collaborating
                    </p>
                </motion.div>

                {/* Cards */}
                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    variants={containerVariants}
                >
                    {steps.map((step, i) => (
                        <motion.div
                            key={i}
                            variants={cardVariants}
                            className={`relative rounded-2xl overflow-hidden cursor-pointer group
                ${i === 0 ? "min-h-[240px] sm:min-h-[280px]" : "min-h-[200px] sm:min-h-[260px]"}
                ${!step.hasImage ? step.bg : ""}
              `}
                        >
                            {/* Background image */}
                            {step.hasImage && (
                                <img
                                    src={step.image}
                                    alt={step.title}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            )}

                            {/* Overlay */}
                            {step.overlay && step.hasImage && (
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
                            )}

                            {/* Teal overlay for card 2 */}
                            {i === 1 && (
                                <div className="absolute inset-0 bg-teal-700/60" />
                            )}

                            {/* Content */}
                            <div className="relative z-10 flex flex-col justify-between h-full p-5 sm:p-6">
                                <div>
                                    {/* Icon + number row */}
                                    <div className="flex items-center gap-2 mb-3">
                                        {i > 0 && (
                                            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                                <BoxIcon />
                                            </div>
                                        )}
                                        {i === 0 && (
                                            <span className="text-xs text-white/70 font-medium tracking-wide">
                                                {step.number}
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight mb-2">
                                        {step.title}
                                    </h3>
                                    <p className="text-sm text-white/75 leading-relaxed">{step.description}</p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3 mt-5">
                                    {step.actions.map((action, j) => (
                                        <motion.button
                                            key={j}
                                            whileHover={{ scale: 1.04 }}
                                            whileTap={{ scale: 0.97 }}
                                            className={`text-sm font-medium flex items-center gap-1 transition-colors
                        ${action.primary
                                                    ? "bg-white text-black px-4 py-1.5 rounded-full hover:bg-zinc-100"
                                                    : "text-white/80 hover:text-white"
                                                }`}
                                        >
                                            {action.label}
                                            {action.icon && <span className="text-base">{action.icon}</span>}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* See it in action section */}
            <section className="px-4 sm:px-8 py-10 sm:py-16 max-w-4xl mx-auto" ref={actionRef}>
                <div className="flex flex-col sm:flex-row sm:items-start gap-8 sm:gap-16">
                    {/* Left text */}
                    <motion.div
                        className="sm:w-64 flex-shrink-0"
                        initial="hidden"
                        animate={actionInView ? "visible" : "hidden"}
                        variants={fadeUp}
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight">
                            See it in action
                        </h2>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            Watch U2Collab handle real-time collaboration across editor, whiteboard, and chat.
                        </p>
                    </motion.div>

                    {/* Right gallery */}
                    <motion.div
                        className="flex-1"
                        initial={{ opacity: 0, x: 40 }}
                        animate={actionInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
                    >
                        {/* Image slider */}
                        <div className="relative overflow-hidden rounded-2xl aspect-[4/3] sm:aspect-[16/10] bg-zinc-900">
                            <motion.div
                                className="flex h-full"
                                animate={{ x: `-${activeSlide * 100}%` }}
                                transition={{ type: "spring", stiffness: 300, damping: 35 }}
                            >
                                {galleryImages.map((src, i) => (
                                    <div key={i} className="min-w-full h-full">
                                        <img
                                            src={src}
                                            alt={`Slide ${i + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </motion.div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-between mt-4">
                            {/* Arrow buttons */}
                            <div className="flex gap-2">
                                <motion.button
                                    onClick={prevSlide}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.93 }}
                                    disabled={activeSlide === 0}
                                    className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white disabled:opacity-30 transition-colors text-lg"
                                >
                                    ←
                                </motion.button>
                                <motion.button
                                    onClick={nextSlide}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.93 }}
                                    disabled={activeSlide === galleryImages.length - 1}
                                    className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white disabled:opacity-30 transition-colors text-lg"
                                >
                                    →
                                </motion.button>
                            </div>

                            {/* Dot indicators */}
                            <div className="flex gap-1.5 items-center">
                                {Array.from({ length: totalDots }).map((_, i) => {
                                    const isActive = i === activeSlide;
                                    return (
                                        <motion.button
                                            key={i}
                                            onClick={() => i < galleryImages.length && setActiveSlide(i)}
                                            animate={{
                                                width: isActive ? 20 : 6,
                                                backgroundColor: isActive ? "#ffffff" : "#52525b",
                                            }}
                                            className="h-1.5 rounded-full"
                                            transition={{ duration: 0.3 }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}