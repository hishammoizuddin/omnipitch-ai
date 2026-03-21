import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Download, FileDown, RefreshCcw, TriangleAlert } from 'lucide-react';

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

const SIMPLE_FLOW = [
    { title: '1. Brief', detail: 'Topic, audience, and tone.' },
    { title: '2. Add context', detail: 'Files are optional.' },
    { title: '3. Review', detail: 'Preview and export in one place.' },
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
        <section className="rounded-[32px] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-5 shadow-[0_24px_70px_rgba(24,38,31,0.05)]">
            <div className="flex flex-col gap-2 border-b border-[color:var(--border)] pb-4">
                <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">Preview</p>
                <h2 className="text-2xl font-semibold tracking-tight text-[color:var(--text)]">
                    {request?.topic || 'Your deck'}
                </h2>
                <p className="text-sm leading-6 text-[color:var(--muted)]">
                    {currentStep ? `${currentStep}. Slides will appear here as soon as they are ready.` : 'Slides will appear here after the deck starts.'}
                </p>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_18rem]">
                <div className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4">
                    <div className="aspect-[16/9] rounded-[24px] border border-dashed border-[color:var(--border)] bg-[color:var(--panel-strong)] p-5">
                        <div className="flex h-full flex-col justify-between">
                            <div className="space-y-3">
                                <div className="h-3 w-28 rounded-full bg-[rgba(24,38,31,0.08)]" />
                                <div className="h-9 w-2/3 rounded-2xl bg-[rgba(24,38,31,0.08)]" />
                                <div className="h-3 w-1/2 rounded-full bg-[rgba(24,38,31,0.05)]" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {Array.from({ length: 4 }).map((_, index) => (
                                    <div key={index} className="rounded-[20px] bg-[color:var(--surface-muted)] p-4">
                                        <div className="h-2.5 w-14 rounded-full bg-[rgba(24,38,31,0.08)]" />
                                        <div className="mt-3 h-3 w-full rounded-full bg-[rgba(24,38,31,0.06)]" />
                                        <div className="mt-2 h-3 w-4/5 rounded-full bg-[rgba(24,38,31,0.06)]" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--panel-strong)] p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--muted)]">Outline</p>
                    <div className="mt-4 space-y-2">
                        {outline.length > 0 ? outline.map((title, index) => (
                            <div key={`${title}-${index}`} className="rounded-2xl bg-[color:var(--surface-muted)] px-4 py-3">
                                <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">Slide {index + 1}</p>
                                <p className="mt-1 text-sm text-[color:var(--text)]">{title}</p>
                            </div>
                        )) : (
                            <div className="rounded-2xl bg-[color:var(--surface-muted)] px-4 py-4 text-sm leading-6 text-[color:var(--muted)]">
                                The outline will appear here first.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
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
    const showWorkspace = status !== 'idle';
    const sourceList = buildSourceList(request, sources);
    const hasPreview = Boolean(presentation && presentation.slides.length > 0);
    const liveSlideCount = presentation ? presentation.slides.length + 2 : slidesGenerated || Math.max(outline.length, 0);
    const previewExportLabel = request?.topic || presentation?.deck_title || 'Executive Deck';
    const outlineTitles = outline.length > 0 ? outline : presentation?.slides.map((slide) => slide.title) || [];

    return (
        <div className="w-full">
            <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
                <AnimatePresence mode="wait">
                    {!showWorkspace ? (
                        <motion.div
                            key="builder"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="space-y-6"
                        >
                            <section className="grid gap-6 xl:grid-cols-[18rem_minmax(0,1fr)]">
                                <aside className="rounded-[32px] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-[0_24px_70px_rgba(24,38,31,0.05)]">
                                    <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">Flow</p>
                                    <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[color:var(--text)]">
                                        A simpler start.
                                    </h1>
                                    <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
                                        The new flow keeps setup on one screen so a first-time user always knows what to do next.
                                    </p>

                                    <div className="mt-6 space-y-3">
                                        {SIMPLE_FLOW.map((item) => (
                                            <div key={item.title} className="rounded-[24px] bg-[color:var(--panel-strong)] px-4 py-4">
                                                <p className="text-sm font-medium text-[color:var(--text)]">{item.title}</p>
                                                <p className="mt-1 text-sm leading-6 text-[color:var(--muted)]">{item.detail}</p>
                                            </div>
                                        ))}
                                    </div>
                                </aside>

                                <FormWizard onGenerate={onGenerate} isUploading={false} />
                            </section>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="workspace"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6 pb-8"
                        >
                            <section className="rounded-[32px] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-6 shadow-[0_24px_70px_rgba(24,38,31,0.05)]">
                                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                                    <div className="max-w-3xl">
                                        <div className="inline-flex rounded-full bg-[color:var(--accent-soft)] px-3 py-1 text-xs uppercase tracking-[0.22em] text-[color:var(--accent)]">
                                            {status === 'completed' ? 'Ready' : status === 'error' ? 'Needs attention' : 'In progress'}
                                        </div>
                                        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[color:var(--text)] md:text-4xl">
                                            {presentation?.deck_title || request?.topic || 'Your deck'}
                                        </h1>
                                        <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
                                            {status === 'completed'
                                                ? 'Review the deck and export it when you are ready.'
                                                : status === 'error'
                                                    ? 'The run stopped before finishing. You can reset and try again.'
                                                    : 'The deck is being built. You can follow progress below and start reviewing as soon as the preview appears.'}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <a
                                            href={status === 'completed' ? downloadUrl : undefined}
                                            download={status === 'completed'}
                                            className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition ${
                                                status === 'completed'
                                                    ? 'bg-[color:var(--accent)] text-white hover:bg-[color:var(--accent-strong)]'
                                                    : 'pointer-events-none bg-[color:var(--surface-muted)] text-[color:var(--muted)]'
                                            }`}
                                        >
                                            <Download className="h-4 w-4" />
                                            Download PPTX
                                        </a>
                                        <button
                                            type="button"
                                            onClick={() => exportDeckAsPdf('deck-preview-container', previewExportLabel)}
                                            disabled={!hasPreview}
                                            className={`inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-medium transition ${
                                                hasPreview
                                                    ? 'border-[color:var(--border)] bg-[color:var(--panel-strong)] text-[color:var(--text)] hover:border-[color:var(--accent)]'
                                                    : 'cursor-not-allowed border-[color:var(--border)] bg-[color:var(--surface-muted)] text-[color:var(--muted)]'
                                            }`}
                                        >
                                            <FileDown className="h-4 w-4" />
                                            Export PDF
                                        </button>
                                        <button
                                            type="button"
                                            onClick={onReset}
                                            className="inline-flex items-center justify-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--panel-strong)] px-5 py-3 text-sm font-medium text-[color:var(--text)] transition hover:border-[color:var(--accent)]"
                                        >
                                            {status === 'completed' ? <RefreshCcw className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                                            {status === 'completed' ? 'New deck' : 'Reset'}
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-5 flex flex-wrap gap-3 text-sm text-[color:var(--muted)]">
                                    <div className="rounded-full bg-[color:var(--surface-muted)] px-4 py-2">
                                        {sourceSummary.files_received || sourceList.length} source{(sourceSummary.files_received || sourceList.length) === 1 ? '' : 's'}
                                    </div>
                                    <div className="rounded-full bg-[color:var(--surface-muted)] px-4 py-2">
                                        {liveSlideCount} slide{liveSlideCount === 1 ? '' : 's'}
                                    </div>
                                    <div className="rounded-full bg-[color:var(--surface-muted)] px-4 py-2">
                                        {Math.max(progressPercent, 0)}% complete
                                    </div>
                                </div>
                            </section>

                            <ExecutionStepper currentStep={currentStep} progressPercent={progressPercent} />

                            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
                                <div className="min-w-0">
                                    {hasPreview && presentation ? (
                                        <section className="rounded-[32px] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4 shadow-[0_24px_70px_rgba(24,38,31,0.05)] md:p-5">
                                            <div className="flex flex-col gap-2 border-b border-[color:var(--border)] pb-4">
                                                <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">Preview</p>
                                                <h2 className="text-2xl font-semibold tracking-tight text-[color:var(--text)]">Live deck</h2>
                                                <p className="text-sm leading-6 text-[color:var(--muted)]">
                                                    {status === 'completed' ? 'The preview matches the final deck.' : 'You can review the draft while the final file finishes.'}
                                                </p>
                                            </div>

                                            <div className="mt-5 rounded-[28px] border border-[color:var(--border)] bg-[color:var(--panel-strong)] p-3 md:p-4">
                                                <DeckPreview presentation={presentation} />
                                            </div>
                                        </section>
                                    ) : (
                                        <PreviewPlaceholder outline={outline} currentStep={currentStep} request={request} />
                                    )}
                                </div>

                                <aside className="space-y-4 xl:sticky xl:top-6">
                                    <section className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-[0_20px_60px_rgba(24,38,31,0.05)]">
                                        <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">Brief</p>
                                        <div className="mt-4 space-y-3 text-sm text-[color:var(--text)]">
                                            <div className="rounded-2xl bg-[color:var(--panel-strong)] px-4 py-3">
                                                <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">Audience</p>
                                                <p className="mt-1">{request?.audience || 'General audience'}</p>
                                            </div>
                                            <div className="rounded-2xl bg-[color:var(--panel-strong)] px-4 py-3">
                                                <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">Tone</p>
                                                <p className="mt-1">{presentation?.theme_vibe || request?.tone || 'Executive'}</p>
                                            </div>
                                            <div className="rounded-2xl bg-[color:var(--panel-strong)] px-4 py-3">
                                                <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">Notes</p>
                                                <p className="mt-1 leading-6 text-[color:var(--muted)]">
                                                    {request?.sections || 'No extra notes provided.'}
                                                </p>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-[0_20px_60px_rgba(24,38,31,0.05)]">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">Sources</p>
                                            <span className="text-sm text-[color:var(--muted)]">{sourceSummary.files_received || sourceList.length}</span>
                                        </div>
                                        <div className="mt-4 max-h-[18rem] space-y-2 overflow-y-auto pr-1">
                                            {sourceList.length > 0 ? sourceList.map((source, index) => (
                                                <div key={`${source.name}-${index}`} className="rounded-2xl bg-[color:var(--panel-strong)] px-4 py-3">
                                                    <p className="truncate text-sm font-medium text-[color:var(--text)]">{source.name}</p>
                                                    <p className="mt-1 text-xs text-[color:var(--muted)]">
                                                        {source.kind}
                                                        {source.skipped ? ' · Skipped' : ''}
                                                    </p>
                                                </div>
                                            )) : (
                                                <div className="rounded-2xl bg-[color:var(--panel-strong)] px-4 py-4 text-sm text-[color:var(--muted)]">
                                                    No source files were attached.
                                                </div>
                                            )}
                                        </div>
                                    </section>

                                    <section className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-[0_20px_60px_rgba(24,38,31,0.05)]">
                                        <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">Outline</p>
                                        <div className="mt-4 space-y-2">
                                            {outlineTitles.length > 0 ? outlineTitles.map((title, index) => (
                                                <div key={`${title}-${index}`} className="rounded-2xl bg-[color:var(--panel-strong)] px-4 py-3">
                                                    <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">Slide {index + 1}</p>
                                                    <p className="mt-1 text-sm text-[color:var(--text)]">{title}</p>
                                                </div>
                                            )) : (
                                                <div className="rounded-2xl bg-[color:var(--panel-strong)] px-4 py-4 text-sm text-[color:var(--muted)]">
                                                    The outline will appear here when the story is ready.
                                                </div>
                                            )}
                                        </div>
                                    </section>

                                    {warnings.length > 0 ? (
                                        <section className="rounded-[28px] border border-amber-200 bg-amber-50 p-5 shadow-[0_20px_60px_rgba(184,105,54,0.08)]">
                                            <div className="flex items-center gap-2">
                                                <TriangleAlert className="h-4 w-4 text-amber-700" />
                                                <p className="text-sm font-medium text-amber-900">Notes</p>
                                            </div>
                                            <div className="mt-3 space-y-2">
                                                {warnings.map((warning, index) => (
                                                    <p key={`${warning}-${index}`} className="text-sm leading-6 text-amber-900/80">
                                                        {warning}
                                                    </p>
                                                ))}
                                            </div>
                                        </section>
                                    ) : null}
                                </aside>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
