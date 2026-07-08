# -*- coding: utf-8 -*-
# scripts/email-outreach.py
# Google App Name: Python Email Script
import os
import re
import time
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Load configuration variables from .env manually to avoid python-dotenv dependency
def load_env_file():
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" in line:
                    key, val = line.split("=", 1)
                    key = key.strip()
                    val = val.strip().strip('"').strip("'")
                    os.environ[key] = val

load_env_file()

# Read SMTP Credentials from environment (e.g. Gmail)
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "465")) # 465 for SSL, 587 for TLS
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SENDER_EMAIL = os.getenv("SENDER_EMAIL", SMTP_USER)

PITCH_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "pitch_message.txt")

def read_pitch():
    if os.path.exists(PITCH_FILE):
        with open(PITCH_FILE, "r", encoding="utf-8") as f:
            return f.read()
    else:
        # Fallback inline pitch in case pitch_message.txt is missing
        return (
            "Hello Sir,\n\n"
            "I am MD SHARIQ, Founder of 'Safa Kurtilab'. We operate a registered B2B Wholesale & Order Forwarding Portal.\n"
            "We are highly interested in listing your collections on our platform to generate consistent bulk volume orders.\n\n"
            "Best Regards,\n"
            "MD SHARIQ\n"
            "Founder, Safa Kurtilab"
        )

def is_valid_email(email):
    """Simple email validation check."""
    email_regex = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return re.match(email_regex, email) is not None

def send_outreach_email(recipient_email, subject, body):
    if not recipient_email or not is_valid_email(recipient_email):
        print(f"[ERROR] Invalid recipient email address: '{recipient_email}'")
        return False

    if not body or len(body.strip()) == 0:
        print("[ERROR] Email body content is empty.")
        return False

    if not SMTP_USER or not SMTP_PASSWORD:
        print("[WARNING] SMTP_USER or SMTP_PASSWORD is not configured in .env file.")
        print("[INFO] Running in Simulation Mode. Printing email details below:")
        print(f"  |-- From: {SENDER_EMAIL or 'mock-sender@safakurtilab.com'}")
        print(f"  |-- To: {recipient_email}")
        print(f"  |-- Subject: {subject}")
        print(f"  |-- Body Preview:\n{body[:400]}...")
        return False

    # Create message container
    msg = MIMEMultipart()
    msg['From'] = SENDER_EMAIL
    msg['To'] = recipient_email
    msg['Subject'] = subject

    # Attach the email body with utf-8 encoding
    msg.attach(MIMEText(body, 'plain', 'utf-8'))

    retries = 2
    for attempt in range(1, retries + 1):
        try:
            print(f"[INFO] Connecting to SMTP Server {SMTP_SERVER}:{SMTP_PORT} (Attempt {attempt}/{retries})...")
            
            # Connect using SSL (port 465) or STARTTLS (port 587) with a 15-second timeout
            if SMTP_PORT == 465:
                server = smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT, timeout=15)
            else:
                server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=15)
                server.starttls()
                
            print("[INFO] Logging in to SMTP server...")
            server.login(SMTP_USER, SMTP_PASSWORD)
            
            print(f"[INFO] Dispatched email outreach to {recipient_email}...")
            server.sendmail(SENDER_EMAIL, recipient_email, msg.as_string())
            
            server.quit()
            print("[SUCCESS] Email outreach campaign dispatched successfully!")
            return True
        except Exception as e:
            print(f"[WARNING] Connection attempt {attempt} failed: {e}")
            if attempt < retries:
                print("[INFO] Retrying in 5 seconds...")
                time.sleep(5)
            else:
                print(f"[ERROR] Failed to send email after {retries} attempts.")
                return False

def main():
    print("[Email Outreach] Initializing automated B2B email dispatch agent...")
    
    # List of target recipients (you can append as many email addresses as you like here)
    target_recipients = [
        "saifanowar157@gmail.com",
        "mdshariq157@gmail.com",
        "mdshariq2357@gmail.com"
    ]
    
    email_subject = "Maison Safa: B2B Wholesale Partnership Proposal"
    
    # Read the business pitch
    pitch_content = read_pitch()
    
    print(f"[INFO] Found {len(target_recipients)} recipient(s) in the campaign list.")
    
    success_count = 0
    for idx, recipient in enumerate(target_recipients, 1):
        print(f"\n[{idx}/{len(target_recipients)}] Processing outreach to: {recipient}...")
        
        success = send_outreach_email(recipient, email_subject, pitch_content)
        if success:
            success_count += 1
            
        # Add a delay between dispatches to prevent anti-spam trigger (except for the last email)
        if idx < len(target_recipients) and SMTP_USER and SMTP_PASSWORD:
            delay = 5  # Configurable delay in seconds
            print(f"[INFO] Pausing for {delay} seconds to prevent rate-limiting/spam triggers...")
            time.sleep(delay)
            
    print(f"\n[Email Campaign Summary]")
    print(f"  |-- Total Processed: {len(target_recipients)}")
    print(f"  |-- Successfully Sent: {success_count}")
    print(f"  |-- Failed: {len(target_recipients) - success_count}")

if __name__ == "__main__":
    main()
