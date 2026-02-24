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
    business_value: List[str]
    narrative_structure: dict
    presentation_json: dict
    errors: str
