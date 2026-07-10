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

def inpaint_entire_margins(img):
    """
    Applies brand-neutral inpainting to remove text/logos from the entire outer margin areas,
    preventing any cropping or distortion of the original image frame.
    """
    h, w, c = img.shape
    out_img = img.copy()
    
    # Define outer boundary margins (Top 18%, Bottom 15%, Left 24%, Right 24%)
    margin_top = int(h * 0.18)
    margin_bottom = int(h * 0.15)
    margin_left = int(w * 0.24)
    margin_right = int(w * 0.24)
    
    rois = [
        (0, margin_top, 0, w),                      # Top margin
        (h - margin_bottom, h, 0, w),                # Bottom margin
        (margin_top, h - margin_bottom, 0, margin_left), # Left margin
        (margin_top, h - margin_bottom, w - margin_right, w) # Right margin
    ]
    
    for ymin, ymax, xmin, xmax in rois:
        if ymin >= ymax or xmin >= xmax:
            continue
            
        roi = img[ymin:ymax, xmin:xmax]
        roi_h, roi_w, _ = roi.shape
        gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
        
        # 1. Edge detection for text/logos
        edges = cv2.Canny(roi, 30, 150)
        
        # 2. Thresholding for high-contrast white and dark shapes (typical of labels)
        _, white_mask = cv2.threshold(gray, 200, 255, cv2.THRESH_BINARY)
        _, black_mask = cv2.threshold(gray, 55, 255, cv2.THRESH_BINARY_INV)
        
        # Combine masks
        mask = cv2.bitwise_or(edges, white_mask)
        mask = cv2.bitwise_or(mask, black_mask)
        
        # Dilate mask to group characters into blocks
        group_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (11, 5))
        mask_grouped = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, group_kernel)
        
        # Local mask for inpainting
        local_inpaint_mask = np.zeros((roi_h, roi_w), dtype=np.uint8)
        
        # Find contours of candidate text regions
        contours, _ = cv2.findContours(mask_grouped, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        for cnt in contours:
            x, y, cw, ch = cv2.boundingRect(cnt)
            # Filter: exclude large clothing contours to protect product textures
            if ch > 2 and cw > 2:
                if ch < int(h * 0.10) and cw < int(w * 0.35):
                    cv2.drawContours(local_inpaint_mask, [cnt], -1, 255, -1)
                    
        # Dilate final inpaint mask slightly for smooth boundary transitions
        dilate_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
        local_inpaint_mask = cv2.dilate(local_inpaint_mask, dilate_kernel, iterations=1)
        
        # Apply inpaint locally
        inpainted_roi = cv2.inpaint(roi, local_inpaint_mask, inpaintRadius=3, flags=cv2.INPAINT_TELEA)
        out_img[ymin:ymax, xmin:xmax] = inpainted_roi
        
    return out_img

def add_corner_watermark(img, watermark_path):
    """
    Subtly overlays the SAFA brand emblem as a corner watermark (15% image width, 18% opacity).
    """
    h, w, c = img.shape
    watermark = cv2.imread(watermark_path)
    if watermark is None:
        return img
        
    # Scale watermark width to 15% of the product image width
    wm_w = int(w * 0.15)
    wm_h = int(watermark.shape[0] * (wm_w / watermark.shape[1]))
    resized_wm = cv2.resize(watermark, (wm_w, wm_h), interpolation=cv2.INTER_AREA)
    
    # Position in bottom-right corner with 20px padding
    padding = 20
    x = w - wm_w - padding
    y = h - wm_h - padding
    
    # Blend onto BGR image with 18% opacity
    roi = img[y:y+wm_h, x:x+wm_w]
    blended = cv2.addWeighted(roi, 0.82, resized_wm, 0.18, 0)
    
    out_img = img.copy()
    out_img[y:y+wm_h, x:x+wm_w] = blended
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
        # Always re-process images from scratch to overwrite poorly processed files
        img = extract_pdf_page_as_image(filepath, dpi=150)
        clean_img = inpaint_entire_margins(img)
        watermarked = add_corner_watermark(clean_img, r"d:\Website\public\images\logo_emblem.png")
        cv2.imwrite(dest_path, watermarked, [int(cv2.IMWRITE_JPEG_QUALITY), 92])
            
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
