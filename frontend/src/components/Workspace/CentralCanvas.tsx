import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowRight,
    Download,
    Eye,
    FileDown,
    FileStack,
    Layers3,
    RefreshCcw,
    Sparkles,
    TriangleAlert,
} from 'lucide-react';

import { ExecutionStepper } from '../ExecutionStepper';
import { FormWizard } from '../Wizard/FormWizard';
import type { WizardData } from '../Wizard/FormWizard';
import { DeckPreview } from '../DeckPreview';
import { exportDeckAsPdf } from '../../lib/exportDeckAsPdf';
import type { GenerationSource, GenerationSourceSummary, PresentationDeck } from '../../types/generation';

interface CentralCanvasProps {
    status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
    currentStep: string;
    progressPercent: number;
    request: WizardData | null;
    warnings: string[];
    sources: GenerationSource[];
    sourceSummary: GenerationSourceSummary;
    outline: string[];
    slidesGenerated: number;
    presentation: PresentationDeck | null;
    onGenerate: (data: WizardData) => void;
    downloadUrl: string;
    onReset: () => void;
}

const JOURNEY_POINTS = [
    {
        title: 'One context packet',
        detail: 'Mix docs, diagrams, code, notes, and archives into a single generation flow.',
    },
    {
        title: 'Live narrative visibility',
        detail: 'Watch the outline and premium slide structure form before the final export is done.',
    },
    {
        title: 'Immediate review and export',
        detail: 'Preview the generated deck in-app, then export it as PPTX or PDF in one place.',
    },
];

function buildSourceList(request: WizardData | null, sources: GenerationSource[]) {
    if (sources.length > 0) {
        return sources;
    }

    return request?.files.map((file) => ({
        name: file.name,
        kind: 'Source',
        skipped: false,
    })) || [];
}

function PreviewPlaceholder({
    outline,
    currentStep,
    request,
}: {
    outline: string[];
    currentStep: string;
    request: WizardData | null;
}) {
    return (
        <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.9),rgba(8,15,30,0.82))] p-6 shadow-[0_28px_90px_rgba(2,6,23,0.34)]">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-2xl border border-white/10 bg-sky-400/10 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-sky-300" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-white">Deck preview will appear here</h2>
                    <p className="text-sm text-slate-400">
                        {currentStep
                            ? `Current stage: ${currentStep}.`
                            : 'We will switch to a live preview as soon as the narrative structure is available.'}
                    </p>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[28px] border border-white/10 bg-slate-950/55 p-5">
                    <div className="aspect-[16/9] rounded-[26px] border border-dashed border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(245,158,11,0.1),transparent_25%),rgba(15,23,42,0.86)] p-6 flex flex-col justify-between">
                        <div className="space-y-3">
                            <div className="h-3 w-28 rounded-full bg-white/10" />
                            <div className="h-8 w-2/3 rounded-full bg-white/10" />
                            <div className="h-3 w-1/2 rounded-full bg-white/5" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                                    <div className="h-2.5 w-16 rounded-full bg-white/10" />
                                    <div className="mt-4 h-3 w-full rounded-full bg-white/5" />
                                    <div className="mt-2 h-3 w-5/6 rounded-full bg-white/5" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-slate-950/50 p-5">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Narrative scaffolding</p>
                    <h3 className="mt-3 text-lg font-semibold text-white">{request?.topic || 'Executive deck in progress'}</h3>
                    <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                        We use the parsed architecture and business-value pass to shape a more deliberate consulting-style deck before the final render.
                    </p>

                    <div className="mt-5 space-y-2">
                        {outline.length > 0 ? (
                            outline.map((title, index) => (
                                <div key={`${title}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Slide {index + 1}</p>
                                    <p className="mt-1 text-sm text-slate-200">{title}</p>
                                </div>
                            ))
                        ) : (
                            Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                                    <div className="h-2.5 w-16 rounded-full bg-white/10" />
                                    <div className="mt-3 h-3 w-5/6 rounded-full bg-white/5" />
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function CentralCanvas({
    status,
    currentStep,
    progressPercent,
    request,
    warnings,
    sources,
    sourceSummary,
    outline,
    slidesGenerated,
    presentation,
    onGenerate,
    downloadUrl,
    onReset,
}: CentralCanvasProps) {
    const showWorkspace = status === 'processing' || status === 'completed' || status === 'error';
    const sourceList = buildSourceList(request, sources);
    const hasPreview = Boolean(presentation && presentation.slides.length > 0);
    const liveSlideCount = presentation ? presentation.slides.length + 2 : slidesGenerated || Math.max(outline.length, 0);
    const previewExportLabel = request?.topic || presentation?.deck_title || 'Executive Deck';

    return (
        <div className="flex-1 flex flex-col overflow-y-auto w-full">
            <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-8 lg:py-10">
                <AnimatePresence mode="wait">
                    {!showWorkspace ? (
                        <motion.div
                            key="wizard"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.985, y: -10 }}
                            className="space-y-8"
                        >
                            <section className="rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(8,15,30,0.82))] p-6 md:p-8 xl:p-10 shadow-[0_28px_90px_rgba(2,6,23,0.34)]">
                                <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr] xl:items-end">
                                    <div className="max-w-3xl">
                                        <p className="text-[11px] uppercase tracking-[0.28em] text-sky-200/75">Executive Deck Studio</p>
                                        <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight text-white leading-tight">
                                            Turn complex technical context into a boardroom-quality story.
                                        </h1>
                                        <p className="mt-5 text-base text-slate-400 leading-relaxed max-w-2xl">
                                            This workspace is designed to keep the entire journey seamless: brief the AI, attach the right source packet, follow the strategy pipeline, review the generated deck, and export without leaving the page.
                                        </p>
                                    </div>

                                    <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-1">
                                        {JOURNEY_POINTS.map((point) => (
                                            <div key={point.title} className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                                                <p className="text-sm font-medium text-white">{point.title}</p>
                                                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{point.detail}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            <section className="rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(9,13,24,0.82))] p-4 md:p-6 xl:p-8 shadow-[0_24px_80px_rgba(2,6,23,0.32)]">
                                <FormWizard onGenerate={onGenerate} isUploading={status === 'uploading'} />
                            </section>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="workspace"
                            initial={{ opacity: 0, scale: 0.99, y: 8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="space-y-6 pb-12"
                        >
                            <section className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(8,15,30,0.84))] p-6 lg:p-7 shadow-[0_28px_90px_rgba(2,6,23,0.34)]">
                                <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                                    <div className="max-w-3xl">
                                        <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1.5 text-xs text-sky-100">
                                            <Sparkles className="w-3.5 h-3.5" />
                                            <span>{hasPreview ? 'Live deck preview active' : 'Deck generation in progress'}</span>
                                        </div>
                                        <h1 className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight text-white leading-tight">
                                            {presentation?.deck_title || request?.topic || 'Executive Narrative Deck'}
                                        </h1>
                                        <p className="mt-4 text-sm md:text-base text-slate-400 leading-relaxed">
                                            {status === 'completed'
                                                ? 'The deck is ready to review and export. The preview below mirrors the structured narrative that was generated for this run.'
                                                : hasPreview
                                                    ? 'The narrative has resolved into slide structure, so you can start reviewing the deck while the final presentation file finishes rendering.'
                                                    : 'We are still assembling the narrative and slide structure. The workspace will swap into live preview mode as soon as it is ready.'}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 xl:min-w-[540px]">
                                        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                                            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Sources</p>
                                            <p className="mt-2 text-lg font-semibold text-white">{sourceSummary.files_received || sourceList.length}</p>
                                            <p className="mt-1 text-xs text-slate-500">Files in packet</p>
                                        </div>
                                        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                                            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Narrative</p>
                                            <p className="mt-2 text-lg font-semibold text-white">{outline.length || presentation?.slides.length || 0}</p>
                                            <p className="mt-1 text-xs text-slate-500">Structured body slides</p>
                                        </div>
                                        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                                            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Deck</p>
                                            <p className="mt-2 text-lg font-semibold text-white">{liveSlideCount}</p>
                                            <p className="mt-1 text-xs text-slate-500">Slides including cover</p>
                                        </div>
                                        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                                            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Current Step</p>
                                            <p className="mt-2 text-sm font-semibold text-white">{currentStep || 'Preparing Inputs'}</p>
                                            <p className="mt-1 text-xs text-slate-500">{Math.max(progressPercent, 0)}% complete</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <div className="tour-step-3">
                                <ExecutionStepper currentStep={currentStep} progressPercent={progressPercent} />
                            </div>

                            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] items-start">
                                <div className="space-y-6 min-w-0">
                                    {hasPreview && presentation ? (
                                        <section className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(6,10,18,0.88))] p-4 md:p-5 xl:p-6 shadow-[0_28px_90px_rgba(2,6,23,0.34)]">
                                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-5">
                                                <div>
                                                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300">
                                                        <Layers3 className="w-3.5 h-3.5 text-sky-300" />
                                                        <span>Presentation preview</span>
                                                    </div>
                                                    <h2 className="mt-3 text-2xl font-semibold text-white tracking-tight">Review the generated deck before export.</h2>
                                                    <p className="mt-2 text-sm text-slate-400">
                                                        {status === 'completed'
                                                            ? 'The live preview is now in sync with the final export.'
                                                            : 'The preview is ready first so you can assess the narrative while the final file render completes.'}
                                                    </p>
                                                </div>

                                                <div className="flex flex-wrap gap-3 tour-step-4">
                                                    <a
                                                        href={status === 'completed' ? downloadUrl : undefined}
                                                        download={status === 'completed'}
                                                        className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 font-medium transition-all ${
                                                            status === 'completed'
                                                                ? 'bg-white text-slate-950 hover:bg-slate-200 shadow-[0_14px_30px_rgba(255,255,255,0.1)]'
                                                                : 'pointer-events-none bg-white/5 text-slate-500 border border-white/10'
                                                        }`}
                                                    >
                                                        <Download className="w-4 h-4" />
                                                        <span>Download PPTX</span>
                                                    </a>

                                                    <button
                                                        type="button"
                                                        onClick={() => exportDeckAsPdf('deck-preview-container', previewExportLabel)}
                                                        className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 bg-sky-400/10 hover:bg-sky-400/15 text-sky-100 border border-sky-400/20 font-medium transition-colors"
                                                    >
                                                        <FileDown className="w-4 h-4" />
                                                        <span>Export PDF</span>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="rounded-[30px] border border-white/10 bg-slate-950/55 p-3 md:p-4">
                                                <DeckPreview presentation={presentation} />
                                            </div>
                                        </section>
                                    ) : (
                                        <PreviewPlaceholder outline={outline} currentStep={currentStep} request={request} />
                                    )}
                                </div>

                                <aside className="space-y-5 xl:sticky xl:top-6">
                                    <section className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(8,15,30,0.82))] p-5 shadow-[0_24px_80px_rgba(2,6,23,0.28)]">
                                        <p className="text-[11px] uppercase tracking-[0.24em] text-sky-200/75">Review Summary</p>
                                        <h3 className="mt-3 text-xl font-semibold text-white">Deck controls</h3>
                                        <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                                            Keep review, exports, and iteration in one workspace instead of bouncing between a download folder and the app.
                                        </p>

                                        <div className="mt-5 space-y-3">
                                            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                                                <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Theme</p>
                                                <p className="mt-2 text-sm font-medium text-white">{presentation?.theme_vibe || request?.tone || 'Professional & Executive'}</p>
                                            </div>
                                            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                                                <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Audience Lens</p>
                                                <p className="mt-2 text-sm font-medium text-white">{request?.audience || 'General audience'}</p>
                                            </div>
                                            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                                                <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Priority Focus</p>
                                                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                                                    {request?.sections || 'No extra guidance was provided, so the deck is driven from the uploaded source packet.'}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={onReset}
                                            className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-medium transition-colors"
                                        >
                                            {status === 'completed' ? <RefreshCcw className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                                            <span>{status === 'completed' ? 'Create another deck' : 'Reset this run'}</span>
                                        </button>
                                    </section>

                                    <section className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.86),rgba(8,15,30,0.8))] p-5 shadow-[0_22px_70px_rgba(2,6,23,0.26)]">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2">
                                                <FileStack className="w-4 h-4 text-sky-300" />
                                                <p className="text-sm font-medium text-white">Source packet</p>
                                            </div>
                                            <span className="text-[11px] text-slate-500">{sourceSummary.files_received || sourceList.length} items</span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                                            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-2.5">
                                                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Text</p>
                                                <p className="mt-1 text-sm font-medium text-white">{sourceSummary.text_sources}</p>
                                            </div>
                                            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-2.5">
                                                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Images</p>
                                                <p className="mt-1 text-sm font-medium text-white">{sourceSummary.image_sources}</p>
                                            </div>
                                            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-2.5">
                                                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Archive</p>
                                                <p className="mt-1 text-sm font-medium text-white">{sourceSummary.archive_entries}</p>
                                            </div>
                                        </div>

                                        <div className="mt-4 space-y-2 max-h-72 overflow-y-auto pr-1">
                                            {sourceList.map((source, index) => (
                                                <div key={`${source.name}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                                                    <p className="text-xs font-medium text-slate-100 truncate">{source.name}</p>
                                                    <p className="mt-1 text-[11px] text-slate-500">
                                                        {source.kind}
                                                        {source.skipped ? ' • Skipped' : ''}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    <section className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.86),rgba(8,15,30,0.8))] p-5 shadow-[0_22px_70px_rgba(2,6,23,0.26)]">
                                        <p className="text-sm font-medium text-white">Narrative outline</p>
                                        <div className="mt-4 space-y-2">
                                            {(outline.length > 0 ? outline : presentation?.slides.map((slide) => slide.title) || []).map((title, index) => (
                                                <div key={`${title}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                                                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Slide {index + 1}</p>
                                                    <p className="mt-1 text-xs text-slate-200 leading-relaxed">{title}</p>
                                                </div>
                                            ))}

                                            {outline.length === 0 && !presentation && (
                                                <p className="text-xs text-slate-500 leading-relaxed">
                                                    The outline will appear here as soon as the narrative stage finishes.
                                                </p>
                                            )}
                                        </div>
                                    </section>

                                    {warnings.length > 0 && (
                                        <section className="rounded-[30px] border border-amber-500/20 bg-amber-500/[0.08] p-5 shadow-[0_22px_70px_rgba(120,53,15,0.18)]">
                                            <div className="flex items-center gap-2">
                                                <TriangleAlert className="w-4 h-4 text-amber-300" />
                                                <p className="text-sm font-medium text-white">Processing notes</p>
                                            </div>
                                            <div className="mt-4 space-y-3">
                                                {warnings.map((warning, index) => (
                                                    <p key={`${warning}-${index}`} className="text-sm text-amber-100/90 leading-relaxed">
                                                        {warning}
                                                    </p>
                                                ))}
                                            </div>
                                        </section>
                                    )}
                                </aside>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
