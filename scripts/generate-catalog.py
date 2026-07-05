import json
import os

categories = [
    "Anarkali", "Straight Fit", "A-Line", "Angrakha", "Asymmetric",
    "Jacket Style", "Flared & Phiran", "Indo-Western", "Kaftan Style", "Boutique Special"
]

# 10 premium copyright-free fashion Unsplash photo templates optimized for responsive catalog views
unsplash_images = [
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1608748010899-18f300247112?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1610030470298-40b355e71789?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1611601679655-7c8bc197f0c6?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1595959183075-c1d09e37b18c?w=800&auto=format&fit=crop&q=80"
]

colors = [
    "Royal Crimson", "Emerald Green", "Mustard Gold", "Indigo Blue", "Pastel Peach",
    "Ivory White", "Mint Green", "Lavender Pink", "Midnight Black", "Ruby Red"
]

products = []

# Programmatically generate 5 unique products per category (50 products total)
for idx, cat in enumerate(categories):
    for p_idx in range(1, 6):
        prod_id = idx * 5 + p_idx
        color = colors[(prod_id - 1) % len(colors)]
        
        name = f"Maison {color} {cat} Ensemble v{p_idx}"
        description = (
            f"Indulge in absolute luxury with this signature {color} ensemble. "
            f"Tailored specifically for the {cat} style, this design is handcrafted from premium, "
            f"breathable fabrics and adorned with bespoke zari and thread work. "
            f"Perfect for festive luxury and celebratory grace."
        )
        # Pricing structured cleanly between 2499 and 5999
        base_price = 2499 + (p_idx * 400) + (idx * 150)
        image_url = unsplash_images[(prod_id - 1) % len(unsplash_images)]
        
        products.append({
            "name": name,
            "description": description,
            "basePrice": base_price,
            "imageUrl": image_url,
            "category": cat,
            "stockPerSize": 15 + (p_idx * 5),
            "color": color
        })

output_path = os.path.join(os.getcwd(), 'products.json')

with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(products, f, indent=2, ensure_ascii=False)

print(f"Successfully compiled 50 products. Output written to: {output_path}")
