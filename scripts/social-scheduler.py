# scripts/social-scheduler.py
import os
import json

# Try to import requests for API calls, otherwise fallback gracefully
try:
    import requests
except ImportError:
    requests = None

def load_env_file():
    """
    Manually parses the .env file to avoid external library dependencies like python-dotenv.
    """
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                # Skip empty lines and comments
                if not line or line.startswith("#"):
                    continue
                if "=" in line:
                    key, val = line.split("=", 1)
                    # Strip surrounding quotes and whitespace
                    key = key.strip()
                    val = val.strip().strip('"').strip("'")
                    os.environ[key] = val

# Load configuration variables
load_env_file()

META_ACCESS_TOKEN = os.getenv("META_ACCESS_TOKEN")
META_PAGE_ID = os.getenv("META_PAGE_ID")
META_IG_BUSINESS_ID = os.getenv("META_IG_BUSINESS_ID")

DATA_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "products.json")

def generate_ai_caption(product_name, category, price):
    """
    Simulates a lightweight LLM text generator to draft luxury social captions.
    """
    hashtags = f" #MaisonSafa #{category.replace(' ', '')} #EthnicLuxe #ShahpurJat #LuxuryApparel #KurtaLuxe"
    captions = [
        f"Experience royal elegance with our newly curated '{product_name}'. Designed specifically in the classic {category} pattern, this trousseau piece brings heritage craftsmanship straight to your wardrobe. Available now at Rs {price}. Direct inquiries open in DM.{hashtags}",
        f"Tailored to perfection: The all-new '{product_name}' by Maison Safa. Intricate thread details and pure comfort in a classic {category} silhouette. Price: Rs {price}. Shop via B2B catalog or visit our studio.{hashtags}",
        f"Introducing the {category} masterpiece of the season: '{product_name}'. Timeless aesthetics combined with premium fabric. Perfect for your next festive gathering. Order today at Rs {price}.{hashtags}"
    ]
    # Simple hash index to rotate captions based on product name length
    return captions[len(product_name) % len(captions)]

def post_to_facebook(image_url, caption):
    """
    Dispatches a photo and description to the Facebook Page Feed via Meta Graph API.
    """
    is_mock = not META_ACCESS_TOKEN or "mock" in META_ACCESS_TOKEN.lower() or not requests
    
    if is_mock:
        print(f"[Offline Simulation] Posted Photo to Facebook Page ({META_PAGE_ID or 'MOCK_FB_PAGE_101'}) successfully!")
        print(f"  |-- Image URL: {image_url}")
        print(f"  |-- Caption: {caption[:120]}...")
        if not requests:
            print("  Note: Python 'requests' module not found. Running in offline fallback mode.")
        return {"id": "mock_fb_post_id_990182", "success": True}

    url = f"https://graph.facebook.com/v18.0/{META_PAGE_ID}/photos"
    payload = {
        "url": image_url,
        "caption": caption,
        "access_token": META_ACCESS_TOKEN
    }
    
    try:
        response = requests.post(url, data=payload)
        res_data = response.json()
        if response.status_code == 200:
            print(f"Success: Posted to Facebook. Post ID: {res_data.get('id')}")
            return res_data
        else:
            print(f"Error posting to Facebook API: {json.dumps(res_data)}")
            return None
    except Exception as e:
        print(f"Failed to reach Facebook Endpoint: {e}")
        return None

def post_to_instagram(image_url, caption):
    """
    Uploads a media container and publishes it to the Instagram Business Profile.
    """
    is_mock = not META_ACCESS_TOKEN or "mock" in META_ACCESS_TOKEN.lower() or not requests
    
    if is_mock:
        print(f"[Offline Simulation] Published Photo to Instagram Business Account ({META_IG_BUSINESS_ID or 'MOCK_IG_ACCOUNT_202'}) successfully!")
        print(f"  |-- Image URL: {image_url}")
        print(f"  |-- Caption: {caption[:120]}...")
        if not requests:
            print("  Note: Python 'requests' module not found. Running in offline fallback mode.")
        return {"id": "mock_ig_media_id_770192", "success": True}

    # Step 1: Create Media Container
    container_url = f"https://graph.facebook.com/v18.0/{META_IG_BUSINESS_ID}/media"
    container_payload = {
        "image_url": image_url,
        "caption": caption,
        "access_token": META_ACCESS_TOKEN
    }
    
    try:
        container_res = requests.post(container_url, data=container_payload)
        container_data = container_res.json()
        
        if container_res.status_code != 200:
            print(f"Error creating Instagram container: {json.dumps(container_data)}")
            return None
        
        creation_id = container_data.get("id")
        print(f"Created IG Media Container. ID: {creation_id}")
        
        # Step 2: Publish Container
        publish_url = f"https://graph.facebook.com/v18.0/{META_IG_BUSINESS_ID}/media_publish"
        publish_payload = {
            "creation_id": creation_id,
            "access_token": META_ACCESS_TOKEN
        }
        
        publish_res = requests.post(publish_url, data=publish_payload)
        publish_data = publish_res.json()
        
        if publish_res.status_code == 200:
            print(f"Success: Published to Instagram. ID: {publish_data.get('id')}")
            return publish_data
        else:
            print(f"Error publishing Instagram container: {json.dumps(publish_data)}")
            return None
            
    except Exception as e:
        print(f"Failed to reach Instagram Endpoints: {e}")
        return None

def main():
    print("[Social Scheduler] Starting Autopilot Social Media Scheduler Agent...")
    
    if not os.path.exists(DATA_FILE):
        print(f"Error: Catalog data file not found at: {DATA_FILE}")
        return

    with open(DATA_FILE, "r", encoding="utf-8") as f:
        products = json.load(f)

    if not products:
        print("Warning: No products inside products.json. Aborting run.")
        return

    # Select the first product to publish as a test/schedule run
    target = products[0]
    title = target.get("name")
    category = target.get("category")
    price = target.get("basePrice")
    image_url = target.get("imageUrl")
    
    # Check fallback image
    if not image_url.startswith("http"):
        image_url = "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800"

    print(f"Selected Item for Autopilot Posting: '{title}' in Category '{category}'")
    caption = generate_ai_caption(title, category, price)
    
    print("\n--- Facebook Page Feed Dispatch ---")
    post_to_facebook(image_url, caption)
    
    print("\n--- Instagram Business Feed Dispatch ---")
    post_to_instagram(image_url, caption)
    
    print("\nAutopilot Social Posting Sequence completed successfully!")

if __name__ == "__main__":
    main()
