import base64
import io
import os
import re
import uuid
import zipfile
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse

from api.auth import get_current_user
from graph.graph import graph_app
from utils.pptx_generator import build_pptx
import models

router = APIRouter()

# In-memory job store for POC
JOBS: Dict[str, Dict[str, Any]] = {}

SUPPORTED_ARCHIVE_EXTENSIONS = {".zip"}
SUPPORTED_DOCUMENT_EXTENSIONS = {
    ".md", ".markdown", ".txt", ".pdf", ".docx", ".json", ".yaml", ".yml",
    ".toml", ".csv", ".rst"
}
SUPPORTED_CODE_EXTENSIONS = {
    ".py", ".js", ".jsx", ".ts", ".tsx", ".java", ".go", ".rs", ".rb", ".php",
    ".swift", ".kt", ".kts", ".c", ".h", ".cpp", ".cc", ".cs", ".scala",
    ".sql", ".html", ".css", ".scss", ".sh", ".env", ".xml"
}
SUPPORTED_IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg"}

MAX_FILES_PER_REQUEST = 12
MAX_IMAGE_SOURCES = 6
MAX_TEXT_CHARS_PER_SOURCE = 30000
MAX_TOTAL_TEXT_CHARS = 180000

STEP_PROGRESS = {
    "Preparing Inputs": 5,
    "Parsing Architecture": 20,
    "Extracting Business Value": 40,
    "Structuring Narrative": 65,
    "Formatting Custom JSON": 82,
    "Rendering Presentation": 94,
    "Completed": 100,
}

NEXT_STEP_BY_NODE = {
    "CodeParser_Node": "Extracting Business Value",
    "BusinessValue_Node": "Structuring Narrative",
    "Narrative_Node": "Formatting Custom JSON",
    "Formatting_Node": "Rendering Presentation",
}


def safe_filename(value: str) -> str:
    cleaned = re.sub(r"[^A-Za-z0-9._-]+", "_", (value or "").strip())
    cleaned = cleaned.strip("._")
    return cleaned or "Executive_Deck"


def classify_source(filename: str) -> str:
    ext = os.path.splitext((filename or "").lower())[1]
    if ext in SUPPORTED_ARCHIVE_EXTENSIONS:
        return "Archive"
    if ext in SUPPORTED_IMAGE_EXTENSIONS:
        return "Image"
    if ext in SUPPORTED_CODE_EXTENSIONS:
        return "Code"
    if ext in SUPPORTED_DOCUMENT_EXTENSIONS:
        return "Document"
    return "File"


def decode_text_content(content: bytes) -> str:
    for encoding in ("utf-8", "utf-8-sig", "latin-1"):
        try:
            return content.decode(encoding)
        except UnicodeDecodeError:
            continue
    return ""


def extract_text_from_docx(content: bytes) -> str:
    import docx

    document = docx.Document(io.BytesIO(content))
    return "\n".join(paragraph.text for paragraph in document.paragraphs if paragraph.text)


def extract_text_from_pdf(content: bytes) -> str:
    import PyPDF2

    pdf = PyPDF2.PdfReader(io.BytesIO(content))
    pages = []
    for page in pdf.pages:
        text = page.extract_text()
        if text:
            pages.append(text)
    return "\n".join(pages)


def append_text_chunk(label: str, text: str, result: Dict[str, Any], count_as_source: bool = True):
    if not text or not text.strip():
        return

    normalized = text.strip()
    if len(normalized) > MAX_TEXT_CHARS_PER_SOURCE:
        normalized = normalized[:MAX_TEXT_CHARS_PER_SOURCE].rstrip()
        result["warnings"].append(
            f"Trimmed '{label}' to keep the input focused for the AI pipeline."
        )

    remaining_chars = MAX_TOTAL_TEXT_CHARS - result["text_char_count"]
    if remaining_chars <= 0:
        result["warnings"].append(
            "Input corpus reached the current size budget, so some extra text sources were skipped."
        )
        return

    if len(normalized) > remaining_chars:
        normalized = normalized[:remaining_chars].rstrip()
        result["warnings"].append(
            f"Partially included '{label}' because the combined input was very large."
        )

    result["text_parts"].append(f"\n\n--- Source: {label} ---\n{normalized}")
    result["text_char_count"] += len(normalized)

    if count_as_source:
        result["source_summary"]["text_sources"] += 1


def append_image_source(label: str, content: bytes, result: Dict[str, Any]) -> bool:
    if result["source_summary"]["image_sources"] >= MAX_IMAGE_SOURCES:
        result["warnings"].append(
            "Accepted the upload, but only the first few images were sent to the AI to keep processing stable."
        )
        return False

    ext = os.path.splitext(label.lower())[1]
    mime = "image/png" if ext == ".png" else "image/jpeg"
    encoded = base64.b64encode(content).decode("utf-8")
    result["images"].append(f"data:{mime};base64,{encoded}")
    result["source_summary"]["image_sources"] += 1
    return True


def ingest_bytes(filename: str, content: bytes, result: Dict[str, Any]) -> bool:
    ext = os.path.splitext((filename or "").lower())[1]

    if ext in SUPPORTED_ARCHIVE_EXTENSIONS:
        try:
            extracted_items = 0
            with zipfile.ZipFile(io.BytesIO(content)) as archive:
                for archived_name in archive.namelist():
                    basename = os.path.basename(archived_name)
                    if archived_name.endswith("/") or archived_name.startswith("__MACOSX") or basename == ".DS_Store":
                        continue

                    archived_bytes = archive.read(archived_name)
                    result["source_summary"]["archive_entries"] += 1
                    if ingest_bytes(archived_name, archived_bytes, result):
                        extracted_items += 1

            if extracted_items == 0:
                result["warnings"].append(
                    f"Archive '{filename}' did not contain any supported text or image sources."
                )
            return True
        except Exception as exc:
            result["warnings"].append(f"Could not read archive '{filename}': {exc}")
            return False

    if ext == ".pdf":
        try:
            append_text_chunk(filename, extract_text_from_pdf(content), result)
            return True
        except Exception as exc:
            result["warnings"].append(f"Could not extract text from '{filename}': {exc}")
            return False

    if ext == ".docx":
        try:
            append_text_chunk(filename, extract_text_from_docx(content), result)
            return True
        except Exception as exc:
            result["warnings"].append(f"Could not extract text from '{filename}': {exc}")
            return False

    if ext in SUPPORTED_IMAGE_EXTENSIONS:
        return append_image_source(filename, content, result)

    is_known_text_file = ext in SUPPORTED_DOCUMENT_EXTENSIONS or ext in SUPPORTED_CODE_EXTENSIONS
    if not is_known_text_file and b"\x00" in content[:2048]:
        result["warnings"].append(f"Skipped unsupported binary file '{filename}'.")
        return False

    decoded_text = decode_text_content(content)
    if not decoded_text.strip():
        result["warnings"].append(f"Skipped '{filename}' because no readable content could be extracted.")
        return False

    append_text_chunk(filename, decoded_text, result)
    return True


def build_user_brief(
    org_name: str,
    purpose: str,
    persona: str,
    target_audience: str,
    key_message: str,
    theme_vibe: str,
) -> str:
    lines = [
        f"Organization or Topic: {org_name or 'Not specified'}",
        f"Presentation goal: {purpose or 'Not specified'}",
        f"Persona lens: {persona or 'Not specified'}",
        f"Target audience: {target_audience or 'Not specified'}",
        f"Key notes and requested focus areas: {key_message or 'Not specified'}",
        f"Preferred presentation style: {theme_vibe or 'Professional & Executive'}",
    ]
    return "\n".join(lines)


def execute_graph_pipeline(
    job_id: str,
    raw_text: str,
    images: list,
    org_name: str,
    purpose: str,
    persona: str,
    target_audience: str,
    key_message: str,
    theme_vibe: str,
):
    """Background task to run LangGraph and generate PPTX."""
    try:
        JOBS[job_id]["status"] = "processing"
        JOBS[job_id]["current_step"] = "Parsing Architecture"
        JOBS[job_id]["progress_percent"] = STEP_PROGRESS["Parsing Architecture"]

        initial_state = {
            "raw_docs": raw_text,
            "images": images,
            "org_name": org_name,
            "purpose": purpose,
            "persona": persona,
            "target_audience": target_audience,
            "key_message": key_message,
            "theme_vibe": theme_vibe,
        }

        final_state = initial_state
        for event in graph_app.stream(initial_state):
            for node_name, node_state in event.items():
                if isinstance(node_state, dict):
                    final_state.update(node_state)
                    JOBS[job_id]["state"] = final_state.copy()
                    if final_state.get("presentation_json"):
                        JOBS[job_id]["presentation_json"] = final_state["presentation_json"]

                outline = []
                if final_state.get("presentation_json", {}).get("slides"):
                    outline = [
                        slide.get("title", "Untitled Slide")
                        for slide in final_state["presentation_json"]["slides"]
                    ]
                elif final_state.get("narrative_structure", {}).get("slides"):
                    outline = [
                        slide.get("title", "Untitled Slide")
                        for slide in final_state["narrative_structure"]["slides"]
                    ]

                if outline:
                    JOBS[job_id]["outline"] = outline

                next_step = NEXT_STEP_BY_NODE.get(node_name)
                if next_step:
                    JOBS[job_id]["current_step"] = next_step
                    JOBS[job_id]["progress_percent"] = STEP_PROGRESS[next_step]

        JOBS[job_id]["current_step"] = "Rendering Presentation"
        JOBS[job_id]["progress_percent"] = STEP_PROGRESS["Rendering Presentation"]
        pptx_path = build_pptx(final_state.get("presentation_json", {}), org_name, theme_vibe)
        generated_slides = final_state.get("presentation_json", {}).get("slides", [])

        JOBS[job_id]["status"] = "completed"
        JOBS[job_id]["pptx_path"] = pptx_path
        JOBS[job_id]["download_name"] = f"{safe_filename(org_name)}_Executive_Deck.pptx"
        JOBS[job_id]["slides_generated"] = len(generated_slides) + 2
        JOBS[job_id]["current_step"] = "Completed"
        JOBS[job_id]["progress_percent"] = STEP_PROGRESS["Completed"]
        JOBS[job_id]["presentation_json"] = final_state.get("presentation_json")
    except Exception as exc:
        JOBS[job_id]["status"] = "error"
        JOBS[job_id]["error_msg"] = str(exc)


@router.post("/upload")
async def upload_document(
    background_tasks: BackgroundTasks,
    files: Optional[List[UploadFile]] = File(None),
    file: Optional[UploadFile] = File(None),
    org_name: str = Form(""),
    purpose: str = Form(""),
    target_audience: str = Form(""),
    key_message: str = Form(""),
    design_vibe: str = Form(""),
    current_user: models.User = Depends(get_current_user),
):
    incoming_files = list(files or [])
    if file is not None:
        incoming_files.append(file)

    if len(incoming_files) > MAX_FILES_PER_REQUEST:
        raise HTTPException(
            status_code=400,
            detail=f"You can upload up to {MAX_FILES_PER_REQUEST} files per generation."
        )

    job_id = str(uuid.uuid4())
    ingestion_result = {
        "text_parts": [],
        "images": [],
        "warnings": [],
        "text_char_count": 0,
        "source_summary": {
            "files_received": len(incoming_files),
            "text_sources": 0,
            "image_sources": 0,
            "archive_entries": 0,
        },
    }
    append_text_chunk(
        "User Brief",
        build_user_brief(
            org_name,
            purpose,
            current_user.persona or "",
            target_audience,
            key_message,
            design_vibe,
        ),
        ingestion_result,
        count_as_source=False,
    )

    source_manifest = []
    for uploaded_file in incoming_files:
        filename = uploaded_file.filename or "untitled"
        content = await uploaded_file.read()
        descriptor = {
            "name": filename,
            "kind": classify_source(filename),
            "size_bytes": len(content),
            "skipped": False,
        }
        descriptor["skipped"] = not ingest_bytes(filename, content, ingestion_result)
        source_manifest.append(descriptor)

    raw_text = "".join(ingestion_result["text_parts"]).strip()
    images = ingestion_result["images"]

    if not raw_text and not images:
        raise HTTPException(
            status_code=400,
            detail="Add at least one supported file or enough briefing context for the deck."
        )

    JOBS[job_id] = {
        "status": "uploading",
        "current_step": "Preparing Inputs",
        "progress_percent": STEP_PROGRESS["Preparing Inputs"],
        "state": {},
        "pptx_path": None,
        "download_name": f"{safe_filename(org_name)}_Executive_Deck.pptx",
        "error_msg": None,
        "warnings": ingestion_result["warnings"],
        "sources": source_manifest,
        "outline": [],
        "presentation_json": None,
        "slides_generated": 0,
        "source_summary": ingestion_result["source_summary"],
    }

    background_tasks.add_task(
        execute_graph_pipeline,
        job_id,
        raw_text,
        images,
        org_name,
        purpose,
        current_user.persona,
        target_audience,
        key_message,
        design_vibe,
    )

    return {
        "job_id": job_id,
        "status": "processing",
        "current_step": JOBS[job_id]["current_step"],
        "progress_percent": JOBS[job_id]["progress_percent"],
        "error_msg": None,
        "warnings": JOBS[job_id]["warnings"],
        "sources": JOBS[job_id]["sources"],
        "source_summary": JOBS[job_id]["source_summary"],
        "outline": JOBS[job_id]["outline"],
        "presentation_json": JOBS[job_id]["presentation_json"],
        "slides_generated": JOBS[job_id]["slides_generated"],
    }


@router.get("/status/{job_id}")
async def get_status(job_id: str):
    if job_id not in JOBS:
        raise HTTPException(status_code=404, detail="Job not found")

    job = JOBS[job_id]
    return {
        "job_id": job_id,
        "status": job["status"],
        "current_step": job.get("current_step", "Preparing Inputs"),
        "progress_percent": job.get("progress_percent", 0),
        "error_msg": job.get("error_msg"),
        "warnings": job.get("warnings", []),
        "sources": job.get("sources", []),
        "outline": job.get("outline", []),
        "presentation_json": job.get("presentation_json"),
        "slides_generated": job.get("slides_generated", 0),
        "source_summary": job.get("source_summary", {}),
    }


@router.get("/download/{job_id}")
async def download_deck(job_id: str):
    if job_id not in JOBS:
        raise HTTPException(status_code=404, detail="Job not found")

    job = JOBS[job_id]
    if job["status"] != "completed" or not job["pptx_path"]:
        raise HTTPException(status_code=400, detail="Presentation not ready yet")

    return FileResponse(
        path=job["pptx_path"],
        filename=job.get("download_name", "Executive_Deck.pptx"),
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
    )
