import os
import re
import json
import glob
import fitz
import cv2
import numpy as np
import requests
import gdown

SKU_DIR = r"d:\Website\SKU"
SKU_OUT_DIR = r"d:\Website\public\images\sku"
CATALOG_OUT_DIR = r"d:\Website\public\images\catalog"
CACHE_FILE = r"d:\Website\scripts\drive_files_list.json"

FOLDER1_URL = "https://drive.google.com/drive/folders/1GckNhgjU2raC35QkLcNgrBnhC-PNl01j?usp=sharing"
FOLDER2_URL = "https://drive.google.com/drive/folders/1Jxbru84FG8Dr2K8q9-23gMIG79sbA3L_?usp=sharing"

def extract_pdf_page_as_image(pdf_path, dpi=300):
    """Extracts first page of PDF at specified DPI as a BGR numpy array."""
    doc = fitz.open(pdf_path)
    page = doc[0]
    pix = page.get_pixmap(dpi=dpi)
    img_data = np.frombuffer(pix.samples, dtype=np.uint8).reshape((pix.h, pix.w, 3))
    # Convert RGB to BGR for OpenCV
    img = cv2.cvtColor(img_data, cv2.COLOR_RGB2BGR)
    doc.close()
    return img

def inpaint_corners(img, brand):
    """
    Applies targeted, brand-aware inpainting to only remove corner logos/text.
    Does not crop the image under any circumstances.
    """
    h, w, _ = img.shape
    mask = np.zeros((h, w), dtype=np.uint8)
    
    # Configure ROIs depending on brand/format
    rois = []
    if brand == "ajmera_left":
        # BRN-, AAC-, LSY- prefixes: logo & size chart in Top-Left
        rois.append((0, int(h * 0.35), 0, int(w * 0.28)))
    elif brand == "ajmera_right":
        # NAG- prefix: logo in Top-Right
        rois.append((0, int(h * 0.15), w - int(w * 0.25), w))
    elif brand == "kesaria":
        # Kesaria catalog images: logo in Top-Right, page code in Bottom-Right
        rois.append((0, int(h * 0.15), w - int(w * 0.32), w))
        rois.append((h - int(h * 0.12), h, w - int(w * 0.20), w))
    else:
        # Default fallback: check top corners
        rois.append((0, int(h * 0.15), 0, int(w * 0.25)))
        rois.append((0, int(h * 0.15), w - int(w * 0.25), w))
        rois.append((h - int(h * 0.12), h, w - int(w * 0.20), w))

    for ymin, ymax, xmin, xmax in rois:
        roi = img[ymin:ymax, xmin:xmax]
        gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
        
        # 1. Edge detection (captures text/logo outlines of any color)
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
        
        # Dilate final mask slightly for clean boundary blending
        dilate_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (7, 7))
        roi_mask = cv2.dilate(roi_mask, dilate_kernel, iterations=1)
        
        # Set ROI mask back into full mask
        mask[ymin:ymax, xmin:xmax] = roi_mask
        
    # Inpaint using Fast Marching Method
    inpainted = cv2.inpaint(img, mask, 3, cv2.INPAINT_TELEA)
    return inpainted

def process_local_skus():
    """Finds all SKU PDFs, processes them with zero-cropping inpainting, and saves as JPG."""
    print("\n=== PROCESSING LOCAL SKU IMAGES (AJMERI) ===")
    os.makedirs(SKU_OUT_DIR, exist_ok=True)
    
    # List of all PDFs in SKU directory
    pdf_files = glob.glob(os.path.join(SKU_DIR, "*.pdf"))
    print(f"Found {len(pdf_files)} PDF files in SKU folder.")
    
    # We will load metadata to match SKU codes
    try:
        with open(r"d:\Website\src\data\sku_metadata.json", "r", encoding="utf-8") as f:
            sku_metadata = json.load(f)
    except Exception as e:
        print(f"Error loading SKU metadata: {e}")
        return

    processed_count = 0
    for item in sku_metadata:
        code = item.get("code")
        # Find matching PDF file
        matching_pdf = None
        for pdf in pdf_files:
            if code in os.path.basename(pdf):
                matching_pdf = pdf
                break
                
        if not matching_pdf:
            print(f"Warning: No matching PDF found for SKU code: {code}")
            continue
            
        print(f"\nProcessing SKU: {code}")
        print(f"  Source: {matching_pdf}")
        
        # Determine brand
        if code.startswith("NAG-"):
            brand = "ajmera_right"
        elif code.startswith("BRN-") or code.startswith("AAC-") or code.startswith("LSY-"):
            brand = "ajmera_left"
        else:
            brand = "default"
            
        dest_jpg = os.path.join(SKU_OUT_DIR, f"{code}.jpg")
        
        try:
            # Extract PDF page at 300 DPI
            img = extract_pdf_page_as_image(matching_pdf, dpi=300)
            orig_h, orig_w = img.shape[:2]
            print(f"  Original resolution: {orig_w}x{orig_h}")
            
            # Inpaint without cropping
            inpainted = inpaint_corners(img, brand)
            
            # Save as JPG
            cv2.imwrite(dest_jpg, inpainted, [int(cv2.IMWRITE_JPEG_QUALITY), 95])
            print(f"  Saved uncropped clean image: {dest_jpg}")
            processed_count += 1
        except Exception as e:
            print(f"  Error processing SKU {code}: {e}")
            
    print(f"\nSuccessfully processed {processed_count}/{len(sku_metadata)} local SKUs.")

def get_drive_files_list():
    """Uses gdown to index drive folders, caching results in a JSON file to prevent rate limits."""
    if os.path.exists(CACHE_FILE):
        print(f"\nLoading Drive file list from cache: {CACHE_FILE}")
        with open(CACHE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
            
    print("\nRetrieving file listing from Google Drive folders (this may take a minute)...")
    files_list = []
    
    # Index Folder 1
    try:
        files1 = gdown.download_folder(url=FOLDER1_URL, skip_download=True, quiet=True)
        print(f"Folder 1 retrieved: {len(files1)} files")
        for f in files1:
            if f.path.lower().endswith(".pdf"):
                files_list.append({"folder": 1, "path": f.path, "id": f.id})
    except Exception as e:
        print(f"Error retrieving Folder 1 list: {e}")
        
    # Index Folder 2
    try:
        files2 = gdown.download_folder(url=FOLDER2_URL, skip_download=True, quiet=True)
        print(f"Folder 2 retrieved: {len(files2)} files")
        for f in files2:
            if f.path.lower().endswith(".pdf"):
                files_list.append({"folder": 2, "path": f.path, "id": f.id})
    except Exception as e:
        print(f"Error retrieving Folder 2 list: {e}")
        
    # Save cache
    with open(CACHE_FILE, "w", encoding="utf-8") as f:
        json.dump(files_list, f, indent=4)
    print(f"Cached {len(files_list)} PDF files metadata in {CACHE_FILE}")
    return files_list

def download_file_direct(file_id, dest_path):
    """Downloads a file directly from Google Drive using HTTP requests, bypassing gdown API restrictions."""
    url = f"https://drive.google.com/uc?export=download&id={file_id}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    response = requests.get(url, headers=headers, allow_redirects=True, timeout=30)
    if response.status_code == 200 and len(response.content) > 1000:
        with open(dest_path, "wb") as f:
            f.write(response.content)
        return True
    return False

def process_drive_catalog(limit=None):
    """Downloads and processes files from the Google Drive folders list."""
    print("\n=== PROCESSING GOOGLE DRIVE CATALOG IMAGES ===")
    os.makedirs(CATALOG_OUT_DIR, exist_ok=True)
    
    files_to_process = get_drive_files_list()
    print(f"Total files available to process: {len(files_to_process)}")
    
    if limit:
        print(f"Limiting execution to first {limit} files.")
        files_to_process = files_to_process[:limit]
        
    success_count = 0
    skipped_count = 0
    
    for idx, item in enumerate(files_to_process):
        folder_num = item["folder"]
        drive_path = item["path"]
        file_id = item["id"]
        
        # Determine output filename (flatten directories to simple clean file names)
        # e.g., "CORD SET/₹1049_175444_D.N-_8013.pdf" -> "folder1_CORD_SET_1049_175444_D.N-_8013.jpg"
        clean_path = drive_path.replace(os.sep, "_").replace("/", "_").replace(" ", "_")
        clean_path = re.sub(r"[^\w\.-]", "", clean_path) # Remove special characters like ₹
        dest_jpg = os.path.join(CATALOG_OUT_DIR, clean_path.rsplit(".", 1)[0] + ".jpg")
        
        # Check if already processed
        if os.path.exists(dest_jpg):
            skipped_count += 1
            continue
            
        print(f"\n[{idx+1}/{len(files_to_process)}] Processing: {drive_path}")
        
        # Download PDF locally as temp
        temp_pdf = f"d:\\Website\\scripts\\temp_{file_id}.pdf"
        try:
            print("  Downloading...")
            download_success = download_file_direct(file_id, temp_pdf)
            if not download_success:
                print("  Failed to download file via direct HTTP link.")
                continue
                
            print("  Extracting page...")
            img = extract_pdf_page_as_image(temp_pdf, dpi=300)
            orig_h, orig_w = img.shape[:2]
            print(f"  Dimensions: {orig_w}x{orig_h}")
            
            # Both Folder 1 and Folder 2 images are Kesaria format
            print("  Inpainting Kesaria watermarks (Top-Right logo, Bottom-Right code)...")
            inpainted = inpaint_corners(img, brand="kesaria")
            
            # Save final image
            cv2.imwrite(dest_jpg, inpainted, [int(cv2.IMWRITE_JPEG_QUALITY), 95])
            print(f"  Successfully processed and saved: {dest_jpg}")
            success_count += 1
            
        except Exception as e:
            print(f"  Error processing file: {e}")
        finally:
            # Clean up temp file
            if os.path.exists(temp_pdf):
                try:
                    os.remove(temp_pdf)
                except:
                    pass
                    
    print(f"\nDrive Catalog Processing Complete.")
    print(f"  Successfully processed: {success_count}")
    print(f"  Skipped (already exists): {skipped_count}")
    print(f"  Failed: {len(files_to_process) - success_count - skipped_count}")

def main():
    # Step 1: Fix all local Ajmeri/NAG SKUs first (restoring full frame, zero cropping)
    process_local_skus()
    
    # Step 2: Download and process catalog from Drive folders
    # Let's start with a batch limit (e.g. 50 files) to demonstrate functionality quickly
    # The script can be run again without a limit to download more.
    process_drive_catalog(limit=50)

if __name__ == "__main__":
    main()
