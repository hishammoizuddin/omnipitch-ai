import uuid
import zipfile
import io
from typing import Dict, Any
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks, Depends
from api.auth import get_current_user
import models
from fastapi.responses import FileResponse

from graph.graph import graph_app
from utils.pptx_generator import build_pptx

router = APIRouter()

# In-memory job store for POC
JOBS: Dict[str, Dict[str, Any]] = {}

def execute_graph_pipeline(job_id: str, raw_text: str, images: list, org_name: str, purpose: str, persona: str, target_audience: str, key_message: str, theme_vibe: str):
    """Background task to run LangGraph and generate PPTX."""
    try:
        JOBS[job_id]["status"] = "processing"
        
        initial_state = {
            "raw_docs": raw_text,
            "images": images,
            "org_name": org_name,
            "purpose": purpose,
            "persona": persona,
            "target_audience": target_audience,
            "key_message": key_message,
            "theme_vibe": theme_vibe
        }
        
        # Stream the LangGraph execution to capture intermediate states
        final_state = initial_state
        for event in graph_app.stream(initial_state):
            for node_name, node_state in event.items():
                if isinstance(node_state, dict):
                    # Merge intermediate state into JOBS tracker
                    final_state.update(node_state)
                    JOBS[job_id]["state"] = final_state.copy()
        
        # Generate PPTX passing the theme vibe
        pptx_path = build_pptx(final_state.get("presentation_json", {}), org_name, theme_vibe)
        
        JOBS[job_id]["status"] = "completed"
        JOBS[job_id]["pptx_path"] = pptx_path
    except Exception as e:
        JOBS[job_id]["status"] = "error"
        JOBS[job_id]["error_msg"] = str(e)


@router.post("/upload")
async def upload_document(
    background_tasks: BackgroundTasks, 
    file: UploadFile = File(...),
    org_name: str = Form(""),
    purpose: str = Form(""),
    target_audience: str = Form(""),
    key_message: str = Form(""),
    design_vibe: str = Form(""),
    current_user: models.User = Depends(get_current_user)
):
    if not file.filename.endswith(('.zip', '.md')):
        raise HTTPException(status_code=400, detail="Only .zip or .md files are supported")
    
    job_id = str(uuid.uuid4())
    JOBS[job_id] = {"status": "uploading", "current_step": "Initializing", "error_msg": None}
    
    content = await file.read()
    raw_text = ""
    images = []
    
    if file.filename.endswith(".zip"):
        try:
            with zipfile.ZipFile(io.BytesIO(content)) as z:
                for filename in z.namelist():
                    # Ignore dirs and macosx junk
                    if not filename.endswith("/") and not filename.startswith("__MACOSX"):
                        try:
                            file_content = z.read(filename).decode("utf-8")
                            raw_text += f"\n\n--- File: {filename} ---\n{file_content}"
                        except UnicodeDecodeError:
                            if filename.endswith(".docx"):
                                try:
                                    import docx
                                    doc = docx.Document(io.BytesIO(z.read(filename)))
                                    text = "\n".join([p.text for p in doc.paragraphs])
                                    raw_text += f"\n\n--- File: {filename} ---\n{text}"
                                except Exception as dec_err:
                                    pass
                            elif filename.lower().endswith((".png", ".jpg", ".jpeg")):
                                try:
                                    import base64
                                    img_data = z.read(filename)
                                    b64_img = base64.b64encode(img_data).decode('utf-8')
                                    mime = "image/png" if filename.lower().endswith(".png") else "image/jpeg"
                                    images.append(f"data:{mime};base64,{b64_img}")
                                except Exception:
                                    pass
                            elif filename.lower().endswith(".pdf"):
                                try:
                                    import PyPDF2
                                    pdf = PyPDF2.PdfReader(io.BytesIO(z.read(filename)))
                                    text = ""
                                    for page in pdf.pages:
                                        t = page.extract_text()
                                        if t:
                                            text += t + "\n"
                                    raw_text += f"\n\n--- File: {filename} (PDF) ---\n{text}"
                                except Exception:
                                    pass
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error extracting zip: {str(e)}")
    else:
        raw_text = content.decode("utf-8")
        
    # The initial job creation is now handled above with "uploading" status
    # JOBS[job_id] = {
    #     "status": "processing",
    #     "state": {},
    #     "pptx_path": None,
    #     "error_msg": None
    # }
    
    # Run in background to not block HTTP response
    background_tasks.add_task(
        execute_graph_pipeline, 
        job_id, raw_text, images, org_name, purpose, current_user.persona,
        target_audience, key_message, design_vibe
    )
    
    return {"job_id": job_id, "status": "processing"}

@router.get("/status/{job_id}")
async def get_status(job_id: str):
    if job_id not in JOBS:
        raise HTTPException(status_code=404, detail="Job not found")
        
    job = JOBS[job_id]
    state = job.get("state", {})
    
    # Infer progress from state keys
    current_step = "Parsing Architecture"
    if "parsed_architecture" in state:
        current_step = "Extracting Business Value"
    if "business_value" in state:
        current_step = "Structuring Narrative"
    if "narrative_structure" in state:
        current_step = "Formatting Custom JSON"
    if job["status"] == "completed":
        current_step = "Completed"
        
    return {
        "job_id": job_id,
        "status": job["status"],
        "current_step": current_step,
        "error_msg": job.get("error_msg")
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
        filename="OmniPitchAI_Executive_Deck.pptx",
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation"
    )
