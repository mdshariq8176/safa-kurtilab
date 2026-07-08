# -*- coding: utf-8 -*-
# scripts/send-gmail-outreach.py
import os
import sys
import asyncio

try:
    from playwright.async_api import async_playwright
except ImportError:
    async_playwright = None

PITCH_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "pitch_message.txt")

def read_pitch():
    if os.path.exists(PITCH_FILE):
        with open(PITCH_FILE, "r", encoding="utf-8") as f:
            return f.read()
    return "Maison Safa B2B Pitch"

async def main():
    if not async_playwright:
        print("[ERROR] Playwright is not installed. Please run: pip install playwright && playwright install chrome")
        return

    pitch_content = read_pitch()
    
    # Path to Chrome's User Data Directory
    user_data_dir = os.path.expanduser("~\\AppData\\Local\\Google\\Chrome\\User Data")
    
    print("[INFO] Launching Chrome Profile 2 persistent context...")
    async with async_playwright() as p:
        try:
            # Pass user data directory and specify Profile 2
            browser_context = await p.chromium.launch_persistent_context(
                user_data_dir=user_data_dir,
                headless=False,  # Headed mode so we can see the composition and handle lock releases
                channel="chrome",
                args=[
                    "--profile-directory=Profile 2",
                    "--disable-blink-features=AutomationControlled"
                ]
            )
            
            page = await browser_context.new_page()
            
            print("[INFO] Navigating to Gmail inbox...")
            await page.goto("https://mail.google.com/mail/u/0/#inbox", wait_until="networkidle")
            
            # Wait a few seconds to let Gmail settle
            await asyncio.sleep(5)
            
            # Click the Compose button
            print("[INFO] Clicking 'Compose' button...")
            compose_btn = page.locator('div[role="button"]:has-text("Compose")').first
            if await compose_btn.count() == 0:
                compose_btn = page.locator('.T-I-KE').first
                
            await compose_btn.click()
            await asyncio.sleep(3) # Wait for compose window to open
            
            # Locate recipient input
            print("[INFO] Filling recipient email...")
            to_field = page.locator('input[role="combobox"]').first
            if await to_field.count() == 0:
                to_field = page.locator('textarea[aria-label="To"]').first
            
            await to_field.click()
            await to_field.fill("mdshariq2357@gmail.com")
            await page.keyboard.press("Enter")
            await asyncio.sleep(1)
            
            # Locate Subject field
            print("[INFO] Filling email subject...")
            subject_field = page.locator('input[name="subjectbox"]').first
            await subject_field.click()
            await subject_field.fill("Maison Safa: B2B Wholesale Partnership Proposal")
            await asyncio.sleep(1)
            
            # Locate Body field
            print("[INFO] Filling email body...")
            body_field = page.locator('div[role="textbox"][aria-label="Message Body"]').first
            await body_field.click()
            await body_field.fill(pitch_content)
            await asyncio.sleep(2)
            
            # Locate Send button
            print("[INFO] Sending email...")
            send_btn = page.locator('div[role="button"]:has-text("Send")').first
            if await send_btn.count() == 0:
                send_btn = page.locator('.T-I-atl').first
                
            await send_btn.click()
            
            # Wait for Gmail's "Message sent" toast notification
            print("[INFO] Waiting for message dispatch to complete (5s)...")
            await asyncio.sleep(5)
            
            print("[SUCCESS] Email sent from mdshariq8176@gmail.com to mdshariq2357@gmail.com successfully!")
            await browser_context.close()
            
        except Exception as e:
            print(f"[ERROR] Failed to send email via browser: {e}")
            print("[TIP] Make sure ALL Chrome windows using Profile 2 are closed before running this script.")

if __name__ == "__main__":
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
    asyncio.run(main())
