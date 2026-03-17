from typing import List, Literal

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field

from .state import AgentState
from utils.pinecone_db import get_vector_store


class ArchitectureSummary(BaseModel):
    summary: str = Field(
        description="Concise summary of the architecture, product capabilities, operating model, and differentiating technical patterns."
    )


class BusinessOutcomes(BaseModel):
    outcomes: List[str] = Field(
        description="List of strategic business outcomes that translate technical work into ROI, speed, resilience, or market advantage."
    )


class Metric(BaseModel):
    label: str = Field(description="Short label for the metric or KPI.")
    value: str = Field(description="Value, result, or directional outcome to emphasize.")
    detail: str = Field(description="Short supporting explanation or proof point.")


class ContentCard(BaseModel):
    title: str = Field(description="Short card title.")
    body: str = Field(description="One concise explanation, proof point, or implication.")


class Slide(BaseModel):
    title: str = Field(description="Slide title.")
    section_label: str = Field(description="Small overline category such as Platform, Growth, Execution, or Value.")
    layout_style: Literal[
        "hero",
        "insight-grid",
        "metrics-band",
        "process-flow",
        "comparison",
        "roadmap",
        "closing",
    ] = Field(description="Slide layout type.")
    headline: str = Field(description="Primary headline on the slide.")
    subheadline: str = Field(description="Short supporting subheadline.")
    bullets: List[str] = Field(default_factory=list, description="Three to four crisp supporting bullets.")
    metrics: List[Metric] = Field(default_factory=list, description="Up to three metrics or proof points.")
    cards: List[ContentCard] = Field(default_factory=list, description="Two to four content cards for grids or comparisons.")
    flow_steps: List[str] = Field(default_factory=list, description="Three to five ordered steps for process slides.")
    quote: str = Field(default="", description="Optional short pull quote or crisp synthesis line.")
    accent: str = Field(default="", description="One or two words that capture the visual accent of the slide, such as Reliability or Growth.")


class Narrative(BaseModel):
    deck_title: str = Field(description="Overall deck title.")
    deck_subtitle: str = Field(description="Executive subtitle for the deck.")
    slides: List[Slide] = Field(description="Six to eight highly structured slides for the deck body.")


LAYOUT_LIBRARY = [
    "hero",
    "insight-grid",
    "process-flow",
    "metrics-band",
    "comparison",
    "roadmap",
    "closing",
]
ACCENT_LIBRARY = ["Velocity", "Clarity", "Execution", "Value", "Momentum", "Transformation", "Next Move"]
SECTION_LIBRARY = ["Strategy", "Platform", "Operations", "Value", "Transformation", "Roadmap", "Leadership"]


def clamp_text(value: str, max_chars: int, fallback: str = "") -> str:
    text = (value or "").strip()
    if not text:
        return fallback
    if len(text) <= max_chars:
        return text
    trimmed = text[: max_chars - 1].rstrip(" ,.;:-")
    return f"{trimmed}…"


def clamp_list(values: List[str], max_items: int, max_chars: int) -> List[str]:
    cleaned = []
    for value in values or []:
        text = clamp_text(value, max_chars)
        if text and text not in cleaned:
            cleaned.append(text)
        if len(cleaned) >= max_items:
            break
    return cleaned


def build_layout_sequence(count: int) -> List[str]:
    if count <= 0:
        return []
    if count <= len(LAYOUT_LIBRARY):
        return LAYOUT_LIBRARY[:count]

    middle = ["insight-grid", "metrics-band", "comparison", "process-flow"]
    sequence = ["hero"]
    while len(sequence) < count - 2:
        sequence.append(middle[(len(sequence) - 1) % len(middle)])
    sequence.extend(["roadmap", "closing"])
    return sequence[:count]


def normalize_cards(raw_cards: List[dict], bullets: List[str], accent: str) -> List[dict]:
    cards = []
    for card in raw_cards or []:
        title = clamp_text(card.get("title", ""), 32)
        body = clamp_text(card.get("body", ""), 150)
        if title and body:
            cards.append({"title": title, "body": body})
        if len(cards) >= 4:
            return cards

    for index, bullet in enumerate(bullets[:4]):
        cards.append({
            "title": f"{accent} {index + 1}",
            "body": clamp_text(bullet, 150),
        })
    return cards[:4]


def normalize_metrics(raw_metrics: List[dict], bullets: List[str], subheadline: str) -> List[dict]:
    metrics = []
    for index, metric in enumerate(raw_metrics or []):
        label = clamp_text(metric.get("label", ""), 24, f"Signal {index + 1}")
        value = clamp_text(metric.get("value", ""), 26, f"Priority {index + 1}")
        detail = clamp_text(metric.get("detail", ""), 90, subheadline)
        metrics.append({"label": label, "value": value, "detail": detail})
        if len(metrics) >= 3:
            return metrics

    for index, bullet in enumerate(bullets[:3]):
        metrics.append({
            "label": f"Signal {index + 1}",
            "value": clamp_text(bullet, 26, f"Priority {index + 1}"),
            "detail": clamp_text(subheadline or bullet, 90, bullet),
        })
    return metrics[:3]


def normalize_steps(raw_steps: List[str], bullets: List[str]) -> List[str]:
    steps = clamp_list(raw_steps, 5, 56)
    if steps:
        return steps
    return clamp_list(bullets, 4, 56)


def CodeParser_Node(state: AgentState) -> dict:
    llm = ChatOpenAI(model="gpt-4o", temperature=0)
    structured_llm = llm.with_structured_output(ArchitectureSummary)

    raw_docs = state.get("raw_docs", "")
    images = state.get("images", [])

    messages = [
        SystemMessage(
            content=(
                "You are an expert software architect. Analyze the provided technical materials and extract the most important "
                "architecture, product capability, workflow, and platform signals. Focus on what an elite technical strategist "
                "would surface for executive storytelling."
            )
        )
    ]

    user_content = []
    if raw_docs.strip():
        user_content.append({"type": "text", "text": f"Extract architecture details from this material:\n\n{raw_docs}"})
    else:
        user_content.append({"type": "text", "text": "Extract architecture details from the provided images or diagrams."})

    for img in images:
        user_content.append({
            "type": "image_url",
            "image_url": {"url": img}
        })

    messages.append(HumanMessage(content=user_content))

    result = structured_llm.invoke(messages)
    return {"parsed_architecture": result.summary}


def BusinessValue_Node(state: AgentState) -> dict:
    llm = ChatOpenAI(model="gpt-4o", temperature=0)
    structured_llm = llm.with_structured_output(BusinessOutcomes)

    org_name = state.get("org_name") or "the enterprise"
    duration = state.get("purpose") or "10 minutes"
    target_audience = state.get("target_audience") or state.get("persona") or "Executive"
    user_sections = state.get("key_message") or "general operational business value"
    theme_vibe = state.get("theme_vibe") or "Professional & Executive"

    prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            f"You are a senior strategy partner advising '{org_name}'. Translate the architecture into business value for '{target_audience}'.\n"
            f"Presentation duration: '{duration}'. Visual and verbal tone: '{theme_vibe}'.\n"
            f"User focus areas: '{user_sections}'.\n\n"
            "Do not summarize the raw input mechanically. Surface business outcomes that sound investable, credible, and specific. "
            "Prioritize speed, resilience, operating leverage, differentiation, adoption, and financial upside."
        ),
        ("user", "Technical Architecture:\n\n{parsed_architecture}")
    ])

    chain = prompt | structured_llm
    result = chain.invoke({"parsed_architecture": state.get("parsed_architecture", "")})
    return {"business_value": result.outcomes}


def Narrative_Node(state: AgentState) -> dict:
    llm = ChatOpenAI(model="gpt-4o", temperature=0)
    structured_llm = llm.with_structured_output(Narrative)

    context = ""
    try:
        vector_store = get_vector_store()
        retriever = vector_store.as_retriever(search_kwargs={"k": 5})
        docs = retriever.invoke("enterprise terminology brand guidelines change management TOGAF ITIL premium executive narrative")
        context = "\n\n".join(doc.page_content for doc in docs)
    except Exception:
        context = ""

    org_name = state.get("org_name") or "the enterprise"
    duration = state.get("purpose") or "10 minutes"
    target_audience = state.get("target_audience") or state.get("persona") or "Executive"
    user_sections = state.get("key_message") or "strategic impact"
    theme_vibe = state.get("theme_vibe") or "Professional & Executive"

    prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            f"You are an elite enterprise narrative strategist building a premium executive deck for '{org_name}'.\n"
            f"Audience: '{target_audience}'. Duration: '{duration}'. Tone: '{theme_vibe}'.\n"
            f"Mandatory focus areas from the user: '{user_sections}'.\n\n"
            "Build a polished body deck with six to eight slides. The slides must feel like a top-tier consulting deliverable, not generic AI bullets.\n"
            "Use a varied but coherent mix of layouts across the deck. Prefer this arc:\n"
            "1. Hero framing\n"
            "2. Architecture or operational insight grid\n"
            "3. Process or execution flow\n"
            "4. Metrics / value proof\n"
            "5. Comparison or transformation view\n"
            "6. Roadmap or next-step slide\n"
            "7. Optional closing emphasis if needed\n\n"
            "For each slide:\n"
            "- `headline` should be sharp and boardroom-ready.\n"
            "- `subheadline` should add strategic context.\n"
            "- `bullets` should be crisp and non-redundant.\n"
            "- `metrics` should be concrete and believable.\n"
            "- `cards` should be compact insight blocks, not filler.\n"
            "- `flow_steps` should be concise action stages.\n"
            "- `quote` should be short enough to feel premium.\n"
            "- `accent` should hint at the slide mood.\n\n"
            "Do not use walls of text. Stay concise, precise, and premium.\n\n"
            "Use the following enterprise terminology only where it strengthens the narrative:\n\n{context}"
        ),
        (
            "user",
            "Architecture summary:\n{parsed_architecture}\n\n"
            "Business outcomes:\n{business_value}\n\n"
            "Create the full premium slide narrative."
        )
    ])

    business_value_str = "\n".join(state.get("business_value", []))
    chain = prompt | structured_llm
    result = chain.invoke({
        "context": context,
        "parsed_architecture": state.get("parsed_architecture", ""),
        "business_value": business_value_str
    })

    return {"narrative_structure": result.model_dump()}


def Formatting_Node(state: AgentState) -> dict:
    narrative = state.get("narrative_structure", {}) or {}
    slides = (narrative.get("slides") or [])[:8]

    if not slides:
        return {"presentation_json": {}, "errors": "Narrative output did not contain any slides."}

    layout_sequence = build_layout_sequence(len(slides))
    normalized_slides = []
    for index, raw_slide in enumerate(slides):
        bullets = clamp_list(raw_slide.get("bullets") or [], 4, 88)
        headline = clamp_text(raw_slide.get("headline", ""), 86, clamp_text(raw_slide.get("title", ""), 80, "Executive Insight"))
        subheadline = clamp_text(raw_slide.get("subheadline", ""), 130, clamp_text(" ".join(bullets[:2]), 120))
        accent = clamp_text(raw_slide.get("accent", ""), 20, ACCENT_LIBRARY[index % len(ACCENT_LIBRARY)])
        section_label = clamp_text(raw_slide.get("section_label", ""), 24, SECTION_LIBRARY[index % len(SECTION_LIBRARY)])
        layout_style = layout_sequence[index]
        metrics = normalize_metrics(raw_slide.get("metrics") or [], bullets, subheadline)
        cards = normalize_cards(raw_slide.get("cards") or [], bullets, accent)
        steps = normalize_steps(raw_slide.get("flow_steps") or [], bullets)

        normalized_slides.append({
            "title": clamp_text(raw_slide.get("title", ""), 56, headline),
            "section_label": section_label,
            "layout_style": layout_style,
            "headline": headline,
            "subheadline": subheadline,
            "bullets": bullets,
            "metrics": metrics,
            "cards": cards,
            "flow_steps": steps,
            "quote": clamp_text(raw_slide.get("quote", ""), 92, bullets[0] if bullets else headline),
            "accent": accent,
        })

    presentation_json = {
        "deck_title": clamp_text(
            narrative.get("deck_title", ""),
            72,
            state.get("org_name") or "Executive Strategy Deck",
        ),
        "deck_subtitle": clamp_text(
            narrative.get("deck_subtitle", ""),
            120,
            f"{state.get('target_audience') or state.get('persona') or 'Executive'} narrative",
        ),
        "theme_vibe": state.get("theme_vibe") or "Professional & Executive",
        "slides": normalized_slides,
    }

    return {"presentation_json": presentation_json, "errors": ""}
