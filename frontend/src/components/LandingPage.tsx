import { motion } from 'framer-motion';
import { ArrowRight, FileStack, LayoutTemplate, Wand2 } from 'lucide-react';

import { BrandLogo } from './BrandLogo';
import { SiteFooter } from './SiteFooter';
import { ThemeToggle } from './ThemeToggle';

interface LandingPageProps {
    onLoginClick: () => void;
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
}

const STEPS = [
    {
        title: 'Brief',
        detail: 'Add a topic, audience, and a few notes.',
        icon: Wand2,
    },
    {
        title: 'Upload',
        detail: 'Drop in docs, slides, code, or PDFs.',
        icon: FileStack,
    },
    {
        title: 'Review',
        detail: 'Check the draft, then export the deck.',
        icon: LayoutTemplate,
    },
];

export function LandingPage({ onLoginClick, theme, onToggleTheme }: LandingPageProps) {
    return (
        <div className="relative flex min-h-screen flex-col overflow-hidden bg-[color:var(--app-bg)] text-[color:var(--text)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(23,76,60,0.14),transparent_24%),radial-gradient(circle_at_88%_12%,rgba(184,105,54,0.12),transparent_26%)]" />

            <nav className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
                <BrandLogo />
                <div className="flex items-center gap-3">
                    <ThemeToggle theme={theme} onToggle={onToggleTheme} />
                    <button
                        onClick={onLoginClick}
                        className="rounded-full border border-[color:var(--border)] bg-[color:var(--panel)] px-4 py-2 text-sm font-medium text-[color:var(--text)] transition-colors hover:bg-[color:var(--panel-soft)]"
                    >
                        Sign in
                    </button>
                    <button
                        onClick={onLoginClick}
                        className="inline-flex items-center gap-2 rounded-full bg-[color:var(--accent)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[color:var(--accent-strong)]"
                    >
                        Start
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </nav>

            <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-4 pb-16 pt-8 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-center lg:gap-16 lg:px-8 lg:pb-24 lg:pt-14">
                <section className="max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, ease: 'easeOut' }}
                    >
                        <div className="inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--panel)] px-3 py-1 text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">
                            simple deck workflow
                        </div>
                        <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-tight text-[color:var(--text)] sm:text-6xl">
                            Make a clear deck from messy source material.
                        </h1>
                        <p className="mt-5 max-w-2xl text-lg leading-8 text-[color:var(--muted)]">
                            OmniPitchAI turns notes, docs, code, PDFs, and images into one clean presentation flow.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.08, ease: 'easeOut' }}
                        className="mt-10 flex flex-col gap-4 sm:flex-row"
                    >
                        <button
                            onClick={onLoginClick}
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--accent)] px-7 py-3.5 text-base font-medium text-white transition-colors hover:bg-[color:var(--accent-strong)]"
                        >
                            Start a deck
                            <ArrowRight className="h-4 w-4" />
                        </button>
                        <div className="rounded-full border border-[color:var(--border)] bg-[color:var(--panel)] px-5 py-3 text-sm text-[color:var(--muted)]">
                            Works with briefs only or briefs plus files.
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.14, ease: 'easeOut' }}
                        className="mt-12 grid gap-4 md:grid-cols-3"
                    >
                        {STEPS.map((step) => {
                            const Icon = step.icon;
                            return (
                                <div
                                    key={step.title}
                                    className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-5 shadow-[0_20px_60px_rgba(24,38,31,0.06)]"
                                >
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--accent-soft)] text-[color:var(--accent)]">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <p className="mt-4 text-lg font-medium text-[color:var(--text)]">{step.title}</p>
                                    <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{step.detail}</p>
                                </div>
                            );
                        })}
                    </motion.div>
                </section>

                <motion.aside
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.12, ease: 'easeOut' }}
                    className="rounded-[32px] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-6 shadow-[0_28px_80px_rgba(24,38,31,0.08)]"
                >
                    <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">What changes</p>
                    <div className="mt-6 space-y-4">
                        <div className="rounded-3xl bg-[color:var(--surface-muted)] p-4">
                            <p className="text-sm text-[color:var(--muted)]">Before</p>
                            <p className="mt-2 text-base font-medium text-[color:var(--text)]">
                                Too many steps, too much explanation, and too many places to look.
                            </p>
                        </div>
                        <div className="rounded-3xl bg-[color:var(--accent)] p-4 text-white">
                            <p className="text-sm text-white/70">Now</p>
                            <p className="mt-2 text-base font-medium">
                                One simple brief, one workspace, and clear actions when the deck is ready.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 rounded-[28px] border border-[color:var(--border)] bg-[color:var(--panel)] p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-[color:var(--text)]">New deck</span>
                            <span className="rounded-full bg-[color:var(--accent-soft)] px-3 py-1 text-xs text-[color:var(--accent)]">3 min setup</span>
                        </div>
                        <div className="mt-5 space-y-3">
                            {['Topic', 'Audience', 'Files'].map((item, index) => (
                                <div key={item} className="flex items-center gap-3 rounded-2xl bg-[color:var(--surface-muted)] px-4 py-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--panel-strong)] text-sm font-medium text-[color:var(--accent)]">
                                        {index + 1}
                                    </div>
                                    <span className="text-sm text-[color:var(--text)]">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.aside>
            </main>

            <SiteFooter className="relative z-10 bg-[color:var(--surface)]" />
        </div>
    );
}
