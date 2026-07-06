# -*- coding: utf-8 -*-
import urllib.parse

TARGET_VENDORS = [
    {"name": "Harsh Creation", "phone": "919928922028", "hub": "Jaipur", "specialty": "printed plazo sets & ethnic kurtis"},
    {"name": "SYASII Designers", "phone": "919054440333", "hub": "Surat", "specialty": "trendy casual kurtis & western tunics"},
    {"name": "Maaesa Creations", "phone": "916350033577", "hub": "Jaipur", "specialty": "premium cotton ethnic clothing"},
    {"name": "Juniper Fashion", "phone": "919828045242", "hub": "Jaipur", "specialty": "high-end designer ethnic sets"},
    {"name": "Wholesale Kurties by Shagun", "phone": "919654258007", "hub": "Delhi", "specialty": "Lucknowi Chikankari & georgette sets"}
]

def get_pitch(vendor):
    return (
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
        f"Kindly share your latest 'Set-to-Set' digital catalog, Ex-factory bulk price sheet, and HD images Google Drive link with us.\n\n"
        f"कृपया आपका लेटेस्ट 'Set-to-Set' डिजिटल कैटलॉग, एक्स-फैक्ट्री बल्क प्राइस शीट (Ex-factory Bulk Price Sheet) और गूगल ड्राइव इमेज लिंक हमारे इस नंबर पर शेयर करें।\n\n"
        f"Alternate WhatsApp Contact: +91-9851483596\n\n"
        f"Best Regards / धन्यवाद,\n"
        f"MD SHARIQ\n"
        f"Founder, Safa Kurtilab\n"
        f"Primary WhatsApp: +91-7003518485"
    )

with open("scripts/urls.txt", "w", encoding="utf-8") as f:
    for v in TARGET_VENDORS:
        text = urllib.parse.quote(get_pitch(v).encode('utf-8'))
        url = f"https://web.whatsapp.com/send?phone={v['phone']}&text={text}"
        f.write(f"{v['name']}: {url}\n\n")
