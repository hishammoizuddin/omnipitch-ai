import type { FC } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface Props {
    currentStep: string;
    progressPercent: number;
}

const STEPS = [
    { title: 'Preparing Inputs', label: 'Inputs' },
    { title: 'Parsing Architecture', label: 'Structure' },
    { title: 'Extracting Business Value', label: 'Value' },
    { title: 'Structuring Narrative', label: 'Story' },
    { title: 'Formatting Custom JSON', label: 'Slides' },
    { title: 'Rendering Presentation', label: 'Render' },
    { title: 'Completed', label: 'Done' },
];

export const ExecutionStepper: FC<Props> = ({ currentStep, progressPercent }) => {
    const currentIndex = Math.max(STEPS.findIndex((step) => step.title === currentStep), 0);
    const activeStep = STEPS[currentIndex] || STEPS[0];

    return (
        <section className="rounded-[30px] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-5 shadow-[0_20px_60px_rgba(24,38,31,0.05)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">Progress</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[color:var(--text)]">{activeStep.label}</h2>
                </div>
                <p className="text-sm text-[color:var(--muted)]">{Math.max(progressPercent, 0)}% complete</p>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-[color:var(--surface-muted)]">
                <motion.div
                    className="h-full rounded-full bg-[color:var(--accent)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progressPercent, 100)}%` }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
                {STEPS.map((step, index) => {
                    const isCompleted = index < currentIndex || (step.title === 'Completed' && currentStep === 'Completed');
                    const isCurrent = step.title === currentStep && step.title !== 'Completed';

                    return (
                        <div
                            key={step.title}
                            className={clsx(
                                'rounded-2xl border px-3 py-3 text-sm transition',
                                isCurrent
                                    ? 'border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--accent)]'
                                    : isCompleted
                                        ? 'border-transparent bg-[rgba(23,76,60,0.12)] text-[color:var(--accent)]'
                                        : 'border-[color:var(--border)] bg-[color:var(--panel-strong)] text-[color:var(--muted)]'
                            )}
                        >
                            <div className="flex items-center gap-2">
                                <span
                                    className={clsx(
                                        'h-2.5 w-2.5 rounded-full',
                                        isCurrent ? 'bg-[color:var(--accent)]' : isCompleted ? 'bg-[color:var(--accent-warm)]' : 'bg-[color:var(--border)]'
                                    )}
                                />
                                <span>{step.label}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};
