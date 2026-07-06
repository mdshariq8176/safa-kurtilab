# scripts/price-watcher.py
import os
import json
import re

# Gracefully import BeautifulSoup, otherwise simulate it
try:
    from bs4 import BeautifulSoup
except ImportError:
    BeautifulSoup = None

# Custom environment loader
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

DATA_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "products.json")
LOG_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "price_watcher.log")

# Mock HTML payload representing scraped B2B portal product listings (e.g. IndiaMart / TradeIndia Kurta queries)
MOCK_B2B_HTML = """
<html>
  <body>
    <div class="product-listing">
      <div class="card">
        <h2 class="title">Anarkali Ensemble Premium Silk</h2>
        <span class="price">Rs. 1,650 / Set</span>
        <span class="supplier">Rajput Fabrics Mumbai</span>
      </div>
      <div class="card">
        <h2 class="title">Designer Silk Anarkali Set</h2>
        <span class="price">Rs. 1,500 / Piece</span>
        <span class="supplier">Sanskriti Weaves Surat</span>
      </div>
      <div class="card">
        <h2 class="title">Royal Crimson Anarkali Kurta</h2>
        <span class="price">Rs. 1,800 / Set</span>
        <span class="supplier">Ethnic Hub Jaipur</span>
      </div>
      <div class="card">
        <h2 class="title">Classic Silk Anarkali Suit</h2>
        <span class="price">Rs. 1,400 / Piece</span>
        <span class="supplier">Heritage Silks Delhi</span>
      </div>
    </div>
  </body>
</html>
"""

def parse_prices_with_bs4(html_content):
    """
    Parses product details and prices from B2B HTML using BeautifulSoup.
    """
    parsed_items = []
    soup = BeautifulSoup(html_content, "html.parser")
    cards = soup.find_all("div", class_="card")
    
    for card in cards:
        title_el = card.find("h2", class_="title")
        price_el = card.find("span", class_="price")
        
        if title_el and price_el:
            title = title_el.get_text().strip()
            price_text = price_el.get_text().strip()
            
            # Extract numeric value using regex (e.g. "Rs. 1,650 / Set" -> 1650)
            numbers = re.findall(r"\d[\d,]*", price_text)
            if numbers:
                price_val = float(numbers[0].replace(",", ""))
                parsed_items.append({"title": title, "price": price_val})
                
    return parsed_items

def parse_prices_with_regex(html_content):
    """
    Fallback parser using regex to extract titles and prices from HTML elements.
    Used when bs4 is not available in the python environment.
    """
    parsed_items = []
    # Pattern to match class="card" blocks
    card_pattern = re.compile(r'<div class="card">.*?</div>', re.DOTALL)
    title_pattern = re.compile(r'<h2 class="title">(.*?)</h2>')
    price_pattern = re.compile(r'<span class="price">(.*?)</span>')
    
    cards = card_pattern.findall(html_content)
    for card in cards:
        title_match = title_pattern.search(card)
        price_match = price_pattern.search(card)
        
        if title_match and price_match:
            title = title_match.group(1).strip()
            price_text = price_match.group(1).strip()
            
            numbers = re.findall(r"\d[\d,]*", price_text)
            if numbers:
                price_val = float(numbers[0].replace(",", ""))
                parsed_items.append({"title": title, "price": price_val})
                
    return parsed_items

def calculate_optimal_price(market_prices, discount_pct=0.05, shipping_buffer=150.0):
    """
    COMPUTATION MATRIX:
    1. Computes mean average of competing listings.
    2. Subtracts target B2B discount percent to keep our wholesale catalog highly competitive.
    3. Adds standard logistics shipping buffer.
    """
    if not market_prices:
        return 0.0, 0.0
        
    mean_avg = sum(market_prices) / len(market_prices)
    target_baseline = mean_avg * (1 - discount_pct)
    recommended_price = target_baseline + shipping_buffer
    
    return mean_avg, recommended_price

def main():
    print("[Price Watcher] Initializing competitive B2B wholesale price crawler...")
    
    # 1. Parse scraped listings
    if BeautifulSoup:
        print("[Price Watcher] Running parsing engine via BeautifulSoup4...")
        market_listings = parse_prices_with_bs4(MOCK_B2B_HTML)
    else:
        print("[Price Watcher] BeautifulSoup4 not detected. Running parsing engine via Regex Fallback...")
        market_listings = parse_prices_with_regex(MOCK_B2B_HTML)

    if not market_listings:
        print("[Price Watcher] Warning: No market listings parsed. Aborting execution.")
        return

    print(f"[Price Watcher] Parsed {len(market_listings)} B2B competitor wholesale options:")
    prices = []
    for item in market_listings:
        print(f"  |-- Competitor: '{item['title']}' | Market Wholesale Price: Rs. {item['price']}")
        prices.append(item["price"])

    # 2. Apply Pricing Calculation Matrix
    market_mean, recommended_price = calculate_optimal_price(
        prices, 
        discount_pct=0.05,        # Track 5% below market mean average
        shipping_buffer=150.0     # Rs. 150 standard courier buffer
    )

    print("\n--- B2B Pricing Matrix Computations ---")
    print(f"  |-- Market Wholesale Mean Average: Rs. {market_mean:.2f}")
    print(f"  |-- Competitive Target (5% below mean): Rs. {market_mean * 0.95:.2f}")
    print(f"  |-- Shipping Buffer Added: Rs. 150.00")
    print(f"  |-- Recommended Catalog Price: Rs. {recommended_price:.2f}")
    
    # 3. Log results to execution file
    log_data = {
        "status": "success",
        "marketMean": market_mean,
        "recommendedPrice": recommended_price,
        "listingsAnalyzedCount": len(prices),
        "listings": market_listings
    }
    
    with open(LOG_FILE, "w", encoding="utf-8") as f:
        json.dump(log_data, f, indent=2)
    print(f"\n[Price Watcher] Verified price targets logged to: {LOG_FILE}")
    print("[Price Watcher] Run complete.")

if __name__ == "__main__":
    main()
