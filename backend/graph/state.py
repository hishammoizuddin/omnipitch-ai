from typing import TypedDict, List

class AgentState(TypedDict):
    raw_docs: str
    images: List[str]
    org_name: str
    purpose: str
    persona: str
    target_audience: str
    key_message: str
    theme_vibe: str
    parsed_architecture: str
    source_facts: List[str]
    quantified_signals: List[str]
    strategic_priorities: List[str]
    open_questions: List[str]
    business_value: List[str]
    narrative_structure: dict
    presentation_json: dict
    errors: str
