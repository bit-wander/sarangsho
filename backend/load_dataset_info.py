import gzip
import json
from pathlib import Path

dataset_dir = Path("/home/rafsan/Projects/dataset/Bangla-Book-Recommendation-Dataset/RokomariBG_Dataset")

files_to_inspect = [
    "author.json.gz",
    "category.json.gz",
    "publisher.json.gz",
    "book.json.gz",
    "book_to_author.json.gz",
    "book_to_category.json.gz",
    "book_to_publisher.json.gz",
    "book_to_review.json.gz",
    "review.json.gz",
    "user_to_review.json.gz"
]

for filename in files_to_inspect:
    filepath = dataset_dir / filename
    if not filepath.exists():
        print(f"File not found: {filename}")
        continue
        
    print(f"\n=========================================")
    print(f"Inspecting {filename}...")
    try:
        with gzip.open(filepath, "rt", encoding="utf-8") as f:
            data = json.loads(f.read())
            
            print(f"Data type: {type(data)}")
            if isinstance(data, list):
                print(f"Number of items: {len(data)}")
                if len(data) > 0:
                    print("Sample item keys:", list(data[0].keys()) if isinstance(data[0], dict) else type(data[0]))
                    print("Sample item:", json.dumps(data[0], indent=2, ensure_ascii=False)[:500])
            elif isinstance(data, dict):
                print(f"Number of keys: {len(data)}")
                first_key = list(data.keys())[0]
                print(f"Sample key: {first_key}")
                print(f"Sample value: {json.dumps(data[first_key], ensure_ascii=False)[:500]}")
    except Exception as e:
        print(f"Error reading {filename}: {e}")
