import os
import fitz  # PyMuPDF
import cv2
import numpy as np

def extract_pdf_page_as_image(pdf_path, image_path):
    print(f"Extracting page from: {pdf_path}")
    doc = fitz.open(pdf_path)
    page = doc[0]
    # Render page at 300 DPI for high resolution
    pix = page.get_pixmap(dpi=300)
    pix.save(image_path)
    doc.close()
    print(f"Saved raw image to: {image_path}")

def inpaint_corners(image_path, output_path):
    print(f"Inpainting image: {image_path}")
    img = cv2.imread(image_path)
    if img is None:
        print("Failed to read image")
        return
    
    h, w, c = img.shape
    mask = np.zeros((h, w), dtype=np.uint8)
    
    # Define corner ROIs (margins where text/watermarks usually reside)
    # Upper margin: top 12%
    # Lower margin: bottom 12%
    # Left margin: left 15%
    # Right margin: right 15%
    margin_top = int(h * 0.15)
    margin_bottom = int(h * 0.12)
    margin_left = int(w * 0.20)
    margin_right = int(w * 0.32) # wider to cover the top-right logo
    
    # We will build masks for the 4 corners:
    rois = [
        # (ymin, ymax, xmin, xmax)
        (0, margin_top, 0, margin_left),  # Top-Left
        (0, margin_top, w - margin_right, w),  # Top-Right
        (h - margin_bottom, h, 0, margin_left),  # Bottom-Left
        (h - margin_bottom, h, w - int(w * 0.20), w)  # Bottom-Right
    ]
    
    for ymin, ymax, xmin, xmax in rois:
        roi = img[ymin:ymax, xmin:xmax]
        # Convert to grayscale
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
        
        # Fill contours to cover solid shape interiors (like the red leaf body)
        contours, _ = cv2.findContours(roi_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for cnt in contours:
            if cv2.contourArea(cnt) > 10:
                cv2.drawContours(roi_mask, [cnt], -1, 255, -1)
        
        # Dilate final mask slightly for clean boundary blending
        dilate_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (7, 7))
        roi_mask = cv2.dilate(roi_mask, dilate_kernel, iterations=1)
        
        # Set ROI mask back
        mask[ymin:ymax, xmin:xmax] = roi_mask
        
    # Inpaint using Fast Marching Method
    # Telea method is great for thinner text/watermarks
    inpainted = cv2.inpaint(img, mask, inpaintRadius=7, flags=cv2.INPAINT_TELEA)
    
    cv2.imwrite(output_path, inpainted)
    print(f"Saved inpainted image to: {output_path}")

def main():
    pdf_path = r"d:\Website\SKU\RS=356.00 - BRN-101 (L,M,XL,XXL).pdf"
    if not os.path.exists(pdf_path):
        print(f"PDF not found at {pdf_path}")
        return
        
    raw_img_path = r"d:\Website\scripts\test_raw.png"
    out_img_path = r"d:\Website\scripts\test_inpainted.png"
    
    extract_pdf_page_as_image(pdf_path, raw_img_path)
    inpaint_corners(raw_img_path, out_img_path)

if __name__ == "__main__":
    main()
