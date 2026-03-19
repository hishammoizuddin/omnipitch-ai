import type {
    DeckCard,
    DeckClosingPayload,
    DeckCoverPayload,
    DeckMetric,
    PresentationDeck,
    PresentationSlide,
    SlideRenderPayload,
} from '../types/generation';

function toneForIndex(index: number): 'primary' | 'secondary' {
    return index % 2 === 0 ? 'primary' : 'secondary';
}

function buildCard(title: string, body: string, index: number): DeckCard {
    return {
        title: title || `Focus ${index + 1}`,
        body,
        tone: toneForIndex(index),
    };
}

function buildMetric(metric: DeckMetric, index: number): DeckMetric {
    return {
        ...metric,
        tone: metric.tone || toneForIndex(index),
    };
}

export function resolveSlideRenderPayload(slide: PresentationSlide): SlideRenderPayload {
    if (slide.render_payload) {
        return slide.render_payload;
    }

    const featureCards = (slide.cards?.length
        ? slide.cards
        : (slide.bullets || []).slice(0, 4).map((bullet, index) => buildCard(`Insight ${index + 1}`, bullet, index))
    ).slice(0, 4).map((card, index) => ({
        ...card,
        tone: card.tone || toneForIndex(index),
    }));

    const metricCards = (slide.metrics?.length
        ? slide.metrics
        : (slide.bullets || []).slice(0, 3).map((bullet, index) => ({
            label: `Signal ${index + 1}`,
            value: bullet.slice(0, 28),
            detail: slide.subheadline || '',
            tone: toneForIndex(index),
        }))
    ).slice(0, 3).map((metric, index) => buildMetric(metric, index));

    const bulletPoints = (slide.bullets || []).slice(0, 4);
    const summaryBody = bulletPoints.slice(0, 3).join(' • ') || slide.subheadline;
    const comparisonCards = featureCards.slice(0, 2).length === 2
        ? featureCards.slice(0, 2)
        : [
            buildCard('Current State', bulletPoints[0] || slide.subheadline || slide.headline, 0),
            buildCard('Future State', bulletPoints[bulletPoints.length - 1] || slide.quote || slide.headline, 1),
        ];

    return {
        lead_quote: slide.quote || slide.headline,
        bullet_points: bulletPoints,
        feature_cards: featureCards,
        metric_cards: metricCards,
        step_cards: (slide.flow_steps || []).slice(0, 4).map((step, index) => buildCard(String(index + 1), step, index)),
        comparison_cards: comparisonCards,
        supporting_card: slide.layout_style === 'process-flow'
            ? buildCard(slide.accent || 'Execution Signal', summaryBody, 1)
            : slide.layout_style === 'metrics-band'
                ? buildCard(slide.quote || 'Why this matters now', summaryBody, 1)
                : null,
        supporting_cards: slide.layout_style === 'roadmap'
            ? bulletPoints.slice(0, 3).map((bullet, index) => buildCard('Checkpoint', bullet, index))
            : slide.layout_style === 'comparison'
                ? bulletPoints.slice(0, 3).map((bullet, index) => buildCard(`Move ${index + 1}`, bullet, index))
                : bulletPoints.slice(0, 3).map((bullet, index) => buildCard(`Priority ${index + 1}`, bullet, index)),
    };
}

export function resolveCoverPayload(presentation: PresentationDeck): DeckCoverPayload {
    if (presentation.cover_payload) {
        return presentation.cover_payload;
    }

    const sourceSlide = presentation.slides[0];
    const sourcePayload = sourceSlide ? resolveSlideRenderPayload(sourceSlide) : null;
    const highlightCards = sourcePayload?.feature_cards?.slice(0, 2) || [];

    return {
        eyebrow: 'Executive Narrative Deck',
        highlight_cards: highlightCards.length > 0
            ? highlightCards
            : [
                buildCard('Story Focus', presentation.deck_subtitle || presentation.deck_title, 0),
                buildCard('Deck Style', presentation.theme_vibe || 'Professional & Executive', 1),
            ],
    };
}

export function resolveClosingPayload(presentation: PresentationDeck): DeckClosingPayload {
    if (presentation.closing_payload) {
        return presentation.closing_payload;
    }

    return {
        eyebrow: 'Next Move',
        headline: 'Turn the strategy into execution.',
        subheadline: presentation.deck_subtitle,
        pill_text: presentation.deck_title,
    };
}
