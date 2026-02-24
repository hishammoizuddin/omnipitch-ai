import json
from typing import Dict, List
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import SystemMessage, HumanMessage
from pydantic import BaseModel, Field

from .state import AgentState
from utils.pinecone_db import get_vector_store

# Pydantic Schemas for GPT Structured Output (Pydantic V2)
class ArchitectureSummary(BaseModel):
    summary: str = Field(description="Summary of the tech stack, data flow, architecture, schema and key features")

class BusinessOutcomes(BaseModel):
    outcomes: List[str] = Field(description="List of extracted ROI, efficiency gains, and business value outcomes mapped to technical features")

class Slide(BaseModel):
    title: str = Field(description="Title of the slide")
    layout_style: str = Field(description="The requested slide type: e.g. 'Standard Bullet', 'Flowchart', 'Key Metric', 'Split Data'")
    talking_points: List[str] = Field(description="Bullet points, metric highlights, or flowchart node descriptions for the slide")

class Narrative(BaseModel):
    slides: List[Slide] = Field(description="List of 5-7 slides covering Problem, Solution Architecture, ROI, Change Management, Next Steps")

def CodeParser_Node(state: AgentState) -> dict:
    llm = ChatOpenAI(model="gpt-4o", temperature=0)
    structured_llm = llm.with_structured_output(ArchitectureSummary)
    
    raw_docs = state.get("raw_docs", "")
    images = state.get("images", [])
    
    messages = [
        SystemMessage(content="You are an expert software architect. Analyze the provided raw technical documentation or repository extract. Identify the core architecture, data schema, and key features.")
    ]
    
    user_content = []
    if raw_docs.strip():
        user_content.append({"type": "text", "text": f"Extract architecture details from this text:\n\n{raw_docs}"})
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
    purpose = state.get("purpose") or "general tech overview"
    target_audience = state.get("target_audience") or state.get("persona") or "Executive"
    key_message = state.get("key_message") or "general operational business value"
    theme_vibe = state.get("theme_vibe") or "Executive Corporate"

    prompt = ChatPromptTemplate.from_messages([
        ("system", f"You are a Senior Strategic Partner at McKinsey & Company exclusively advising {org_name}. Map the technical features of this architecture to high-margin business outcomes. Target Audience: '{target_audience}'. Design Vibe: '{theme_vibe}'. Core Goal: '{purpose}'. Key Strategic Imperative to enforce: '{key_message}'.\n\nCRITICAL INSTRUCTION: Do NOT merely summarize or repeat the raw input. You must synthesize the data into forward-looking, high-signal business strategy, focusing heavily on operational efficiency, market advantage, and direct ROI for {org_name}'s specific context."),
        ("user", "Technical Architecture:\n\n{parsed_architecture}")
    ])
    
    chain = prompt | structured_llm
    result = chain.invoke({"parsed_architecture": state.get("parsed_architecture", "")})
    
    return {"business_value": result.outcomes}

def Narrative_Node(state: AgentState) -> dict:
    llm = ChatOpenAI(model="gpt-4o", temperature=0)
    structured_llm = llm.with_structured_output(Narrative)
    
    # Query Pinecone for context
    vector_store = get_vector_store()
    retriever = vector_store.as_retriever(search_kwargs={"k": 5})
    # Query for enterprise terminology to ensure tone
    docs = retriever.invoke("enterprise terminology brand guidelines change management TOGAF ITIL")
    context = "\n\n".join(doc.page_content for doc in docs)
    
    org_name = state.get("org_name") or "the enterprise"
    purpose = state.get("purpose") or "general tech overview"
    target_audience = state.get("target_audience") or state.get("persona") or "Executive"
    key_message = state.get("key_message") or "strategic impact"
    theme_vibe = state.get("theme_vibe") or "Executive Corporate"

    prompt = ChatPromptTemplate.from_messages([
        ("system", f"You are an elite Enterprise Strategy Consultant for {org_name}. Architect a 5-to-7 slide master narrative explicitly tailored for: '{target_audience}'. Ultimate Goal: '{purpose}'. Strategic Imperative: '{key_message}'. Design Vibe: '{theme_vibe}'.\n\nCRITICAL INSTRUCTIONS:\n1. Your presentation must NOT simply repeat the user's inputs or technical bullet points. It must be highly 'Output-Oriented'—charting the actionable business journey required to achieve the Ultimate Goal.\n2. Do NOT mention OmniPitchAI or Aisynch Labs. The presentation belongs to {org_name}.\n3. Select a `layout_style` dynamically: use 'Flowchart' or 'Architecture' when outlining processes/systems; use 'Key Metric' or 'ROI' when highlighting specific numbers/gains; use 'Standard Bullet' for narrative context.\n4. Keep the tone rigorously aligned with the requested '{theme_vibe}'. Speak like a true executive leader.\n\nUse the following enterprise terminology ONLY if it aligns with the requested output:\n\n{{context}}"),
        ("user", "Technical Architecture capabilities:\n{parsed_architecture}\n\nStrategic Business Value Outcomes:\n{business_value}\n\nGenerate the compelling narrative slides mapping strictly to the layout styles and strategic talking points.")
    ])
    
    business_value_str = "\n".join(state.get("business_value", []))
    chain = prompt | structured_llm
    result = chain.invoke({
        "context": context,
        "parsed_architecture": state.get("parsed_architecture", ""),
        "business_value": business_value_str
    })
    
    # Map slide titles to talking points and layout
    narrative_structure = {
        slide.title: {
            "layout_style": slide.layout_style,
            "content": slide.talking_points
        } for slide in result.slides
    }
    return {"narrative_structure": narrative_structure}

def Formatting_Node(state: AgentState) -> dict:
    llm = ChatOpenAI(model="gpt-4o", temperature=0)
    
    narrative_structure = state.get("narrative_structure", {})
    error_context = state.get("errors", "")
    
    system_msg = "You are a formatting expert. Given a slide narrative dict, format it into a list of slide objects. Each item MUST have 'title', 'layout_style' and precisely 'content' (where content is a list of strings). Output ONLY valid JSON containing an object with a 'slides' array. Do not use markdown like ```json."
    
    if error_context:
        system_msg += f"\n\nPrevious attempt failed with error:\n{error_context}\nPlease fix the JSON formatting."
        
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_msg),
        ("user", "Narrative Structure Dict:\n{narrative}")
    ])
    
    chain = prompt | llm
    result = chain.invoke({"narrative": json.dumps(narrative_structure)})
    
    content = result.content.strip()
    if content.startswith("```json"):
        content = content[7:-3]
    elif content.startswith("```"):
        content = content[3:-3]
        
    try:
        presentation_json = json.loads(content)
        
        # Validate schema structure
        if "slides" not in presentation_json:
            raise ValueError("JSON missing 'slides' key")
        for s in presentation_json["slides"]:
            if "title" not in s or "content" not in s:
                raise ValueError("Slide missing 'title' or 'content' keys")
                
        # Only if valid:
        return {"presentation_json": presentation_json, "errors": ""}
    except Exception as e:
        return {"presentation_json": {}, "errors": f"Malformed JSON: {str(e)}"}
