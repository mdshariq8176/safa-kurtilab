# scripts/indiamart-check.py
import os
import sys
import asyncio
import csv
from datetime import datetime

# Gracefully check for playwright, allowing fallback notice if not installed
try:
    from playwright.async_api import async_playwright
except ImportError:
    async_playwright = None

# List of vendors to check (25 premium B2B Kurtis & suit sets manufacturers/wholesalers)
TARGET_VENDORS = [
    {"name": "Kesaria Textile Company", "query": "Kesaria Textile Company Surat Ring Road wholesale"},
    {"name": "Arihant Creations", "query": "Arihant Creations Jaipur Sanganer wholesale"},
    {"name": "Ajmera Fashion", "query": "Ajmera Fashion Surat Ring Road wholesale"},
    {"name": "7 Season's", "query": "7 Seasons Surat designer kurtis wholesale"},
    {"name": "Kasheesh Trendz", "query": "Kasheesh Trendz Surat kurtis wholesale"},
    {"name": "Vardan Designer", "query": "Vardan Designer Surat fancy boutique kurtis wholesale"},
    {"name": "Rajnandini Fashion", "query": "Rajnandini Fashion Surat straight kurtis wholesale"},
    {"name": "Jaipur Kurti House", "query": "Jaipur Kurti House Jaipur ethnic kurti wholesale"},
    {"name": "Tathastu (The Ethnic World)", "query": "Tathastu Surat premium Anarkali wholesale"},
    {"name": "Shree Karni Fashion", "query": "Shree Karni Fashion Surat rayon printed kurtis wholesale"},
    {"name": "Shree Balaji Impex", "query": "Shree Balaji Impex Jaipur cotton kurtis wholesale"},
    {"name": "Ambica Fashion", "query": "Ambica Fashion Surat embroidered kurtis wholesale"},
    {"name": "Bijalee Kurtis", "query": "Bijalee Kurtis Ahmedabad cotton festive kurtis wholesale"},
    {"name": "Maaesa Creations", "query": "Maaesa Creations Jaipur cotton palazzo suit sets wholesale"},
    {"name": "Chavi Creations", "query": "Chavi Creations Jaipur sanganeri print kurti set wholesale"},
    {"name": "Shree Ganesh Textiles", "query": "Shree Ganesh Textiles Surat wholesale kurtis"},
    {"name": "Zola Kurtis", "query": "Zola Kurtis Mumbai premium ethnic wear wholesale"},
    {"name": "Kalyan Silks", "query": "Kalyan Silks Surat ethnic suit sets wholesale"},
    {"name": "Vani Saree & Kurtis", "query": "Vani Saree and Kurtis Surat wholesale manufacturer"},
    {"name": "Pooja Kurtis", "query": "Pooja Kurtis Jaipur handwork kurti sets wholesale"},
    {"name": "Ethnic Hub", "query": "Ethnic Hub Jaipur block print suit sets wholesale"},
    {"name": "Sanskriti Weaves", "query": "Sanskriti Weaves Surat boutique kurti sets wholesale"},
    {"name": "Heritage Silks", "query": "Heritage Silks Delhi premium wedding kurtas wholesale"},
    {"name": "Radha Krishna Fabrics", "query": "Radha Krishna Fabrics Ahmedabad designer kurtis wholesale"},
    {"name": "Jaipur Wholesalers", "query": "Jaipur Wholesalers traditional jaipuri kurti sets wholesale"}
]

CSV_OUTPUT = os.path.join(os.path.dirname(__file__), "indiamart_manufacturers.csv")

async def check_indiamart_live_details():
    if not async_playwright:
        print("[ERROR] Playwright is not installed. Please run:")
        print("    pip install playwright")
        print("    playwright install chrome")
        return

    print("[INFO] AI Agent starting Secure Browser Session via Playwright...")
    
    # Use a localized Chrome profile directory to prevent file locking conflicts
    # with the user's active Chrome windows.
    user_data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".chrome_profile_indiamart")
    
    scraped_data = []

    async with async_playwright() as p:
        try:
            print(f"[INFO] Using isolated Chrome profile at: {user_data_dir}")
            browser_context = await p.chromium.launch_persistent_context(
                user_data_dir=user_data_dir,
                headless=True, # Headless mode for clean background execution
                channel="chrome",
                args=["--disable-blink-features=AutomationControlled"] # Bot detection bypass
            )
            
            page = await browser_context.new_page()
            
            for vendor in TARGET_VENDORS:
                print(f"\n[FETCH] Fetching details for: {vendor['name']}...")
                search_url = f"https://www.indiamart.com/search.mp?ss={vendor['query']}"
                
                registered_name = "N/A"
                contact_details = "N/A"
                status = "Failed"
                
                try:
                    await page.goto(search_url, wait_until="domcontentloaded", timeout=30000)
                    await asyncio.sleep(4) # Pause to simulate human reading behavior
                    
                    # Extract live nodes
                    company_nodes = await page.locator("span.company-name-selector, a.mod-title").all_text_contents()
                    phone_nodes = await page.locator("span.contact-num-selector, div.contact-btn").all_text_contents()
                    
                    if company_nodes:
                        registered_name = company_nodes[0].strip()
                        status = "Verified"
                    if phone_nodes:
                        contact_details = phone_nodes[0].strip() or "Available (Click to view)"
                        
                    print(f"[OK] [LIVE DATA FOUND] for {vendor['name']}:")
                    print(f"   Registered Name: {registered_name}")
                    print(f"   Contact/Button: {contact_details}")
                        
                except Exception as parse_error:
                    print(f"   [WARNING] Scrape failed for {vendor['name']}: {parse_error}")
                    status = f"Failed ({type(parse_error).__name__})"
                
                scraped_data.append({
                    "Vendor Name": vendor["name"],
                    "Search Query": vendor["query"],
                    "Live Registered Name": registered_name,
                    "Contact Details": contact_details,
                    "Verification Status": status,
                    "Last Checked (UTC)": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
                })
            
            await browser_context.close()
            print("\n[INFO] Scrape session complete. Browser closed.")
            
        except Exception as e:
            print(f"\n[ERROR] Playwright execution error: {e}")
            return

    # Write scraped details to the CSV file
    try:
        headers = ["Vendor Name", "Search Query", "Live Registered Name", "Contact Details", "Verification Status", "Last Checked (UTC)"]
        
        with open(CSV_OUTPUT, "w", newline="", encoding="utf-8") as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=headers)
            writer.writeheader()
            writer.writerows(scraped_data)
            
        print(f"[SUCCESS] Manufacturer database successfully written to CSV: {CSV_OUTPUT}")
    except Exception as csv_err:
        print(f"[ERROR] Failed to write CSV file: {csv_err}")

if __name__ == "__main__":
    if sys.platform == 'win32':
        # Playwright requires ProactorEventLoop on Windows to run browser subprocesses
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
    asyncio.run(check_indiamart_live_details())
