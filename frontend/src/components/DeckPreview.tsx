import type { CSSProperties, ReactNode } from 'react';

import { resolveClosingPayload, resolveCoverPayload, resolveSlideRenderPayload } from '../lib/deckRender';
import { resolveDeckTheme } from '../lib/deckTheme';
import type { DeckCard, DeckMetric, PresentationDeck, PresentationSlide } from '../types/generation';

interface DeckPreviewProps {
    presentation: PresentationDeck;
    containerId?: string;
}

const PPT_WIDTH = 13.333;
const PPT_HEIGHT = 7.5;

type DeckTheme = ReturnType<typeof resolveDeckTheme>;

function accentForTone(theme: DeckTheme, tone?: 'primary' | 'secondary') {
    return tone === 'secondary' ? theme.accentAlt : theme.accent;
}

function frame(left: number, top: number, width: number, height: number): CSSProperties {
    return {
        position: 'absolute',
        left: `${(left / PPT_WIDTH) * 100}%`,
        top: `${(top / PPT_HEIGHT) * 100}%`,
        width: `${(width / PPT_WIDTH) * 100}%`,
        height: `${(height / PPT_HEIGHT) * 100}%`,
    };
}

function slideSurface(theme: DeckTheme): CSSProperties {
    return {
        color: theme.text,
        background: `linear-gradient(145deg, ${theme.background} 0%, ${theme.surfaceAlt} 100%)`,
        borderColor: theme.border,
    };
}

function typeScale(min: number, max: number) {
    return `clamp(${min}rem, ${(min + max) / 2}vw, ${max}rem)`;
}

function SlideBackdrop({ theme }: { theme: DeckTheme }) {
    return (
        <>
            <div className="absolute rounded-full opacity-35 blur-3xl" style={{ ...frame(0.15, 0.12, 2.75, 2.75), backgroundColor: theme.accent }} />
            <div className="absolute rounded-full opacity-25 blur-3xl" style={{ ...frame(10.68, 5.15, 2.25, 2.25), backgroundColor: theme.accentAlt }} />
        </>
    );
}

function CanvasCard({
    card,
    theme,
    box,
    compact = false,
}: {
    card: DeckCard;
    theme: DeckTheme;
    box: [number, number, number, number];
    compact?: boolean;
}) {
    return (
        <div
            className="absolute rounded-[22px] border"
            style={{
                ...frame(...box),
                backgroundColor: theme.surface,
                borderColor: accentForTone(theme, card.tone),
                boxShadow: '0 24px 48px rgba(15, 23, 42, 0.12)',
            }}
        >
            <div className={compact ? 'px-4 py-3' : 'px-5 py-4'}>
                <p
                    className="font-semibold uppercase tracking-[0.22em]"
                    style={{
                        color: accentForTone(theme, card.tone),
                        fontSize: compact ? typeScale(0.46, 0.62) : typeScale(0.5, 0.72),
                    }}
                >
                    {card.title}
                </p>
                <p
                    className="leading-relaxed"
                    style={{
                        marginTop: compact ? '0.45rem' : '0.7rem',
                        fontSize: compact ? typeScale(0.62, 0.84) : typeScale(0.72, 0.96),
                    }}
                >
                    {card.body}
                </p>
            </div>
        </div>
    );
}

function CanvasMetricCard({
    metric,
    theme,
    box,
    compact = false,
}: {
    metric: DeckMetric;
    theme: DeckTheme;
    box: [number, number, number, number];
    compact?: boolean;
}) {
    return (
        <div
            className="absolute rounded-[22px] border"
            style={{
                ...frame(...box),
                backgroundColor: theme.surface,
                borderColor: accentForTone(theme, metric.tone),
                boxShadow: '0 24px 48px rgba(15, 23, 42, 0.12)',
            }}
        >
            <div className={compact ? 'px-4 py-3' : 'px-5 py-4'}>
                <p className="uppercase tracking-[0.22em]" style={{ color: theme.muted, fontSize: compact ? typeScale(0.46, 0.58) : typeScale(0.5, 0.68) }}>
                    {metric.label}
                </p>
                <p
                    className="font-semibold tracking-tight"
                    style={{
                        marginTop: compact ? '0.35rem' : '0.7rem',
                        color: accentForTone(theme, metric.tone),
                        fontSize: compact ? typeScale(1, 1.5) : typeScale(1.25, 2.05),
                        lineHeight: 1.02,
                    }}
                >
                    {metric.value}
                </p>
                <p
                    className="leading-relaxed"
                    style={{
                        marginTop: compact ? '0.35rem' : '0.65rem',
                        fontSize: compact ? typeScale(0.56, 0.74) : typeScale(0.68, 0.9),
                    }}
                >
                    {metric.detail}
                </p>
            </div>
        </div>
    );
}

function CanvasStepCard({
    card,
    theme,
    box,
}: {
    card: DeckCard;
    theme: DeckTheme;
    box: [number, number, number, number];
}) {
    const accent = accentForTone(theme, card.tone);
    return (
        <div
            className="absolute rounded-[22px] border"
            style={{
                ...frame(...box),
                backgroundColor: theme.surface,
                borderColor: accent,
                boxShadow: '0 24px 48px rgba(15, 23, 42, 0.12)',
            }}
        >
            <div className="px-4 py-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full text-[0.68rem] font-semibold" style={{ backgroundColor: accent, color: theme.background }}>
                    {card.title}
                </div>
                <p className="leading-relaxed" style={{ marginTop: '0.65rem', fontSize: typeScale(0.64, 0.84) }}>
                    {card.body}
                </p>
            </div>
        </div>
    );
}

function CanvasBullets({
    bullets,
    theme,
    box,
}: {
    bullets: string[];
    theme: DeckTheme;
    box: [number, number, number, number];
}) {
    return (
        <div className="absolute flex flex-col justify-start gap-3" style={frame(...box)}>
            {bullets.map((bullet, index) => (
                <div key={`${bullet}-${index}`} className="flex items-start gap-3">
                    <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: index % 2 === 0 ? theme.accent : theme.accentAlt }} />
                    <span className="leading-relaxed" style={{ fontSize: typeScale(0.64, 0.88) }}>{bullet}</span>
                </div>
            ))}
        </div>
    );
}

function ContentChrome({
    slide,
    theme,
    slideNumber,
}: {
    slide: PresentationSlide;
    theme: DeckTheme;
    slideNumber: number;
}) {
    return (
        <>
            <p className="absolute font-semibold uppercase tracking-[0.28em]" style={{ ...frame(0.7, 0.45, 2.6, 0.28), color: theme.accent, fontSize: typeScale(0.44, 0.58) }}>
                {slide.section_label}
            </p>
            <p className="absolute leading-none" style={{ ...frame(0.7, 0.78, 10, 0.48), color: theme.muted, fontSize: typeScale(0.58, 0.8) }}>
                {slide.title}
            </p>
            <h3 className="absolute font-semibold tracking-tight" style={{ ...frame(0.7, 1.18, 8.6, 0.8), color: theme.text, fontSize: typeScale(1.35, 2.05), lineHeight: 1.05 }}>
                {slide.headline || slide.title}
            </h3>
            {slide.subheadline ? (
                <p className="absolute leading-relaxed" style={{ ...frame(0.7, 1.95, 8.8, 0.56), color: theme.muted, fontSize: typeScale(0.64, 0.88) }}>
                    {slide.subheadline}
                </p>
            ) : null}
            <div className="absolute rounded-full" style={{ ...frame(0.7, 2.42, 1.15, 0.06), backgroundColor: theme.accent }} />
            <p className="absolute text-right" style={{ ...frame(11.9, 7.02, 0.6, 0.18), color: theme.muted, fontSize: typeScale(0.48, 0.62) }}>
                {slideNumber}
            </p>
        </>
    );
}

function HeroLayout({ slide, theme }: { slide: PresentationSlide; theme: DeckTheme }) {
    const payload = resolveSlideRenderPayload(slide);
    return (
        <>
            <div
                className="absolute rounded-[24px] border"
                style={{
                    ...frame(0.7, 2.75, 6.1, 3.15),
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    boxShadow: '0 28px 58px rgba(15, 23, 42, 0.16)',
                }}
            />
            <p className="absolute font-semibold tracking-tight" style={{ ...frame(0.98, 3.02, 5.45, 1.0), fontSize: typeScale(1.2, 1.95), lineHeight: 1.08 }}>
                {payload.lead_quote}
            </p>
            <CanvasBullets bullets={payload.bullet_points.slice(0, 3)} theme={theme} box={[0.98, 4.18, 5.2, 1.28]} />

            <div
                className="absolute rounded-[24px] border"
                style={{
                    ...frame(7.15, 2.6, 2.95, 3.35),
                    backgroundColor: theme.surfaceAlt,
                    borderColor: theme.accentAlt,
                }}
            />
            <p className="absolute font-semibold uppercase tracking-[0.26em]" style={{ ...frame(7.37, 2.84, 2.4, 0.3), color: theme.accentAlt, fontSize: typeScale(0.44, 0.56) }}>
                {slide.accent || 'Strategic Edge'}
            </p>
            {payload.metric_cards.slice(0, 2).map((metric, index) => (
                <CanvasMetricCard
                    key={`${metric.label}-${index}`}
                    metric={metric}
                    theme={theme}
                    compact
                    box={[7.31, 3.18 + (index * 1.18), 2.6, 1.1]}
                />
            ))}
        </>
    );
}

function InsightGridLayout({ slide, theme }: { slide: PresentationSlide; theme: DeckTheme }) {
    const payload = resolveSlideRenderPayload(slide);
    const positions: Array<[number, number, number, number]> = [
        [0.7, 2.7, 3.95, 1.72],
        [5.12, 2.7, 3.95, 1.72],
        [0.7, 4.78, 3.95, 1.72],
        [5.12, 4.78, 3.95, 1.72],
    ];

    return (
        <>
            {payload.feature_cards.slice(0, 4).map((card, index) => (
                <CanvasCard key={`${card.title}-${index}`} card={card} theme={theme} box={positions[index]} />
            ))}
        </>
    );
}

function MetricsBandLayout({ slide, theme }: { slide: PresentationSlide; theme: DeckTheme }) {
    const payload = resolveSlideRenderPayload(slide);
    return (
        <>
            {payload.metric_cards.slice(0, 3).map((metric, index) => (
                <CanvasMetricCard
                    key={`${metric.label}-${index}`}
                    metric={metric}
                    theme={theme}
                    box={[0.7 + (index * 3.22), 2.75, 3.02, 1.82]}
                />
            ))}
            {payload.supporting_card ? <CanvasCard card={payload.supporting_card} theme={theme} box={[0.7, 4.95, 9.7, 1.55]} /> : null}
        </>
    );
}

function ProcessFlowLayout({ slide, theme }: { slide: PresentationSlide; theme: DeckTheme }) {
    const payload = resolveSlideRenderPayload(slide);
    return (
        <>
            <div className="absolute" style={{ ...frame(1.6, 4.02, 7.3, 0.03), backgroundColor: theme.accent, opacity: 0.4 }} />
            {payload.step_cards.slice(0, 4).map((card, index) => (
                <CanvasStepCard key={`${card.title}-${index}`} card={card} theme={theme} box={[0.85 + (index * 2.4), 3.1, 2.15, 1.25]} />
            ))}
            {payload.supporting_card ? <CanvasCard card={payload.supporting_card} theme={theme} box={[0.7, 5.18, 9.7, 1.28]} compact /> : null}
        </>
    );
}

function ComparisonLayout({ slide, theme }: { slide: PresentationSlide; theme: DeckTheme }) {
    const payload = resolveSlideRenderPayload(slide);
    return (
        <>
            {payload.comparison_cards[0] ? <CanvasCard card={payload.comparison_cards[0]} theme={theme} box={[0.7, 2.75, 4.6, 2.55]} /> : null}
            {payload.comparison_cards[1] ? <CanvasCard card={payload.comparison_cards[1]} theme={theme} box={[5.8, 2.75, 4.6, 2.55]} /> : null}
            <div
                className="absolute flex items-center justify-center rounded-[18px] font-semibold"
                style={{
                    ...frame(4.85, 3.62, 0.8, 0.5),
                    backgroundColor: theme.accentAlt,
                    color: theme.background,
                    fontSize: typeScale(0.7, 1),
                }}
            >
                →
            </div>
            {payload.supporting_cards.slice(0, 3).map((card, index) => (
                <CanvasCard key={`${card.title}-${index}`} card={card} theme={theme} box={[0.7 + (index * 3.32), 5.42, 3.08, 1.06]} compact />
            ))}
        </>
    );
}

function RoadmapLayout({ slide, theme }: { slide: PresentationSlide; theme: DeckTheme }) {
    const payload = resolveSlideRenderPayload(slide);
    const cardPositions = [0.8, 3.85, 6.9];
    return (
        <>
            <div className="absolute" style={{ ...frame(1.4, 4.55, 8.0, 0.03), backgroundColor: theme.accent, opacity: 0.35 }} />
            {payload.step_cards.slice(0, 3).map((card, index) => (
                <div key={`${card.title}-${index}`}>
                    <div
                        className="absolute rounded-full"
                        style={{
                            ...frame(cardPositions[index] + 1.1, 4.32, 0.45, 0.45),
                            backgroundColor: accentForTone(theme, card.tone),
                        }}
                    />
                    <CanvasCard card={card} theme={theme} box={[cardPositions[index], 2.95, 2.45, 1.3]} compact />
                </div>
            ))}
            {payload.supporting_cards.slice(0, 3).map((card, index) => (
                <CanvasCard key={`${card.title}-${index}`} card={card} theme={theme} box={[0.7 + (index * 3.32), 5.3, 3.08, 1.06]} compact />
            ))}
        </>
    );
}

function ClosingContentLayout({ slide, theme }: { slide: PresentationSlide; theme: DeckTheme }) {
    const payload = resolveSlideRenderPayload(slide);
    return (
        <>
            <p className="absolute font-semibold tracking-tight" style={{ ...frame(0.92, 2.8, 8.8, 0.92), fontSize: typeScale(1.25, 1.95), lineHeight: 1.06 }}>
                {payload.lead_quote}
            </p>
            {payload.supporting_cards.slice(0, 3).map((card, index) => (
                <CanvasCard key={`${card.title}-${index}`} card={card} theme={theme} box={[0.9 + (index * 3.15), 4.72, 2.85, 1.2]} compact />
            ))}
        </>
    );
}

function SlideContent({ slide, theme }: { slide: PresentationSlide; theme: DeckTheme }) {
    switch (slide.layout_style) {
        case 'hero':
            return <HeroLayout slide={slide} theme={theme} />;
        case 'metrics-band':
            return <MetricsBandLayout slide={slide} theme={theme} />;
        case 'process-flow':
            return <ProcessFlowLayout slide={slide} theme={theme} />;
        case 'comparison':
            return <ComparisonLayout slide={slide} theme={theme} />;
        case 'roadmap':
            return <RoadmapLayout slide={slide} theme={theme} />;
        case 'closing':
            return <ClosingContentLayout slide={slide} theme={theme} />;
        default:
            return <InsightGridLayout slide={slide} theme={theme} />;
    }
}

function SlideCanvas({
    theme,
    children,
}: {
    theme: DeckTheme;
    children: ReactNode;
}) {
    return (
        <article className="preview-slide relative aspect-[16/9] overflow-hidden rounded-[32px] border shadow-[0_30px_80px_rgba(15,23,42,0.18)]" style={slideSurface(theme)}>
            <SlideBackdrop theme={theme} />
            <div className="absolute inset-0">{children}</div>
        </article>
    );
}

function CoverSlide({ presentation, theme }: { presentation: PresentationDeck; theme: DeckTheme }) {
    const coverPayload = resolveCoverPayload(presentation);
    return (
        <SlideCanvas theme={theme}>
            <div
                className="absolute rounded-[28px] border"
                style={{
                    ...frame(0.7, 0.85, 5.3, 5.7),
                    backgroundColor: theme.surface,
                    borderColor: theme.accent,
                }}
            />
            <p className="absolute font-semibold uppercase tracking-[0.28em]" style={{ ...frame(1.05, 1.2, 4.3, 0.3), color: theme.accent, fontSize: typeScale(0.46, 0.6) }}>
                {coverPayload.eyebrow}
            </p>
            <h2 className="absolute font-semibold tracking-tight" style={{ ...frame(1.05, 1.7, 4.45, 1.4), fontSize: typeScale(1.5, 2.35), lineHeight: 1.08 }}>
                {presentation.deck_title}
            </h2>
            <p className="absolute leading-relaxed" style={{ ...frame(1.05, 3.25, 4.3, 0.8), color: theme.muted, fontSize: typeScale(0.72, 0.96) }}>
                {presentation.deck_subtitle}
            </p>

            {coverPayload.highlight_cards[0] ? (
                <CanvasCard card={coverPayload.highlight_cards[0]} theme={theme} box={[6.4, 1.25, 3.6, 2.0]} />
            ) : null}
            {coverPayload.highlight_cards[1] ? (
                <CanvasCard card={coverPayload.highlight_cards[1]} theme={theme} box={[6.4, 3.55, 3.6, 2.0]} />
            ) : null}
        </SlideCanvas>
    );
}

function ContentSlide({
    slide,
    theme,
    slideNumber,
}: {
    slide: PresentationSlide;
    theme: DeckTheme;
    slideNumber: number;
}) {
    return (
        <SlideCanvas theme={theme}>
            <ContentChrome slide={slide} theme={theme} slideNumber={slideNumber} />
            <SlideContent slide={slide} theme={theme} />
        </SlideCanvas>
    );
}

function ClosingSlide({ presentation, theme }: { presentation: PresentationDeck; theme: DeckTheme }) {
    const closingPayload = resolveClosingPayload(presentation);
    return (
        <SlideCanvas theme={theme}>
            <p className="absolute font-semibold uppercase tracking-[0.28em] text-center" style={{ ...frame(1.0, 2.1, 8.8, 0.4), color: theme.accent, fontSize: typeScale(0.48, 0.64) }}>
                {closingPayload.eyebrow}
            </p>
            <h2 className="absolute text-center font-semibold tracking-tight" style={{ ...frame(1.0, 2.7, 8.8, 1.0), fontSize: typeScale(1.5, 2.35), lineHeight: 1.05 }}>
                {closingPayload.headline}
            </h2>
            <p className="absolute text-center leading-relaxed" style={{ ...frame(1.6, 3.95, 7.6, 0.6), color: theme.muted, fontSize: typeScale(0.72, 0.96) }}>
                {closingPayload.subheadline}
            </p>
            <div
                className="absolute flex items-center justify-center rounded-full px-5 text-center"
                style={{
                    ...frame(3.35, 5.0, 3.3, 0.68),
                    backgroundColor: theme.accent,
                    color: theme.background,
                    fontSize: typeScale(0.62, 0.84),
                    fontWeight: 600,
                }}
            >
                {closingPayload.pill_text}
            </div>
        </SlideCanvas>
    );
}

export function DeckPreview({ presentation, containerId = 'deck-preview-container' }: DeckPreviewProps) {
    const theme = resolveDeckTheme(presentation.theme_vibe);

    return (
        <div id={containerId} className="mx-auto max-w-[1100px] space-y-8">
            <CoverSlide presentation={presentation} theme={theme} />
            {presentation.slides.map((slide, index) => (
                <ContentSlide key={`${slide.title}-${index}`} slide={slide} theme={theme} slideNumber={index + 2} />
            ))}
            <ClosingSlide presentation={presentation} theme={theme} />
        </div>
    );
}
