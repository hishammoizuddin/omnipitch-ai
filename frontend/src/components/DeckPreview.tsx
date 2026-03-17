import type { CSSProperties, ReactNode } from 'react';

import type { DeckCard, DeckMetric, PresentationDeck, PresentationSlide } from '../types/generation';
import { resolveDeckTheme } from '../lib/deckTheme';

interface DeckPreviewProps {
    presentation: PresentationDeck;
    containerId?: string;
}

function normalizeCards(slide: PresentationSlide): DeckCard[] {
    if (slide.cards?.length) return slide.cards.slice(0, 4);
    return (slide.bullets || []).slice(0, 4).map((bullet, index) => ({
        title: `Insight ${index + 1}`,
        body: bullet,
    }));
}

function normalizeMetrics(slide: PresentationSlide): DeckMetric[] {
    if (slide.metrics?.length) return slide.metrics.slice(0, 3);
    return (slide.bullets || []).slice(0, 3).map((bullet, index) => ({
        label: `Signal ${index + 1}`,
        value: bullet.slice(0, 28),
        detail: slide.subheadline || '',
    }));
}

function normalizeSteps(slide: PresentationSlide): string[] {
    if (slide.flow_steps?.length) return slide.flow_steps.slice(0, 5);
    return (slide.bullets || []).slice(0, 4);
}

function SlideShell({
    children,
    section,
    title,
    headline,
    subheadline,
    theme,
    slideNumber,
}: {
    children: ReactNode;
    section: string;
    title: string;
    headline: string;
    subheadline: string;
    theme: ReturnType<typeof resolveDeckTheme>;
    slideNumber: number;
}) {
    const slideStyle: CSSProperties = {
        color: theme.text,
        background: `linear-gradient(140deg, ${theme.background} 0%, ${theme.surfaceAlt} 100%)`,
        borderColor: theme.border,
    };

    const glassStyle: CSSProperties = {
        backgroundColor: theme.surface,
        borderColor: theme.border,
    };

    return (
        <article className="preview-slide relative aspect-[16/9] rounded-[28px] border overflow-hidden shadow-[0_30px_80px_rgba(15,23,42,0.18)]" style={slideStyle}>
            <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full blur-3xl opacity-35" style={{ backgroundColor: theme.accent }} />
            <div className="absolute -bottom-20 -right-16 w-56 h-56 rounded-full blur-3xl opacity-25" style={{ backgroundColor: theme.accentAlt }} />

            <div className="relative z-10 h-full flex flex-col p-8 md:p-10">
                <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em]" style={{ color: theme.accent }}>{section}</p>
                        <p className="text-sm mt-2" style={{ color: theme.muted }}>{title}</p>
                    </div>
                    <div className="px-3 py-1 rounded-full border text-xs font-medium" style={glassStyle}>
                        {slideNumber}
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-[2rem] md:text-[2.25rem] font-semibold leading-tight tracking-tight">{headline}</h3>
                    {subheadline ? (
                        <p className="mt-3 text-sm md:text-base leading-relaxed max-w-3xl" style={{ color: theme.muted }}>
                            {subheadline}
                        </p>
                    ) : null}
                </div>

                <div className="flex-1 min-h-0">
                    {children}
                </div>
            </div>
        </article>
    );
}

function SurfaceCard({
    title,
    body,
    theme,
}: {
    title: string;
    body: string;
    theme: ReturnType<typeof resolveDeckTheme>;
}) {
    return (
        <div
            className="rounded-[24px] border p-5 h-full"
            style={{
                backgroundColor: theme.surface,
                borderColor: theme.border,
                color: theme.text,
            }}
        >
            <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: theme.accent }}>{title}</p>
            <p className="mt-3 text-sm md:text-base leading-relaxed">{body}</p>
        </div>
    );
}

function MetricCard({
    metric,
    theme,
}: {
    metric: DeckMetric;
    theme: ReturnType<typeof resolveDeckTheme>;
}) {
    return (
        <div
            className="rounded-[24px] border p-5"
            style={{
                backgroundColor: theme.surface,
                borderColor: theme.border,
                color: theme.text,
            }}
        >
            <p className="text-[11px] uppercase tracking-[0.24em]" style={{ color: theme.muted }}>{metric.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight" style={{ color: theme.accent }}>{metric.value}</p>
            <p className="mt-3 text-sm leading-relaxed">{metric.detail}</p>
        </div>
    );
}

function renderSlideBody(slide: PresentationSlide, theme: ReturnType<typeof resolveDeckTheme>) {
    const cards = normalizeCards(slide);
    const metrics = normalizeMetrics(slide);
    const steps = normalizeSteps(slide);

    switch (slide.layout_style) {
        case 'hero':
            return (
                <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-6 h-full">
                    <div className="flex flex-col justify-between">
                        {slide.quote ? (
                            <p className="text-2xl md:text-3xl font-semibold leading-snug tracking-tight">{slide.quote}</p>
                        ) : null}
                        <div className="space-y-3">
                            {(slide.bullets || []).slice(0, 4).map((bullet, index) => (
                                <div key={`${bullet}-${index}`} className="flex gap-3 text-sm md:text-base leading-relaxed">
                                    <span className="mt-1 w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: index % 2 === 0 ? theme.accent : theme.accentAlt }} />
                                    <span>{bullet}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="grid gap-4 auto-rows-fr">
                        {(metrics.length ? metrics : cards.map((card) => ({ label: card.title, value: card.title, detail: card.body }))).slice(0, 2).map((metric, index) => (
                            <MetricCard key={`${metric.label}-${index}`} metric={metric} theme={theme} />
                        ))}
                    </div>
                </div>
            );

        case 'metrics-band':
            return (
                <div className="flex flex-col gap-5 h-full">
                    <div className="grid md:grid-cols-3 gap-4">
                        {metrics.slice(0, 3).map((metric, index) => (
                            <MetricCard key={`${metric.label}-${index}`} metric={metric} theme={theme} />
                        ))}
                    </div>
                    <SurfaceCard
                        title={slide.accent || 'Why It Matters'}
                        body={slide.quote || (slide.bullets || []).slice(0, 3).join(' • ')}
                        theme={theme}
                    />
                </div>
            );

        case 'process-flow':
            return (
                <div className="flex flex-col gap-6 h-full">
                    <div className="grid md:grid-cols-4 gap-4">
                        {steps.slice(0, 4).map((step, index) => (
                            <div key={`${step}-${index}`} className="relative">
                                <div className="absolute top-6 left-8 right-0 h-px hidden md:block" style={{ backgroundColor: theme.border }} />
                                <div
                                    className="relative rounded-[24px] border p-5 h-full"
                                    style={{
                                        backgroundColor: theme.surface,
                                        borderColor: theme.border,
                                    }}
                                >
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold" style={{ backgroundColor: index % 2 === 0 ? theme.accent : theme.accentAlt, color: theme.background }}>
                                        {index + 1}
                                    </div>
                                    <p className="mt-4 text-sm md:text-base leading-relaxed">{step}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <SurfaceCard title={slide.accent || 'Execution Lens'} body={(slide.bullets || []).slice(0, 3).join(' • ')} theme={theme} />
                </div>
            );

        case 'comparison':
            return (
                <div className="flex flex-col gap-5 h-full">
                    <div className="grid md:grid-cols-2 gap-5">
                        {cards.slice(0, 2).map((card, index) => (
                            <SurfaceCard key={`${card.title}-${index}`} title={card.title} body={card.body} theme={theme} />
                        ))}
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                        {(slide.bullets || []).slice(0, 3).map((bullet, index) => (
                            <SurfaceCard key={`${bullet}-${index}`} title={`Move ${index + 1}`} body={bullet} theme={theme} />
                        ))}
                    </div>
                </div>
            );

        case 'roadmap':
            return (
                <div className="flex flex-col gap-6 h-full">
                    <div className="grid md:grid-cols-3 gap-4">
                        {steps.slice(0, 3).map((step, index) => (
                            <SurfaceCard key={`${step}-${index}`} title={`Phase ${index + 1}`} body={step} theme={theme} />
                        ))}
                    </div>
                    {(slide.bullets || []).length > 0 ? (
                        <div className="grid md:grid-cols-3 gap-4">
                            {(slide.bullets || []).slice(0, 3).map((bullet, index) => (
                                <SurfaceCard key={`${bullet}-${index}`} title="Checkpoint" body={bullet} theme={theme} />
                            ))}
                        </div>
                    ) : null}
                </div>
            );

        case 'closing':
            return (
                <div className="grid md:grid-cols-3 gap-4 h-full">
                    {(slide.bullets || []).slice(0, 3).map((bullet, index) => (
                        <SurfaceCard key={`${bullet}-${index}`} title={`Priority ${index + 1}`} body={bullet} theme={theme} />
                    ))}
                </div>
            );

        default:
            return (
                <div className="grid md:grid-cols-2 gap-5 h-full">
                    {cards.slice(0, 4).map((card, index) => (
                        <SurfaceCard key={`${card.title}-${index}`} title={card.title} body={card.body} theme={theme} />
                    ))}
                </div>
            );
    }
}

export function DeckPreview({ presentation, containerId = 'deck-preview-container' }: DeckPreviewProps) {
    const theme = resolveDeckTheme(presentation.theme_vibe);
    const coverHighlights = normalizeCards(presentation.slides[0] || {
        title: 'Executive Focus',
        section_label: 'Strategy',
        layout_style: 'hero',
        headline: presentation.deck_title,
        subheadline: presentation.deck_subtitle,
        bullets: [],
        metrics: [],
        cards: [],
        flow_steps: [],
        quote: '',
        accent: 'Focus',
    }).slice(0, 2);

    const coverStyle: CSSProperties = {
        color: theme.text,
        background: `linear-gradient(140deg, ${theme.background} 0%, ${theme.surfaceAlt} 100%)`,
        borderColor: theme.border,
    };

    return (
        <div id={containerId} className="space-y-8 max-w-[1100px] mx-auto">
            <article className="preview-slide relative aspect-[16/9] rounded-[32px] border overflow-hidden shadow-[0_30px_80px_rgba(15,23,42,0.18)]" style={coverStyle}>
                <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full blur-3xl opacity-35" style={{ backgroundColor: theme.accent }} />
                <div className="absolute -bottom-20 -right-16 w-56 h-56 rounded-full blur-3xl opacity-25" style={{ backgroundColor: theme.accentAlt }} />

                <div className="relative z-10 h-full grid md:grid-cols-[1.1fr_0.9fr] gap-6 p-8 md:p-10">
                    <div
                        className="rounded-[30px] border p-8 flex flex-col justify-between"
                        style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                    >
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.28em] font-semibold" style={{ color: theme.accent }}>Executive Narrative Deck</p>
                            <h2 className="mt-6 text-[2.25rem] md:text-[3rem] font-semibold tracking-tight leading-tight">{presentation.deck_title}</h2>
                            <p className="mt-5 text-base leading-relaxed max-w-xl" style={{ color: theme.muted }}>{presentation.deck_subtitle}</p>
                        </div>
                        <div className="flex items-center gap-3 text-sm" style={{ color: theme.muted }}>
                            <span>{theme.name}</span>
                            <span>•</span>
                            <span>{presentation.slides.length + 2} slides</span>
                        </div>
                    </div>

                    <div className="grid gap-4 auto-rows-fr">
                        {coverHighlights.map((card, index) => (
                            <SurfaceCard key={`${card.title}-${index}`} title={card.title} body={card.body} theme={theme} />
                        ))}
                    </div>
                </div>
            </article>

            {presentation.slides.map((slide, index) => (
                <SlideShell
                    key={`${slide.title}-${index}`}
                    section={slide.section_label}
                    title={slide.title}
                    headline={slide.headline || slide.title}
                    subheadline={slide.subheadline}
                    theme={theme}
                    slideNumber={index + 2}
                >
                    {renderSlideBody(slide, theme)}
                </SlideShell>
            ))}

            <article className="preview-slide relative aspect-[16/9] rounded-[32px] border overflow-hidden shadow-[0_30px_80px_rgba(15,23,42,0.18)]" style={coverStyle}>
                <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center">
                    <p className="text-[11px] uppercase tracking-[0.28em] font-semibold" style={{ color: theme.accent }}>Next Move</p>
                    <h2 className="mt-6 text-[2.25rem] md:text-[3rem] font-semibold tracking-tight leading-tight max-w-4xl">
                        Turn the narrative into execution.
                    </h2>
                    <p className="mt-5 text-base leading-relaxed max-w-2xl" style={{ color: theme.muted }}>
                        {presentation.deck_subtitle}
                    </p>
                    <div className="mt-8 px-5 py-3 rounded-full text-sm font-medium" style={{ backgroundColor: theme.accent, color: theme.background }}>
                        {presentation.deck_title}
                    </div>
                </div>
            </article>
        </div>
    );
}
