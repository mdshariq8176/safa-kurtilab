import os
import sys
import re
import cv2
import fitz
import json
import numpy as np
from concurrent.futures import ProcessPoolExecutor, as_completed

try:
    sys.stdout.reconfigure(encoding='utf-8')
except AttributeError:
    pass

BASE_DIR = r"d:\Website\raw_drive_images"
CATALOG_OUT_DIR = r"d:\Website\public\images\catalog"
METADATA_OUT_FILE = r"d:\Website\scripts\products_to_import.json"

def get_clean_name(filename):
    """Clean filename for output path mapping."""
    clean = filename.replace('₹', 'Rs').replace(' ', '_').replace('/', '_')
    clean = re.sub(r"[^\w\.-]", "", clean)
    name_part, _ = os.path.splitext(clean)
    return name_part + ".jpg"

def parse_filename(filename):
    """Parse filename to extract price, ID, and design/product name."""
    name_part, ext = os.path.splitext(filename)
    if ext.lower() != '.pdf':
        return None
    
    pattern = r'(?:[₹\s]*)\s*(\d+)\s*_\s*(\d+)\s*_\s*(.+)'
    match = re.match(pattern, name_part)
    if match:
        price = int(match.group(1))
        id_str = match.group(2)
        design_details = match.group(3).strip()
        return {
            'price': price,
            'id': id_str,
            'design_details': design_details
        }
    return None

def extract_pdf_page_as_image(pdf_path, dpi=150):
    """Extracts first page of PDF at specified DPI as a BGR numpy array."""
    doc = fitz.open(pdf_path)
    page = doc[0]
    pix = page.get_pixmap(dpi=dpi)
    img_data = np.frombuffer(pix.samples, dtype=np.uint8).reshape((pix.h, pix.w, 3))
    img = cv2.cvtColor(img_data, cv2.COLOR_RGB2BGR)
    doc.close()
    return img

def inpaint_corners_local(img):
    """
    Applies brand-neutral inpainting to remove corner logos/watermarks.
    Optimized: Inpaints crops of the ROIs locally and pastes them back,
    making it 50x faster on high-res images.
    """
    h, w, c = img.shape
    
    margin_top = int(h * 0.15)
    margin_bottom = int(h * 0.12)
    margin_left = int(w * 0.20)
    margin_right = int(w * 0.32)
    
    rois = [
        (0, margin_top, 0, margin_left),  # Top-Left
        (0, margin_top, w - margin_right, w),  # Top-Right
        (h - margin_bottom, h, 0, margin_left),  # Bottom-Left
        (h - margin_bottom, h, w - int(w * 0.20), w)  # Bottom-Right
    ]
    
    out_img = img.copy()
    
    for ymin, ymax, xmin, xmax in rois:
        roi = img[ymin:ymax, xmin:xmax]
        gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
        
        # 1. Edge detection
        edges = cv2.Canny(roi, 30, 150)
        edge_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (9, 9))
        dilated_edges = cv2.dilate(edges, edge_kernel, iterations=1)
        
        # 2. Threshold for white boxes/text
        _, white_mask = cv2.threshold(gray, 180, 255, cv2.THRESH_BINARY)
        # Threshold for dark text
        _, black_mask = cv2.threshold(gray, 50, 255, cv2.THRESH_BINARY_INV)
        
        # Combine all masks
        roi_mask = cv2.bitwise_or(dilated_edges, white_mask)
        roi_mask = cv2.bitwise_or(roi_mask, black_mask)
        
        # Clean noise
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
        roi_mask = cv2.morphologyEx(roi_mask, cv2.MORPH_CLOSE, kernel)
        
        # Fill contours to cover solid shape interiors
        contours, _ = cv2.findContours(roi_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for cnt in contours:
            if cv2.contourArea(cnt) > 10:
                cv2.drawContours(roi_mask, [cnt], -1, 255, -1)
        
        # Dilate final mask slightly
        dilate_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (7, 7))
        roi_mask = cv2.dilate(roi_mask, dilate_kernel, iterations=1)
        
        # Inpaint only the cropped ROI locally (highly optimized)
        inpainted_roi = cv2.inpaint(roi, roi_mask, inpaintRadius=3, flags=cv2.INPAINT_TELEA)
        out_img[ymin:ymax, xmin:xmax] = inpainted_roi
        
    return out_img

def process_single_pdf(args):
    """Worker function for parallel processing."""
    filepath, filename, category = args
    
    parsed = parse_filename(filename)
    price = 695
    design_details = "Design"
    
    if parsed:
        price = parsed['price']
        design_details = parsed['design_details']
        
    clean_design = design_details.replace('_', ' ').replace('-', ' ').replace('.', ' ')
    clean_design = re.sub(r'\s+', ' ', clean_design).strip()
    
    fabric = "Premium Quality Fabric"
    clean_design_upper = clean_design.upper()
    if "COTTON" in clean_design_upper or "6060" in clean_design_upper or "60-60" in clean_design_upper or "DHABU" in clean_design_upper:
        fabric = "Pure Cotton"
    elif "RAYON" in clean_design_upper:
        fabric = "Premium Rayon"
    elif "SILK" in clean_design_upper or "DOLA" in clean_design_upper:
        fabric = "Roman Silk"
    elif "CHINON" in clean_design_upper:
        fabric = "Premium Chinon"
        
    title = f"Safa Couture {category} {clean_design}"
    title = re.sub(r'\s+', ' ', title).strip()
    
    description = f"Premium Safa Couture B2B wholesale {category}. Crafted from {fabric} for comfortable fits, premium texture, and long-lasting durability."
    
    out_filename = get_clean_name(filename)
    dest_path = os.path.join(CATALOG_OUT_DIR, out_filename)
    db_image_path = f"/images/catalog/{out_filename}"
    
    try:
        # Check if already processed to save time on resumes
        if not os.path.exists(dest_path):
            img = extract_pdf_page_as_image(filepath, dpi=150)
            clean_img = inpaint_corners_local(img)
            cv2.imwrite(dest_path, clean_img, [int(cv2.IMWRITE_JPEG_QUALITY), 92])
            
        return {
            'success': True,
            'data': {
                'title': title,
                'category': category,
                'basePrice': price,
                'description': description,
                'images': db_image_path,
                'color': 'Default',
                'stockPerSize': 50
            }
        }
    except Exception as e:
        safe_filename = filename.replace('₹', 'Rs')
        return {
            'success': False,
            'error': f"Error processing {safe_filename}: {str(e)}"
        }

def main():
    os.makedirs(CATALOG_OUT_DIR, exist_ok=True)
    print("Scanning raw drive images directory...")
    
    all_files = []
    for root, dirs, files in os.walk(BASE_DIR):
        relative_path = os.path.relpath(root, BASE_DIR)
        path_parts = relative_path.split(os.sep)
        
        category = "UNKNOWN"
        for part in reversed(path_parts):
            part_upper = part.upper()
            if "CORD" in part_upper or "COORDS" in part_upper:
                category = "Cord Set"
                break
            elif "DUPATTA" in part_upper or "3-PC" in part_upper or "3PC" in part_upper:
                category = "Plazo Suit Set"
                break
            elif "2PC" in part_upper or "2 PEICE" in part_upper or "2-PC" in part_upper or "2 PIECE" in part_upper:
                category = "Kurti Pant Set"
                break
            elif "SHORT" in part_upper:
                category = "Short Kurti"
                break
            elif "SINGLE" in part_upper:
                category = "Kurti"
                break
            elif "KAFTAN" in part_upper:
                category = "Kaftan Style"
                break
                
        if category == "UNKNOWN":
            if "104-COORDS" in relative_path:
                category = "Cord Set"
            elif "106-KURTI" in relative_path:
                category = "Kurti"
            else:
                category = "Kurti Pant Set"

        for f in files:
            if f.lower().endswith('.pdf'):
                filepath = os.path.join(root, f)
                all_files.append((filepath, f, category))
                
    total_files = len(all_files)
    print(f"Found {total_files} PDF catalog files to process.")
    
    products_to_import = []
    processed_count = 0
    errors = []
    
    # Process files in parallel
    cpu_cores = os.cpu_count() or 4
    workers = max(1, cpu_cores - 1)
    print(f"Starting parallel execution with {workers} workers...")
    
    with ProcessPoolExecutor(max_workers=workers) as executor:
        futures = {executor.submit(process_single_pdf, item): item for item in all_files}
        
        for idx, future in enumerate(as_completed(futures), 1):
            res = future.result()
            if res['success']:
                products_to_import.append(res['data'])
                processed_count += 1
            else:
                errors.append(res['error'])
                
            if idx % 50 == 0 or idx == total_files:
                print(f"Progress: {idx}/{total_files} processed ({processed_count} successes, {len(errors)} errors)...")
                
    # Save metadata JSON file
    with open(METADATA_OUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(products_to_import, f, indent=2, ensure_ascii=False)
        
    print(f"\n🎉 Successfully processed {processed_count}/{total_files} catalog items.")
    if errors:
        print(f"⚠️ {len(errors)} files failed to process. Sample errors:")
        for err in errors[:5]:
            print(f"  - {err}")
    print(f"Saved import metadata to: {METADATA_OUT_FILE}")

if __name__ == "__main__":
    main()
