import type { FC } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2 } from 'lucide-react';
import clsx from 'clsx';

interface Props {
    currentStep: string;
    progressPercent: number;
}

const STEPS = [
    {
        title: 'Preparing Inputs',
        detail: 'Digesting the brief and normalizing the source packet.',
    },
    {
        title: 'Parsing Architecture',
        detail: 'Extracting system structure, patterns, and differentiators.',
    },
    {
        title: 'Extracting Business Value',
        detail: 'Converting technical work into outcomes leaders care about.',
    },
    {
        title: 'Structuring Narrative',
        detail: 'Mapping the deck arc and headline story flow.',
    },
    {
        title: 'Formatting Custom JSON',
        detail: 'Building the premium slide schema for rendering.',
    },
    {
        title: 'Rendering Presentation',
        detail: 'Turning the structured story into the final deck file.',
    },
    {
        title: 'Completed',
        detail: 'Preview and export are ready.',
    },
];

export const ExecutionStepper: FC<Props> = ({ currentStep, progressPercent }) => {
    const currentIndex = Math.max(STEPS.findIndex((step) => step.title === currentStep), 0);

    return (
        <section className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.9),rgba(15,23,42,0.6))] p-6 md:p-7 shadow-[0_22px_70px_rgba(2,6,23,0.32)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="max-w-2xl">
                    <p className="text-[11px] uppercase tracking-[0.26em] text-sky-200/75">Generation Journey</p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">The deck stays traceable from ingestion to render.</h2>
                    <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                        Every stage keeps the user brief, uploaded context, and narrative structure connected so the output feels deliberate rather than stitched together.
                    </p>
                </div>

                <div className="md:text-right">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Progress</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{Math.max(progressPercent, 0)}%</p>
                </div>
            </div>

            <div className="mt-6 h-2 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-sky-400 via-cyan-300 to-amber-300"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progressPercent, 100)}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                />
            </div>

            <div className="mt-6 grid gap-3 xl:grid-cols-7">
                {STEPS.map((step, index) => {
                    const isCompleted = index < currentIndex || (step.title === 'Completed' && currentStep === 'Completed');
                    const isCurrent = index === currentIndex && step.title !== 'Completed';

                    return (
                        <div
                            key={step.title}
                            className={clsx(
                                'rounded-[24px] border p-4 transition-all',
                                isCurrent
                                    ? 'border-sky-400/35 bg-sky-400/[0.08] shadow-[0_16px_40px_rgba(56,189,248,0.12)]'
                                    : 'border-white/10 bg-white/[0.03]',
                            )}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div
                                    className={clsx(
                                        'w-9 h-9 rounded-2xl flex items-center justify-center border',
                                        isCompleted
                                            ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                                            : isCurrent
                                                ? 'border-sky-400/30 bg-sky-400/10 text-sky-300'
                                                : 'border-white/10 bg-slate-950/60 text-slate-500',
                                    )}
                                >
                                    {isCompleted ? (
                                        <CheckCircle2 className="w-4 h-4" />
                                    ) : isCurrent ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <span className="text-xs font-semibold">{index + 1}</span>
                                    )}
                                </div>
                                <span
                                    className={clsx(
                                        'text-[10px] uppercase tracking-[0.22em]',
                                        isCompleted ? 'text-emerald-200/80' : isCurrent ? 'text-sky-200/80' : 'text-slate-600',
                                    )}
                                >
                                    {isCompleted ? 'Done' : isCurrent ? 'Live' : 'Queued'}
                                </span>
                            </div>

                            <p className={clsx('mt-4 text-sm font-medium', isCurrent ? 'text-white' : isCompleted ? 'text-slate-200' : 'text-slate-400')}>
                                {step.title}
                            </p>
                            <p className="mt-2 text-xs leading-relaxed text-slate-500">{step.detail}</p>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};
