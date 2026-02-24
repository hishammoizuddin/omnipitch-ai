import { motion } from 'framer-motion';
import { Layers, Zap, Presentation, ArrowRight } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface LandingPageProps {
    onLoginClick: () => void;
}

export function LandingPage({ onLoginClick }: LandingPageProps) {
    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, ease: "easeOut" }
    };

    const stagger = {
        animate: {
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30 font-sans overflow-x-hidden">
            {/* Global Navigation */}
            <nav className="absolute top-0 w-full p-6 flex justify-between items-center z-50">
                <BrandLogo />
                <div className="flex items-center space-x-4">
                    <button
                        onClick={onLoginClick}
                        className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-4 py-2"
                    >
                        Log In
                    </button>
                    <button
                        onClick={onLoginClick}
                        className="bg-white text-slate-900 hover:bg-slate-100 text-sm font-medium px-5 py-2.5 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                        Get Started
                    </button>
                </div>
            </nav>

            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
            <div className="absolute top-[40%] right-[-10%] w-[40%] h-[60%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

            {/* Hero Section */}
            <main className="relative z-10 pt-32 pb-24 md:pt-48 md:pb-32 px-4 max-w-7xl mx-auto flex flex-col items-center text-center">
                <motion.div
                    initial="initial"
                    animate="animate"
                    variants={stagger}
                    className="max-w-4xl"
                >
                    <motion.div variants={fadeIn} className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl shadow-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        <span className="text-xs font-semibold text-slate-300 tracking-wide">OmniPitchAI is Live</span>
                    </motion.div>

                    <motion.h1 variants={fadeIn} className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 text-white drop-shadow-sm leading-tight">
                        Transform Complex Ideas <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">
                            into Executive Strategy.
                        </span>
                    </motion.h1>

                    <motion.p variants={fadeIn} className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed mb-10 font-light">
                        Accelerate enterprise alignment. OmniPitch leverages autonomous Agentic AI to instantly convert technical architectures and project specifications into persuasive, boardroom-ready presentations tailored to over 100 distinct executive personas.
                    </motion.p>

                    <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={onLoginClick}
                            className="w-full sm:w-auto flex items-center justify-center px-8 py-4 bg-white hover:bg-slate-100 text-slate-900 text-lg font-bold rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1"
                        >
                            Start Generating
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </button>
                    </motion.div>
                </motion.div>
            </main>

            {/* How It Works Section */}
            <section className="relative z-10 py-24 bg-black/20 border-t border-white/5 backdrop-blur-3xl">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">How It Works</h2>
                        <p className="text-lg text-slate-400 font-light max-w-2xl mx-auto">
                            Our intelligent Agentic AI orchestrates a seamless transformation from raw enterprise data to persuasive, executive-grade presentations.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Step 1 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/[0.07] transition-colors"
                        >
                            <div className="w-14 h-14 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mb-6">
                                <Layers className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">1. Provide Technical Context</h3>
                            <p className="text-slate-400 leading-relaxed font-light text-[15px]">
                                Upload fragmented project files, technical documentation, or strategic outlines. OmniPitch instantly processes and indexes your unique enterprise context.
                            </p>
                        </motion.div>

                        {/* Step 2 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/[0.07] transition-colors"
                        >
                            <div className="w-14 h-14 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-6">
                                <Zap className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">2. Agentic AI Synthesis</h3>
                            <p className="text-slate-400 leading-relaxed font-light text-[15px]">
                                Deploy a specialized swarm of autonomous AI agents that collaboratively analyze your inputs, extract core business value, and construct a compelling narrative flow.
                            </p>
                        </motion.div>

                        {/* Step 3 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/[0.07] transition-colors"
                        >
                            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
                                <Presentation className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">3. Boardroom-Ready Output</h3>
                            <p className="text-slate-400 leading-relaxed font-light text-[15px]">
                                Instantly download a meticulously formatted, high-impact presentation specifically optimized for your target stakeholder out of 100+ unique corporate personas.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/10 bg-black/40 py-12 text-center text-slate-500 text-sm">
                <p>© 2026 Aisynch Labs. All rights reserved.</p>
            </footer>
        </div>
    );
}
