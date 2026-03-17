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
}

export interface DeckCard {
    title: string;
    body: string;
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
}

export interface PresentationDeck {
    deck_title: string;
    deck_subtitle: string;
    theme_vibe: string;
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
