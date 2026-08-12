# scripts/etl_pipeline/copywriter.py
"""
Module 4: Automated B2B Copywriting Engine (services/copywriter)
Auto-generates high-converting wholesale product titles, bullet points, and margin selling pitches in English & Bengali.
"""

from .schemas import NormalizedSupplierRecord, GeneratedCopywriting


def generate_b2b_copywriting(record: NormalizedSupplierRecord) -> GeneratedCopywriting:
    """
    Generates bilingual (English & Bengali) high-conversion B2B sales copy and margin calculations.
    """
    margin_pct = round(((record.msrp_retail_price - record.per_piece_price) / record.per_piece_price) * 100, 1)

    title_en = f"Luxury {record.fabric_grade} {record.title} (4-Piece Set)"
    title_bn = f"ম্যাজেস্টিক {record.fabric_grade} {record.title} (৪-পিস হোলসেল বান্ডিল)"

    bullet_points_en = [
        f"🧵 Fabric Specs: {record.fabric_grade} (100% Export Quality)",
        f"📦 Selling Unit: 4-Piece Set Bundle (Standard Sizes M, L, XL, XXL)",
        f"💎 Retailer Margin Potential: {margin_pct}% (WSR: ₹{record.per_piece_price}/pc | MSRP: ₹{record.msrp_retail_price}/pc)",
        f"🚚 Dispatch Hub: {record.hub_location.value if hasattr(record.hub_location, 'value') else record.hub_location} Direct Factory Warehouse"
    ]

    bullet_points_bn = [
        f"🧵 ফেব্রিক বিবরণ: ১০০% প্রিমিয়াম {record.fabric_grade}",
        f"📦 পাইকারি বান্ডিল: ৪-পিস সেট (সাইজ: M, L, XL, XXL)",
        f"💎 খুচরা বিক্রেতা লাভ: {margin_pct}% প্রফিট মার্জিন সম্ভাবনা",
        f"🚚 শিপিং: কারখানা থেকে সরাসরি ফাস্ট ডিসপ্যাচ"
    ]

    b2b_selling_pitch = (
        f"Maximize retail store profits with our {record.title}. "
        f"Wholesale set rate: ₹{record.listing_price} (4 Pcs). "
        f"Resell at suggested MSRP ₹{record.msrp_retail_price}/pc for up to {margin_pct}% profit margins!"
    )

    return GeneratedCopywriting(
        title_en=title_en,
        title_bn=title_bn,
        bullet_points_en=bullet_points_en,
        bullet_points_bn=bullet_points_bn,
        b2b_selling_pitch=b2b_selling_pitch,
        margin_potential_pct=margin_pct
    )
