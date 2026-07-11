import os
import fitz

def render_sample(pdf_path, out_img):
    if os.path.exists(pdf_path):
        doc = fitz.open(pdf_path)
        page = doc[0]
        pix = page.get_pixmap(dpi=150)
        pix.save(out_img)
        doc.close()
        print(f"Rendered {os.path.basename(pdf_path)} to {out_img}")
    else:
        print(f"Not found: {pdf_path}")

def main():
    # Folder 1 samples
    render_sample(
        r"d:\Website\raw_drive_images\folder1\TOP BOTTOM 2 PEICE\₹179_179511_PA_003-_A.pdf",
        r"d:\Website\scripts\folder1_tb2_sample.png"
    )
    
    # We will list files in folder 2 to find a few PDFs
    print("\nListing some files in raw_drive_images recursively:")
    count = 0
    for root, dirs, files in os.walk(r"d:\Website\raw_drive_images"):
        for file in files:
            if file.lower().endswith('.pdf'):
                path = os.path.join(root, file)
                rel_path = path.replace("d:\\Website\\raw_drive_images", "")
                print(f"Found: {rel_path}")
                count += 1
                if count >= 10:
                    break
        if count >= 10:
            break

if __name__ == "__main__":
    main()
