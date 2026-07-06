# -*- coding: utf-8 -*-
# scripts/whatsapp_parser.py
import csv
import os
import re
import sys

def parse_whatsapp_payload(raw_text, image_paths, vendor_name="Jaipur_Vendor"):
    """
    Parses vendor's raw WhatsApp chat messages and appends formatted products to a central products.csv file.
    Calculates listing rates, extracts fabric specifications, and maps image attachments.
    """
    # 1. Extract base price/rate (e.g. Rate 695+gst, Rs 850, Price: 1200)
    rate_match = re.search(r'(?:Rate|Price|Rs\.?|INR)\s*(\d+)', raw_text, re.IGNORECASE)
    base_rate = float(rate_match.group(1)) if rate_match else 0.0
    
    # 2. Compute final listing price (5% GST + Margin adjustments)
    # Wholesale listing price is base rate * 1.05
    listing_price = round(base_rate * 1.05, 2)
    
    # 3. Detect fabric types and details from text copy
    fabric = "Pure Cotton 60x60"
    if "rayon" in raw_text.lower():
        fabric = "Rayon Premium"
    elif "georgette" in raw_text.lower():
        fabric = "Faux Georgette"
    elif "silk" in raw_text.lower():
        fabric = "Artsy Silk"
    elif "cotton" in raw_text.lower():
        fabric = "Pure Cotton"
        
    # 4. Extract Category (Anarkali, Plazo Set, Kurta, etc.)
    category = "Kurti Pant Dupatta Set"
    if "anarkali" in raw_text.lower():
        category = "Anarkali Set"
    elif "plazo" in raw_text.lower() or "palazzo" in raw_text.lower():
        category = "Plazo Suit Set"
    elif "short" in raw_text.lower() or "tunic" in raw_text.lower():
        category = "Short Kurti"
        
    # 5. Cloudinary storage paths simulation
    uploaded_images = [f"https://res.cloudinary.com/safakurtilab/image/upload/{os.path.basename(p)}" for p in image_paths]
    image_str = ";".join(uploaded_images)
    
    # 6. Ensure output directory exists
    csv_dir = "src/data"
    os.makedirs(csv_dir, exist_ok=True)
    csv_file = os.path.join(csv_dir, "products.csv")
    file_exists = os.path.isfile(csv_file)
    
    # Write details to CSV
    with open(csv_file, mode='a', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow(["Title", "Vendor", "Base_Rate", "Listing_Price", "Fabric", "Category", "Sizes", "Images", "Status"])
        
        product_title = f"{fabric} {category}"
        writer.writerow([
            product_title,
            vendor_name,
            base_rate,
            listing_price,
            fabric,
            category,
            "S;M;L;XL;XXL",
            image_str,
            "Draft"
        ])
    
    print(f"[OK] Successfully parsed and appended product to: {csv_file}")
    print(f"     Title: {fabric} {category}")
    print(f"     Vendor: {vendor_name} | Base Rate: Rs. {base_rate} | Listing: Rs. {listing_price}")

if __name__ == "__main__":
    # Allow running as CLI tool with input strings
    if len(sys.argv) > 2:
        # Args: text_file, image1,image2,..., [vendor_name]
        text_file = sys.argv[1]
        images = sys.argv[2].split(",")
        vendor = sys.argv[3] if len(sys.argv) > 3 else "Jaipur_Vendor"
        
        if os.path.isfile(text_file):
            with open(text_file, "r", encoding="utf-8") as tf:
                raw = tf.read()
            parse_whatsapp_payload(raw, images, vendor)
        else:
            print(f"[ERROR] Input file {text_file} not found.")
    else:
        # Dummy demonstration run
        demo_text = "Maaesa Creations premium cotton 60x60 kurti plazo set\nRate 695+gst"
        demo_images = ["k1_front.jpg", "k1_back.jpg"]
        print("[INFO] Running parser script demo...")
        parse_whatsapp_payload(demo_text, demo_images, "Maaesa_Creations")
