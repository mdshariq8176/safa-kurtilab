import json

def main():
    try:
        with open('src/data/sku_metadata.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            print(f"Total entries: {len(data)}")
            
            # Print unique codes and their descriptions
            for item in data:
                print(f"Code: {item.get('code')}")
                print(f"Title: {item.get('title')}")
                print(f"Image: {item.get('image')}")
                print(f"Desc: {item.get('description')[:150]}...")
                print("-" * 50)
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    main()
