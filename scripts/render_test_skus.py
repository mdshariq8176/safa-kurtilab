import fitz
import os

def render(pdf_name, out_img):
    path = os.path.join(r"d:\Website\SKU", pdf_name)
    if os.path.exists(path):
        doc = fitz.open(path)
        page = doc[0]
        pix = page.get_pixmap(dpi=150)
        pix.save(out_img)
        doc.close()
        print(f"Rendered {pdf_name} to {out_img}")
    else:
        print(f"Not found: {pdf_name}")

def main():
    render("RS=356.00 - BRN-101 (L,M,XL,XXL).pdf", r"d:\Website\scripts\brn101_raw.png")
    render("RS=189.00 - AAC-KARISHMA (L,M,S,XL,XXL).pdf", r"d:\Website\scripts\aac_karishma_raw.png")
    render("RS=388.00 - LSY-4739 (L,M,S,XL,XXL).pdf", r"d:\Website\scripts\lsy4739_raw.png")
    render("RS=130.00 - NAG-11001 (L,M,XL,XXL).pdf", r"d:\Website\scripts\nag11001_raw.png")

if __name__ == "__main__":
    main()
