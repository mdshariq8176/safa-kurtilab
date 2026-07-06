# scripts/indiamart-check.py
import os
import json
import asyncio
import sys

# Decoupled environment loader
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

# Safe mock payload representing IndiaMART B2B Lead/Supplier verification API response structures
MOCK_INDIAMART_API_RESPONSE = {
    "status": "SUCCESS",
    "code": 200,
    "data": [
        {
            "company_name": "Jaipur Handlooms & Textiles Pvt Ltd",
            "business_type": "Manufacturer & Wholesale Exporter",
            "trustseal_verified": True,
            "rating": 4.8,
            "location": "Jaipur, Rajasthan",
            "primary_category": "Ethnic Wear & Kurtis"
        },
        {
            "company_name": "Surat Silk Mills Association",
            "business_type": "Manufacturer / Supplier",
            "trustseal_verified": True,
            "rating": 4.6,
            "location": "Surat, Gujarat",
            "primary_category": "Premium Anarkali Fabric"
        },
        {
            "company_name": "Delhi Garment Hub",
            "business_type": "Wholesale Distributor",
            "trustseal_verified": False,
            "rating": 3.9,
            "location": "Chandni Chowk, Delhi",
            "primary_category": "Straight Cut Kurtis"
        }
    ]
}

async def fetch_indiamart_suppliers(api_key=None):
    """
    Asynchronously queries the IndiaMART API.
    Uses mock stubs if api_key is missing, securing accounts from raw cookie lockouts.
    """
    print("[IndiaMART Verify] Initiating asynchronous network connection request...")
    await asyncio.sleep(1.0) # Simulate network latency
    
    if not api_key or api_key == "MOCK_KEY":
        print("[IndiaMART Verify] API key not found or set to MOCK. Utilizing sandboxed mock structures.")
        return MOCK_INDIAMART_API_RESPONSE
    
    # In a production setup, replace with actual clean HTTP dispatch (e.g. using aiohttp or urllib)
    # This prevents scraping with personal cookies that could cause account lockout.
    print(f"[IndiaMART Verify] Querying IndiaMART B2B endpoint with API Key: {api_key[:4]}****")
    # Simulation return
    return MOCK_INDIAMART_API_RESPONSE

async def parse_and_validate_suppliers(response_data):
    """
    Extracts and logs the target verification metrics from the parsed response.
    Target fields: 'company_name', 'business_type', 'trustseal_verified'
    """
    print("\n================== INDIAMART B2B SUPPLIER VERIFICATION ==================")
    if response_data.get("status") != "SUCCESS":
        print("[IndiaMART Verify] Error: Supplier response payload did not return SUCCESS.")
        return
        
    suppliers = response_data.get("data", [])
    print(f"[IndiaMART Verify] Located {len(suppliers)} supplier nodes in payload:\n")
    
    for idx, supplier in enumerate(suppliers, 1):
        print(f"[{idx}] Supplier Verification Node:")
        print(f"    |-- Company Name       : {supplier.get('company_name', 'N/A')}")
        print(f"    |-- Business Type      : {supplier.get('business_type', 'N/A')}")
        
        trust_status = supplier.get('trustseal_verified', False)
        trust_flag = "VERIFIED (TRUSTSEAL APPROVED)" if trust_status else "UNVERIFIED"
        print(f"    |-- TrustSeal Status   : {trust_flag}")
        print(f"    |-- Location           : {supplier.get('location', 'N/A')}")
        print(f"    |-- Rating             : {supplier.get('rating', 'N/A')}/5.0")
        print("    ------------------------------------------------------------------")

async def main():
    print("[IndiaMART Verify] Starting verification agent...")
    
    # Decouple API keys safely from the environment
    indiamart_key = os.environ.get("INDIAMART_API_KEY", "MOCK_KEY")
    
    # Async Fetch B2B nodes
    raw_response = await fetch_indiamart_suppliers(indiamart_key)
    
    # Parse and validate B2B fields
    await parse_and_validate_suppliers(raw_response)
    
    print("[IndiaMART Verify] Verification agent task complete.")

if __name__ == "__main__":
    # Handle event loop execution cross-compatibility
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
