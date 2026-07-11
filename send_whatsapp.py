import os
import json
import time
from playwright.sync_api import sync_playwright

STATUS_FILE = r"C:\Users\Administrator\.gemini\antigravity-ide\brain\01f4e04c-4cbd-4ec1-91d7-6f170fe64114\browser\outreach_status.json"
PITCH_FILE = r"D:\Website\pitch_message.txt"
PROFILE_DIR = r"D:\Website\.chrome_profile"

def read_status():
    if os.path.exists(STATUS_FILE):
        with open(STATUS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def write_status(data):
    with open(STATUS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def read_pitch():
    with open(PITCH_FILE, "r", encoding="utf-8") as f:
        return f.read()

def run():
    pitch_text = read_pitch()
    contacts = read_status()
    
    pending_contacts = [c for c in contacts if c.get("status") == "pending"]
    if not pending_contacts:
        print("No pending contacts found in outreach_status.json")
        return
        
    print(f"Found {len(pending_contacts)} pending contacts to process.")

    with sync_playwright() as p:
        print("Launching browser with persistent context...")
        browser_context = p.chromium.launch_persistent_context(
            PROFILE_DIR,
            headless=False,
            viewport={"width": 1280, "height": 800},
            args=["--disable-blink-features=AutomationControlled"]
        )
        
        page = browser_context.pages[0] if browser_context.pages else browser_context.new_page()
        
        print("Navigating to WhatsApp Web...")
        page.goto("https://web.whatsapp.com/")
        
        # Wait for login
        print("Waiting for WhatsApp Web to load. If you are not logged in, please scan the QR code now...")
        # Check if chat list or search bar is visible to confirm login
        login_timeout = 90
        start_time = time.time()
        logged_in = False
        
        while time.time() - start_time < login_timeout:
            try:
                # Locator for the search box or main side panel
                if page.locator("div[contenteditable='true']").first.is_visible() or page.locator("canvas").count() == 0:
                    # Double check if chat search list is visible
                    if page.locator("#pane-side").is_visible():
                        logged_in = True
                        break
            except Exception:
                pass
            time.sleep(2)
            
        if not logged_in:
            print("Login timeout. Please make sure you are logged in next time.")
            browser_context.close()
            return
            
        print("Successfully logged into WhatsApp Web!")
        time.sleep(3) # Let everything settle
        
        for contact in pending_contacts:
            name = contact["name"]
            phone = contact["phone"]
            print(f"\nProcessing: {name} ({phone})...")
            
            # Navigate to the send message URL
            send_url = f"https://web.whatsapp.com/send?phone={phone}"
            page.goto(send_url)
            
            # Wait for chat window to load
            print("Waiting for chat to load (12s)...")
            time.sleep(12)
            
            # Check for invalid number dialog
            invalid_popup = page.locator("text='Phone number shared via url is invalid'").is_visible() or \
                            page.locator("text='invalid'").is_visible()
            if invalid_popup:
                print(f"[INVALID] Phone number {phone} is invalid or has no WhatsApp.")
                contact["status"] = "skipped_invalid"
                write_status(contacts)
                continue
                
            # Check if we have message history
            # Look for elements with message bubbles
            has_history = False
            try:
                # Locator for sent/received message bubbles in the current active chat
                msg_locator = page.locator(".message-in, .message-out")
                msg_count = msg_locator.count()
                if msg_count > 0:
                    has_history = True
            except Exception as e:
                print(f"Error checking message history: {e}")
                
            if has_history:
                print(f"[SKIPPED] Existing chat history found with {name}. Skipping message to avoid duplicates.")
                contact["status"] = "skipped_existing"
                write_status(contacts)
                continue
                
            # No history - send the B2B pitch
            try:
                # Find the input field
                input_field = page.locator("div[contenteditable='true']").last
                if not input_field.is_visible():
                    print("[FAILED] Could not find chat input field.")
                    continue
                    
                input_field.click()
                time.sleep(1)
                
                # Clear text
                page.keyboard.press("Control+KeyA")
                page.keyboard.press("Backspace")
                time.sleep(0.5)
                
                # Type/Paste using browser execCommand to prevent unicode translation issues
                page.evaluate(
                    """([el, text]) => {
                        el.focus();
                        document.execCommand('insertText', false, text);
                    }""", 
                    [input_field.element_handle(), pitch_text]
                )
                time.sleep(1.5)
                
                # Press Enter to send
                page.keyboard.press("Enter")
                print(f"[SUCCESS] B2B pitch sent to {name} successfully!")
                time.sleep(3)
                
                contact["status"] = "sent"
                write_status(contacts)
                
            except Exception as e:
                print(f"[ERROR] Error sending to {name}: {e}")
                
        print("\nBatch outreach completed!")
        browser_context.close()

if __name__ == "__main__":
    run()
