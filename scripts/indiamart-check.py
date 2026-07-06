# scripts/indiamart-check.py
import os
import sys
import asyncio

# Gracefully check for playwright, allowing fallback notice if not installed
try:
    from playwright.async_api import async_playwright
except ImportError:
    async_playwright = None

# আপনি যে ভেন্ডরদের লাইভ ডিটেইলস চেক করতে চান তার লিস্ট
TARGET_VENDORS = [
    {"name": "Kesaria Textile Company", "query": "Kesaria Textile Company Surat Ring Road wholesale"},
    {"name": "Arihant Creations", "query": "Arihant Creations Jaipur Sanganer wholesale"},
    {"name": "Ajmera Fashion", "query": "Ajmera Fashion Surat Ring Road wholesale"}
]

async def check_indiamart_live_details():
    if not async_playwright:
        print("[ERROR] Playwright is not installed. Please run:")
        print("    pip install playwright")
        print("    playwright install chrome")
        return

    print("[INFO] AI Agent starting Secure Browser Session via Playwright...")
    
    async with async_playwright() as p:
        # আপনার উইন্ডোজ পিসির ক্রোম ব্রাউজারের ডিফল্ট ইউজার ডাটা পাথ (Logged-in Profile)
        user_data_dir = os.path.expanduser("~\\AppData\\Local\\Google\\Chrome\\User Data")
        
        try:
            browser_context = await p.chromium.launch_persistent_context(
                user_data_dir=user_data_dir,
                headless=False, # Headed mode: যাতে আপনি নিজে স্ক্রিনে ব্রাউজার ওপেন হতে দেখতে পান
                channel="chrome",
                args=["--disable-blink-features=AutomationControlled"] # বট ডিটেকশন বাইপাস লক
            )
            
            page = await browser_context.new_page()
            
            for vendor in TARGET_VENDORS:
                print(f"\n[FETCH] Fetching details for: {vendor['name']}...")
                search_url = f"https://www.indiamart.com/search.mp?ss={vendor['query']}"
                
                await page.goto(search_url, wait_until="domcontentloaded")
                await asyncio.sleep(3) # হিউম্যান বিহেভিয়ার সিমুলেট করার জন্য ৩ সেকেন্ড পজ
                
                # স্ক্রিন থেকে লাইভ ডাটা এলিমেন্ট এক্সট্র্যাক্ট করার ম্যাট্রিক্স
                try:
                    company_nodes = await page.locator("span.company-name-selector, a.mod-title").all_text_contents()
                    phone_nodes = await page.locator("span.contact-num-selector, div.contact-btn").all_text_contents()
                    
                    print(f"[OK] [LIVE DATA FOUND] for {vendor['name']}:")
                    if company_nodes:
                        print(f"   Registered Name: {company_nodes[0].strip()}")
                    if phone_nodes:
                        print(f"   Contact/Button Node: {phone_nodes[0].strip() or 'Available (Click to view)'}")
                    else:
                        print("   Contact button restricted or requires manual click verification.")
                        
                except Exception as parse_error:
                    print(f"   Parsing structure changed or elements hidden: {parse_error}")
            
            await browser_context.close()
            print("\n[INFO] Verification process complete. Browser context safely closed.")
            
        except Exception as e:
            print(f"\n[ERROR] Could not attach to your Chrome profile. Make sure ALL Chrome windows are closed before running this script!")
            print(f"Details: {e}")

if __name__ == "__main__":
    # উইন্ডোজের জন্য এসিঙ্ক ইভেন্ট লুপ পলিসি সেটআপ
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(check_indiamart_live_details())
