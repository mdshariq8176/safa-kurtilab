import os
import gdown
import fitz

FOLDER2_URL = "https://drive.google.com/drive/folders/1Jxbru84FG8Dr2K8q9-23gMIG79sbA3L_?usp=sharing"

def main():
    print("Retrieving Folder 2 list...")
    files = gdown.download_folder(url=FOLDER2_URL, skip_download=True, quiet=True)
    print(f"Total files in Folder 2: {len(files)}")
    
    # Let's print the first 10 files and their paths
    print("\nFirst 10 files:")
    samples = []
    for i, f in enumerate(files):
        if i < 15:
            print(f"  {i}: {f.path} (ID: {f.id})")
        # Let's select a few representative PDFs from different subfolders:
        # e.g., one from KAFTAN STYLE, one from SHORT KURTI, one from SINGLE KURTI
        if "kaftan" in f.path.lower() and len(samples) == 0:
            samples.append(f)
        elif "short kurti" in f.path.lower() and len(samples) == 1:
            samples.append(f)
        elif "single kurti" in f.path.lower() and len(samples) == 2:
            samples.append(f)
            
    # If we didn't find specific ones, just take the first 3 PDFs
    if len(samples) < 3:
        samples = [f for f in files if f.path.lower().endswith('.pdf')][:3]
        
    print("\nSelected samples for downloading:")
    for f in samples:
        print(f"  Path: {f.path}, ID: {f.id}")
        
    os.makedirs(r"d:\Website\scripts\samples", exist_ok=True)
    
    for idx, f in enumerate(samples):
        local_pdf = f"d:\\Website\\scripts\\samples\\sample_{idx}.pdf"
        local_png = f"d:\\Website\\scripts\\samples\\sample_{idx}.png"
        print(f"\nDownloading sample {idx} from ID {f.id}...")
        try:
            gdown.download(id=f.id, output=local_pdf, quiet=True)
            if os.path.exists(local_pdf):
                doc = fitz.open(local_pdf)
                page = doc[0]
                pix = page.get_pixmap(dpi=150)
                pix.save(local_png)
                doc.close()
                print(f"Saved rendered sample to {local_png}")
            else:
                print(f"Failed to download PDF {f.path}")
        except Exception as e:
            print(f"Error processing sample {f.path}: {e}")

if __name__ == "__main__":
    main()
