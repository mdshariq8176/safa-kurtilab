# -*- coding: utf-8 -*-
# scripts/whatsapp-outreach.py
import os
import sys
import asyncio
import urllib.parse

try:
    from playwright.async_api import async_playwright
except ImportError:
    async_playwright = None

# List of 10 new verified Kurti manufacturers and suppliers
TARGET_VENDORS = [
    {"name": "7 Season's", "phone": "917621889900", "hub": "Surat", "specialty": "high-end designer flared & cotton kurtis"},
    {"name": "Kasheesh Trendz", "phone": "919726008828", "hub": "Surat", "specialty": "double layer kurtis & heavy handwork sets"},
    {"name": "Vardan Designer", "phone": "917984516699", "hub": "Surat", "specialty": "rayon & silk fancy boutique kurtis"},
    {"name": "Rajnandini Fashion", "phone": "918141521000", "hub": "Surat", "specialty": "daily cotton printed sets & straight kurtis"},
    {"name": "Jaipur Kurti House", "phone": "917942824456", "hub": "Jaipur", "specialty": "traditional Jaipuri & block printed kurti sets"},
    {"name": "Tathastu (The Ethnic World)", "phone": "918866591335", "hub": "Surat", "specialty": "premium gota-patti & Anarkali catalogs"},
    {"name": "Shree Karni Fashion", "phone": "918047516883", "hub": "Surat", "specialty": "georgette, rayon, & designer printed kurtis"},
    {"name": "Shree Balaji Impex", "phone": "917942722049", "hub": "Jaipur", "specialty": "cotton kurtis, palazzo sets & ethnic bottoms"},
    {"name": "Ambica Fashion", "phone": "918047619644", "hub": "Surat", "specialty": "embroidered kurtis & bulk boutique specials"},
    {"name": "Bijalee Kurtis", "phone": "918071269350", "hub": "Ahmedabad", "specialty": "designer cotton & festive kurti collections"}
]

def get_production_ready_pitch(vendor):
    """
    Bilingual (English + Hindi) professional wholesale pitch layout.
    Incorporate West Bengal registered address, primary WhatsApp and alternate WhatsApp contact details.
    """
    bilingual_pitch = (
        f"Hello,\n"
        f"I am MD SHARIQ, Founder of 'Safa Kurtilab'. We operate a registered B2B Wholesale & Order Forwarding Portal. "
        f"We are highly interested in listing your {vendor['hub']} hub's {vendor['specialty']} collections on our platform to generate consistent bulk volume orders.\n\n"
        f"Our operations are strictly tailored for 'Set-to-Set' (S, M, L, XL, XXL Bundle) distribution with immediate prepaid factory clearing.\n\n"
        f"-----------------------------------------\n"
        f"नमस्ते,\n"
        f"मैं MD SHARIQ बोल रहा हूँ 'Safa Kurtilab' से। हमारा एक रजिस्टर्ड B2B Wholesale & Order Forwarding Portal है। "
        f"हम आपके {vendor['hub']} हब के {vendor['specialty']} कलेक्शन को हमारे प्लेटफॉर्म पर लिस्ट करके डायरेक्ट बल्क ऑर्डर्स जेनरेट करना चाहते हैं।\n\n"
        f"हमारा मॉडल पूरी तरह से 'Strict Set-to-Set' (S, M, L, XL, XXL Bundle) और डायरेक्ट फैक्ट्री-टू-कस्टमर शिपिंग पर काम करता है।\n\n"
        f"-----------------------------------------\n"
        f"BUSINESS CREDENTIALS / व्यावसायिक विवरण:\n"
        f"• Company Name: Safa Kurtilab\n"
        f"• Business Type: B2B Wholesale / Garment Distribution\n"
        f"• Registered Address: Vill-Hareknagar Mollabari, P.O. Hareknagar, P.S. Beldanga, District: Murshidabad, West Bengal - 742133\n"
        f"• Operational Base: Kolkata & Chennai\n"
        f"• Order Modality: Strict Set-to-Set Bundles / Immediate Prepaid Wire Transfer\n\n"
        f"-----------------------------------------\n"
        f"Kindly share a Google Drive link containing your combined Excel/CSV catalog sheet (with product titles, fabrics, base rates, and sizes) along with folders for HD product images. This will help us import your collections swiftly into our automated B2B system.\n\n"
        f"कृपया एक गूगल ड्राइव लिंक शेयर करें जिसमें आपकी कंबाइंड एक्सेल/सीएसवी कैटलॉग शीट (प्रोडक्ट टाइटल, फैब्रिक, बेस रेट और साइज के साथ) और एचडी प्रोडक्ट इमेज फ़ोल्डर हों। इससे हमें आपके कलेक्शन को हमारे ऑटोमेटेड सिस्टम में तुरंत इंपोर्ट करने में मदद मिलेगी।\n\n"
        f"Alternate WhatsApp Contact: +91-9851483596\n\n"
        f"Best Regards / धन्यवाद,\n"
        f"MD SHARIQ\n"
        f"Founder, Safa Kurtilab\n"
        f"Primary WhatsApp: +91-7003518485"
    )
    return bilingual_pitch

async def run_whatsapp_outreach():
    if not async_playwright:
        print("[ERROR] Playwright is not installed. Run 'pip install playwright' and 'playwright install chrome'.")
        return

    print("[INFO] Initializing Secure Browser Session attaching to Chrome Profile...")
    user_data_dir = os.path.expanduser("~\\AppData\\Local\\Google\\Chrome\\User Data")
    
    try:
        browser_context = await p.chromium.launch_persistent_context(
            user_data_dir=user_data_dir,
            headless=False,
            channel="chrome",
            args=["--disable-blink-features=AutomationControlled"]
        )
        page = await browser_context.new_page()
        
        # Load WhatsApp Web and wait for the user to be logged in
        print("[INFO] Loading WhatsApp Web...")
        await page.goto("https://web.whatsapp.com/")
        print("[INFO] Please verify you are logged in on the browser. Waiting 15 seconds for UI elements...")
        await asyncio.sleep(15)
        
        for idx, vendor in enumerate(TARGET_VENDORS, 1):
            pitch = get_production_ready_pitch(vendor)
            # Explicitly encode to utf-8 before quoting to prevent Windows cp1252 corruption
            encoded_pitch = urllib.parse.quote(pitch.encode('utf-8'))
            send_url = f"https://web.whatsapp.com/send?phone={vendor['phone']}&text={encoded_pitch}"
            
            print(f"\n[{idx}/10] Redirecting to chat with: {vendor['name']} ({vendor['phone']})...")
            await page.goto(send_url)
            
            # Wait for chat input load (up to 15s)
            await asyncio.sleep(8)
            
            try:
                # Select the send button or hit Enter
                send_button = page.locator("span[data-icon='send']")
                if await send_button.count() > 0:
                    await send_button.click()
                    print(f"[OK] Message successfully queued for: {vendor['name']}")
                else:
                    await page.keyboard.press("Enter")
                    print(f"[OK] Keyboard Enter triggered for: {vendor['name']}")
            except Exception as send_err:
                print(f"[ERROR] Failed to send message to {vendor['name']}: {send_err}")
                
            await asyncio.sleep(4) # Delay between messages to avoid spam trigger

        await browser_context.close()
        print("\n[INFO] Outreach campaign complete.")
        
    except Exception as e:
        print(f"[ERROR] Could not attach browser context: {e}")
        print("[INFO] Make sure Chrome is closed before running the script.")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "print":
        # Print first vendor's pitch encoded in utf-8 directly to terminal output bytes
        sys.stdout.buffer.write(get_production_ready_pitch(TARGET_VENDORS[0]).encode('utf-8'))
        sys.stdout.write('\n')
    else:
        if sys.platform == 'win32':
            asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
        
        # Helper call
        async def main_runner():
            async with async_playwright() as p:
                await run_whatsapp_outreach()
        
        # Async run if playwright is imported
        if async_playwright:
            asyncio.run(main_runner())
        else:
            print("[ERROR] Playwright module missing. Install it to run automation.")
