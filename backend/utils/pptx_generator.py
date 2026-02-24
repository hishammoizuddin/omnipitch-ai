import os
import tempfile
import random
from typing import Dict, Any, Tuple
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.text import MSO_ANCHOR

def extract_colors_from_vibe(theme_vibe: str) -> Tuple[RGBColor, RGBColor, RGBColor, RGBColor]:
    """
    Dynamically maps a text vibe (e.g., 'Google', 'Cyberpunk', 'Corporate') 
    to a primary, secondary, background, and text RGB color palette.
    """
    vibe = theme_vibe.lower()
    
    # 1. Google / Tech Vibe
    if "google" in vibe or "startup" in vibe:
        return RGBColor(66, 133, 244), RGBColor(52, 168, 83), RGBColor(255, 255, 255), RGBColor(40, 40, 40)
        
    # 2. Apple / Minimalist Vibe
    elif "apple" in vibe or "minimal" in vibe or "clean" in vibe:
        return RGBColor(0, 0, 0), RGBColor(142, 142, 147), RGBColor(245, 245, 247), RGBColor(40, 40, 40)

    # 3. Cyberpunk / Hacker Vibe
    elif "cyber" in vibe or "hacker" in vibe or "matrix" in vibe:
        return RGBColor(0, 255, 65), RGBColor(255, 0, 60), RGBColor(13, 2, 8), RGBColor(255, 255, 255)

    # 4. Aisynch Labs Default (Dark Corporate)
    elif "dark" in vibe or "aisynch" in vibe:
        return RGBColor(20, 30, 80), RGBColor(112, 128, 144), RGBColor(250, 250, 250), RGBColor(40, 40, 40)
        
    # 5. Default Corporate Executive
    else:
        return RGBColor(31, 73, 125), RGBColor(192, 192, 192), RGBColor(255, 255, 255), RGBColor(40, 40, 40)


def apply_text_style(paragraphs, color: RGBColor, size_pt: int, bold: bool = False, italic: bool = False, font_name: str = "Arial"):
    """Helper to forcefully apply modern typography and color to all runs in paragraphs."""
    for paragraph in paragraphs:
        for run in paragraph.runs:
            run.font.name = font_name
            run.font.color.rgb = color
            run.font.size = Pt(size_pt)
            run.font.bold = bold
            run.font.italic = italic

def format_title(title_shape, text: str, color: RGBColor):
    """Formats a title shape with the given color"""
    title_shape.text = text
    apply_text_style(title_shape.text_frame.paragraphs, color, 40, bold=True)


def render_smart_layout(slide, slide_data: dict, width: float, height: float, primary_clr: RGBColor, sec_clr: RGBColor, bg_clr: RGBColor, text_color: RGBColor):
    """
    Renders content dynamically based on the layout_style provided by the LLM.
    """
    layout_style = slide_data.get("layout_style", "Standard Bullet")
    content = slide_data.get("content", [])
    
    if not isinstance(content, list):
        content = [str(content)]
    
    # Header shape
    header_shape = slide.shapes.add_shape(1, 0, 0, width, Inches(1.2))
    header_shape.fill.solid()
    header_shape.fill.fore_color.rgb = primary_clr
    header_shape.line.fill.background()
    
    # Header text
    title_box = slide.shapes.add_textbox(Inches(0.5), Inches(0.2), width - Inches(1), Inches(0.8))
    tf = title_box.text_frame
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]
    p.text = slide_data.get("title", "Executive Summary")
    apply_text_style(tf.paragraphs, RGBColor(255, 255, 255), 32, bold=True)
    
    # Render logic based on style
    if "Flowchart" in layout_style or "Architecture" in layout_style:
        # Render horizontal blocks to simulate a flow
        box_width = Inches(2.5)
        box_height = Inches(1.5)
        gap = Inches(0.5)
        start_x = Inches(0.5)
        start_y = Inches(3)
        
        for i, point in enumerate(content[:3]): # Max 3 blocks for flowchart
            x_pos = start_x + (i * (box_width + gap))
            
            # Draw flow block
            block = slide.shapes.add_shape(1, x_pos, start_y, box_width, box_height)
            block.fill.solid()
            block.fill.fore_color.rgb = sec_clr
            block.line.fill.background()
            
            tf_b = block.text_frame
            tf_b.word_wrap = True
            tf_b.vertical_anchor = MSO_ANCHOR.MIDDLE
            
            p_b = tf_b.paragraphs[0]
            p_b.text = str(point)
            p_b.alignment = PP_ALIGN.CENTER
            apply_text_style(tf_b.paragraphs, text_color, 16, bold=True)
            
            # Draw arrow pointing right if not last block
            if i < min(len(content), 3) - 1:
                arrow = slide.shapes.add_shape(33, x_pos + box_width + Inches(0.1), start_y + Inches(0.5), Inches(0.3), Inches(0.5)) # Right Arrow
                arrow.fill.solid()
                arrow.fill.fore_color.rgb = primary_clr
                arrow.line.fill.background()
                
    elif "Metric" in layout_style or "ROI" in layout_style:
        # Render large metric callouts
        box_width = width / 2 - Inches(1)
        start_y = Inches(2.5)
        
        for i, point in enumerate(content[:2]): # Max 2 large metrics
            x_pos = Inches(0.5) if i == 0 else width / 2 + Inches(0.5)
            
            # Giant numbers/text
            txBox = slide.shapes.add_textbox(x_pos, start_y, box_width, Inches(2))
            tf = txBox.text_frame
            tf.word_wrap = True
            
            p = tf.paragraphs[0]
            p.text = str(point)
            p.alignment = PP_ALIGN.CENTER
            apply_text_style(tf.paragraphs, primary_clr, 28, bold=True)
            
    else:
        # Standard Bullet Layout
        body_box = slide.shapes.add_textbox(Inches(0.5), Inches(1.5), width - Inches(1), height - Inches(2))
        tf_body = body_box.text_frame
        tf_body.word_wrap = True
        
        for i, point in enumerate(content):
            p = tf_body.add_paragraph()
            p.text = f"•  {str(point)}"
            p.level = 0
            if i < len(content) - 1:
                p.space_after = Pt(20)
        apply_text_style(tf_body.paragraphs, text_color, 20)
                
                
def build_pptx(presentation_json: Dict[str, Any], org_name: str = "Enterprise", theme_vibe: str = "Corporate") -> str:
    """
    Consumes presentation JSON output from LangGraph and generates 
    a highly stylized, un-branded PPTX file strictly matching the user vibe.
    """
    prs = Presentation()
    
    width = prs.slide_width
    height = prs.slide_height

    # Extract dynamic brand colors based on input theme
    primary_clr, secondary_clr, bg_clr, text_color = extract_colors_from_vibe(theme_vibe)
    
    # Helper to apply background
    def apply_bg(slide_obj):
        bg = slide_obj.shapes.add_shape(1, 0, 0, width, height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = bg_clr
        bg.line.fill.background()
        return bg

    # 1. Title Slide (Cover)
    title_slide_layout = prs.slide_layouts[6] # Blank
    slide = prs.slides.add_slide(title_slide_layout)
    apply_bg(slide)
    
    # Title Color Block
    bg_shape = slide.shapes.add_shape(1, 0, 0, Inches(4), height)
    bg_shape.fill.solid()
    bg_shape.fill.fore_color.rgb = primary_clr
    bg_shape.line.fill.background()
    
    # Title Text
    txBox = slide.shapes.add_textbox(Inches(4.5), Inches(2.5), Inches(5), Inches(2))
    tf = txBox.text_frame
    p = tf.paragraphs[0]
    p.text = f"{org_name}"
    apply_text_style(tf.paragraphs, primary_clr, 54, bold=True)
    
    # Subtitle Text
    p2 = tf.add_paragraph()
    p2.text = f"Executive Strategic Architecture\nTheme: {theme_vibe}"
    apply_text_style([p2], secondary_clr, 24)
    
    # 2. Content Slides
    blank_layout = prs.slide_layouts[6]
    slides_data = presentation_json.get("slides", [])
    
    for slide_data in slides_data:
        slide = prs.slides.add_slide(blank_layout)
        apply_bg(slide)
        
        render_smart_layout(slide, slide_data, width, height, primary_clr, secondary_clr, bg_clr, text_color)
        
    # 3. Closing Slide
    slide = prs.slides.add_slide(blank_layout)
    
    # Full background cover for closing
    bg_shape = slide.shapes.add_shape(1, 0, 0, width, height)
    bg_shape.fill.solid()
    bg_shape.fill.fore_color.rgb = primary_clr
    bg_shape.line.fill.background()
    
    txBox = slide.shapes.add_textbox(Inches(1), Inches(3), width - Inches(2), Inches(2))
    tf = txBox.text_frame
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    
    p = tf.paragraphs[0]
    p.text = f"{org_name}"
    p.alignment = PP_ALIGN.CENTER
    apply_text_style([p], RGBColor(255, 255, 255), 60, bold=True)
    
    p2 = tf.add_paragraph()
    p2.text = "Thank You"
    p2.alignment = PP_ALIGN.CENTER
    apply_text_style([p2], RGBColor(255, 255, 255), 32)
    
    # Save file
    fd, path = tempfile.mkstemp(prefix="omnipitch_deck_", suffix=".pptx")
    os.close(fd)
    
    prs.save(path)
    return path
