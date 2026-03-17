import { Activity, Compass, Files, Layers3, Sparkles } from 'lucide-react';
import clsx from 'clsx';

import type { WizardData } from '../Wizard/FormWizard';
import type { GenerationSource, GenerationSourceSummary, PresentationDeck } from '../../types/generation';

interface LeftSidebarProps {
    status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
    currentStep: string;
    progressPercent: number;
    request: WizardData | null;
    sources: GenerationSource[];
    outline: string[];
    sourceSummary: GenerationSourceSummary;
    presentation: PresentationDeck | null;
}

const PIPELINE_STEPS = [
    'Preparing Inputs',
    'Parsing Architecture',
    'Extracting Business Value',
    'Structuring Narrative',
    'Formatting Custom JSON',
    'Rendering Presentation',
    'Completed',
];

function statusLabel(status: LeftSidebarProps['status']) {
    if (status === 'idle') return 'Ready';
    if (status === 'uploading') return 'Uploading';
    if (status === 'processing') return 'Live';
    if (status === 'completed') return 'Ready';
    return 'Issue';
}

export function LeftSidebar({
    status,
    currentStep,
    progressPercent,
    request,
    sources,
    outline,
    sourceSummary,
    presentation,
}: LeftSidebarProps) {
    const activeIndex = PIPELINE_STEPS.indexOf(currentStep);
    const sourceList: GenerationSource[] = sources.length > 0
        ? sources
        : request?.files.map((file) => ({ name: file.name, kind: 'Source', skipped: false })) || [];
    const deckTitle = presentation?.deck_title || request?.topic || 'Executive Deck Workspace';
    const slideCount = presentation ? presentation.slides.length + 2 : outline.length || 0;

    return (
        <aside className="w-[22rem] flex-shrink-0 border-r border-white/10 bg-slate-950/65 backdrop-blur-3xl p-5 flex flex-col h-full overflow-y-auto">
            <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(8,15,30,0.86))] p-5 shadow-[0_24px_80px_rgba(2,6,23,0.32)]">
                <div className="flex items-center gap-2 text-sky-200">
                    <Compass className="w-4 h-4" />
                    <span className="text-[11px] uppercase tracking-[0.26em]">Workspace Map</span>
                </div>

                <div className="mt-4">
                    <p className="text-xs text-slate-500">Active deck</p>
                    <h2 className="mt-2 text-lg font-semibold text-white leading-snug">{deckTitle}</h2>
                    <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                        {request
                            ? 'The brief, source packet, and generated story stay connected here throughout the run.'
                            : 'Start with a topic and audience, then attach the source packet to shape the deck.'}
                    </p>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                        <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Status</p>
                        <p className="mt-2 text-sm font-medium text-white">{statusLabel(status)}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                        <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Slides</p>
                        <p className="mt-2 text-sm font-medium text-white">{slideCount}</p>
                    </div>
                </div>

                <div className="mt-5 rounded-2xl border border-sky-400/15 bg-sky-400/[0.08] p-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.24em] text-sky-200/70">Pipeline Completion</p>
                            <p className="mt-2 text-sm font-medium text-white">{currentStep || 'Awaiting brief'}</p>
                        </div>
                        <p className="text-lg font-semibold text-white">{Math.max(progressPercent, 0)}%</p>
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-white/5 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-sky-400 via-cyan-300 to-amber-300 transition-all duration-500"
                            style={{ width: `${Math.min(Math.max(progressPercent, 0), 100)}%` }}
                        />
                    </div>
                </div>
            </div>

            {!request ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                        <Sparkles className="w-5 h-5 text-slate-500" />
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">
                        Fill in the brief, add docs or source files, and the workspace will turn into a live deck review surface.
                    </p>
                </div>
            ) : (
                <div className="space-y-4 mt-4">
                    <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Layers3 className="w-4 h-4 text-sky-300" />
                            <p className="text-sm font-medium text-white">Brief</p>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Audience</p>
                                <p className="mt-1 text-sm text-slate-200">{request.audience || 'General audience'}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Duration</p>
                                    <p className="mt-1 text-sm text-slate-200">{request.duration} min</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Tone</p>
                                    <p className="mt-1 text-sm text-slate-200">{request.tone}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">AI guidance</p>
                                <p className="mt-1 text-sm text-slate-400 leading-relaxed">
                                    {request.sections || 'No additional guidance was provided for this deck.'}
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Activity className="w-4 h-4 text-sky-300" />
                            <p className="text-sm font-medium text-white">Pipeline</p>
                        </div>
                        <div className="space-y-3">
                            {PIPELINE_STEPS.map((step, index) => {
                                const isCompleted = activeIndex > index || (status === 'completed' && step === 'Completed');
                                const isCurrent = step === currentStep && status !== 'completed';

                                return (
                                    <div key={step} className="flex items-center gap-3">
                                        <div
                                            className={clsx(
                                                'w-2.5 h-2.5 rounded-full transition-all',
                                                isCompleted
                                                    ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.42)]'
                                                    : isCurrent
                                                        ? 'bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.42)] animate-pulse'
                                                        : 'bg-slate-700',
                                            )}
                                        />
                                        <p
                                            className={clsx(
                                                'text-xs transition-colors',
                                                isCompleted ? 'text-slate-300' : isCurrent ? 'text-white font-medium' : 'text-slate-500',
                                            )}
                                        >
                                            {step}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                        <div className="flex items-center justify-between gap-3 mb-4">
                            <div className="flex items-center gap-2">
                                <Files className="w-4 h-4 text-sky-300" />
                                <p className="text-sm font-medium text-white">Source Packet</p>
                            </div>
                            <span className="text-[11px] text-slate-500">{sourceSummary.files_received || sourceList.length} items</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                            <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-2.5">
                                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Text</p>
                                <p className="mt-1 text-sm font-medium text-white">{sourceSummary.text_sources}</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-2.5">
                                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Images</p>
                                <p className="mt-1 text-sm font-medium text-white">{sourceSummary.image_sources}</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-2.5">
                                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Archive</p>
                                <p className="mt-1 text-sm font-medium text-white">{sourceSummary.archive_entries}</p>
                            </div>
                        </div>

                        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                            {sourceList.map((source, index) => (
                                <div key={`${source.name}-${index}`} className="rounded-2xl border border-white/10 bg-slate-950/45 px-3 py-2.5">
                                    <p className="text-xs font-medium text-slate-100 truncate">{source.name}</p>
                                    <p className="mt-1 text-[11px] text-slate-500">
                                        {source.kind}
                                        {source.skipped ? ' • Skipped' : ''}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-sm font-medium text-white mb-3">Deck Outline</p>
                        {outline.length > 0 ? (
                            <div className="space-y-2">
                                {outline.map((title, index) => (
                                    <div key={`${title}-${index}`} className="rounded-2xl border border-white/10 bg-slate-950/45 px-3 py-2.5">
                                        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Slide {index + 1}</p>
                                        <p className="mt-1 text-xs text-slate-200 leading-relaxed">{title}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-500 leading-relaxed">
                                The narrative outline will appear here once the deck structure is ready.
                            </p>
                        )}
                    </section>
                </div>
            )}
        </aside>
    );
}
