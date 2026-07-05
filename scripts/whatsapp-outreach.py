# scripts/whatsapp-outreach.py
import pywhatkit as whatsapp
import datetime
import time

# Wholesalers phone numbers (including Country Code +91)
WHOM_TO_MESSAGE = [
    "+919851483596",  # Safa Kurtilab primary wholesaler contact
    "+917003518485"   # Shariq secondary wholesaler contact
]

# Automated Message Template
MESSAGE_TEMPLATE = (
    "নমস্কার দাদা, সাফা কুর্তি ল্যাব থেকে বলছি।\n\n"
    "দয়া করে এই সপ্তাহের নতুন কালেকশনের ড্রাইভ লিঙ্ক (Drive Link) "
    "এবং ইনভেন্টরি ক্যাটালগ শিটটি (Excel/CSV) একটু শেয়ার করুন। "
    "আমি ওয়েবসাইটে বাল্ক আপলোড স্টার্ট করব। ধন্যবাদ!"
)

def send_weekly_outreach():
    print("🚀 Starting automated WhatsApp outreach sequence...")
    
    for phone_number in WHOM_TO_MESSAGE:
        print(f"Scheduling WhatsApp message to {phone_number}...")
        
        # Calculate standard delivery time offsets (2 minutes from now, as required by pywhatkit)
        now = datetime.datetime.now()
        send_hour = now.hour
        send_minute = now.minute + 2
        
        # Adjust for hour boundaries
        if send_minute >= 60:
            send_hour = (send_hour + 1) % 24
            send_minute = send_minute - 60

        try:
            # Opens WhatsApp Web to type and send messages automatically
            whatsapp.sendwhatmsg(
                phone_no=phone_number,
                message=MESSAGE_TEMPLATE,
                time_hour=send_hour,
                time_min=send_minute,
                wait_time=15, # Wait 15s for WhatsApp Web window rendering
                tab_close=True, # Auto-close active tab after sending
                close_time=3
            )
            print(f"✅ Message scheduled successfully for {phone_number} at {send_hour:02d}:{send_minute:02d}.")
        except Exception as e:
            print(f"❌ Failed scheduling message for {phone_number}: {e}")
            print("💡 Ensure you have a logged-in WhatsApp Web session in your default browser.")
        
        # Safety interval between outreach calls
        time.sleep(5)

if __name__ == "__main__":
    send_weekly_outreach()
