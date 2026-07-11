import os
import sys
import re
import gdown
import fitz  # PyMuPDF
import cv2
import numpy as np
from PIL import Image

FOLDER1_URL = "https://drive.google.com/drive/folders/1GckNhgjU2raC35QkLcNgrBnhC-PNl01j?usp=sharing"
FOLDER2_URL = "https://drive.google.com/drive/folders/1Jxbru84FG8Dr2K8q9-23gMIG79sbA3L_?usp=sharing"
OUTPUT_DIR = r"d:\Website\raw_drive_images"

def get_file_list(url):
    print(f"Retrieving file list from: {url}")
    try:
        files = gdown.download_folder(url=url, skip_download=True, quiet=True)
        return files
    except Exception as e:
        print(f"Error retrieving folder contents: {e}")
        return []

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(os.path.join(OUTPUT_DIR, "folder1"), exist_ok=True)
    os.makedirs(os.path.join(OUTPUT_DIR, "folder2"), exist_ok=True)

    print("--- FOLDER 1 FILES ---")
    files1 = get_file_list(FOLDER1_URL)
    print(f"Total files in Folder 1: {len(files1)}")
    
    print("\n--- FOLDER 2 FILES ---")
    files2 = get_file_list(FOLDER2_URL)
    print(f"Total files in Folder 2: {len(files2)}")

    all_files = []
    for f in files1:
        all_files.append((1, f))
    for f in files2:
        all_files.append((2, f))

    # Extract all unique folder paths
    folders1 = set()
    for f in files1:
        parts = f.path.split(os.sep)
        if len(parts) > 1:
            folders1.add(parts[0])
            
    folders2 = set()
    for f in files2:
        parts = f.path.split(os.sep)
        if len(parts) > 1:
            folders2.add(parts[0])
            
    print("\n--- Folder 1 Subdirectories ---")
    for folder in sorted(folders1):
        print(f"  {folder}")
        
    print("\n--- Folder 2 Subdirectories ---")
    for folder in sorted(folders2):
        print(f"  {folder}")

    # Search files again with lower-case check for "ajmeri"
    ajmeri_files = []
    for num, files in [(1, files1), (2, files2)]:
        for f in files:
            if "ajmeri" in f.path.lower() or "ajmeri" in f.local_path.lower():
                ajmeri_files.append((num, f.path))
                
    print(f"\nExact Ajmeri match files count: {len(ajmeri_files)}")
    for num, path in ajmeri_files:
        print(f"  Folder {num}: {path}")

if __name__ == "__main__":
    main()
