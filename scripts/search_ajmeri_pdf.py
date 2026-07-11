import os
import fitz

def search_text_in_pdfs(directory):
    print(f"Scanning directory: {directory}")
    matches = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.lower().endswith('.pdf'):
                path = os.path.join(root, file)
                try:
                    doc = fitz.open(path)
                    for i, page in enumerate(doc):
                        text = page.get_text()
                        if "ajmeri" in text.lower() or "ajmera" in text.lower():
                            matches.append((path, text.strip()))
                            break
                    doc.close()
                except Exception as e:
                    pass
    return matches

def main():
    sku_matches = search_text_in_pdfs(r"d:\Website\SKU")
    print(f"\nFound {len(sku_matches)} matches in d:\\Website\\SKU:")
    for path, text in sku_matches:
        print(f"  File: {os.path.basename(path)}")
        print(f"  Snippet:\n{text[:200]}\n")
        
    raw_matches = search_text_in_pdfs(r"d:\Website\raw_drive_images")
    print(f"\nFound {len(raw_matches)} matches in raw_drive_images:")
    for path, text in raw_matches:
        print(f"  File: {os.path.basename(path)}")

if __name__ == "__main__":
    main()
