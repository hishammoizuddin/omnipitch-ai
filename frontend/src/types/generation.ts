export interface GenerationSource {
    name: string;
    kind: string;
    size_bytes?: number;
    skipped?: boolean;
}

export interface DeckMetric {
    label: string;
    value: string;
    detail: string;
    tone?: 'primary' | 'secondary';
}

export interface DeckCard {
    title: string;
    body: string;
    tone?: 'primary' | 'secondary';
}

export interface SlideRenderPayload {
    lead_quote: string;
    bullet_points: string[];
    feature_cards: DeckCard[];
    metric_cards: DeckMetric[];
    step_cards: DeckCard[];
    comparison_cards: DeckCard[];
    supporting_card: DeckCard | null;
    supporting_cards: DeckCard[];
}

export interface DeckCoverPayload {
    eyebrow: string;
    highlight_cards: DeckCard[];
}

export interface DeckClosingPayload {
    eyebrow: string;
    headline: string;
    subheadline: string;
    pill_text: string;
}

export interface PresentationSlide {
    title: string;
    section_label: string;
    layout_style: string;
    headline: string;
    subheadline: string;
    bullets: string[];
    metrics: DeckMetric[];
    cards: DeckCard[];
    flow_steps: string[];
    quote: string;
    accent: string;
    render_payload?: SlideRenderPayload;
}

export interface PresentationDeck {
    deck_title: string;
    deck_subtitle: string;
    theme_vibe: string;
    cover_payload?: DeckCoverPayload;
    closing_payload?: DeckClosingPayload;
    slides: PresentationSlide[];
}

export interface GenerationSourceSummary {
    files_received: number;
    text_sources: number;
    image_sources: number;
    archive_entries: number;
}

export interface GenerationStatusPayload {
    job_id: string;
    status: string;
    current_step: string;
    progress_percent: number;
    error_msg: string | null;
    warnings: string[];
    sources: GenerationSource[];
    outline: string[];
    slides_generated: number;
    source_summary: GenerationSourceSummary;
    presentation_json: PresentationDeck | null;
}
