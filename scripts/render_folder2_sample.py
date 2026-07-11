import fitz

def main():
    doc = fitz.open("d:\\Website\\scripts\\test_direct.pdf")
    page = doc[0]
    pix = page.get_pixmap(dpi=150)
    pix.save("d:\\Website\\scripts\\folder2_sample.png")
    doc.close()
    print("Rendered Folder 2 sample to folder2_sample.png")

if __name__ == "__main__":
    main()
