import requests

def main():
    file_id = "1vEZbawgzxNTpbpkwwNA0KNsNQ9w53PPx" # ID of ₹115_179761_PA_0115-_1.pdf
    url = f"https://drive.google.com/uc?export=download&id={file_id}"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    print(f"Downloading from: {url}")
    try:
        response = requests.get(url, headers=headers, allow_redirects=True, timeout=20)
        print(f"Status Code: {response.status_code}")
        print(f"Content Type: {response.headers.get('Content-Type')}")
        print(f"Content Length: {response.headers.get('Content-Length')}")
        
        # Save first 100 bytes or whole file to see what we got
        content = response.content
        print(f"Downloaded bytes size: {len(content)}")
        if len(content) > 1000:
            print("Preview of content (first 100 bytes):")
            print(content[:100])
            with open("d:\\Website\\scripts\\test_direct.pdf", "wb") as f:
                f.write(content)
            print("Saved to scripts\\test_direct.pdf")
        else:
            print("Response text preview:")
            print(response.text[:500])
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    main()
