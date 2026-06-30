import asyncio
import gzip
import json
import os
import sys
from pathlib import Path
from datetime import datetime, timezone

# Add backend and src directories to sys.path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))
sys.path.insert(0, str(backend_dir / "src"))

from src.database import AsyncSessionLocal, Base, engine
from src.models import Book, Author, Genre, User, Review, ReviewStatus, UserRole
from src.security import create_hash

DATASET_DIR = Path("/home/rafsan/Projects/dataset/Bangla-Book-Recommendation-Dataset/RokomariBG_Dataset")

def load_gz_json(filename):
    filepath = DATASET_DIR / filename
    print(f"Loading {filename}...")
    with gzip.open(filepath, "rt", encoding="utf-8") as f:
        return json.loads(f.read())

async def seed_data():
    # 1. Load dataset files
    authors_raw = load_gz_json("author.json.gz")
    categories_raw = load_gz_json("category.json.gz")
    publishers_raw = load_gz_json("publisher.json.gz")
    books_raw = load_gz_json("book.json.gz")
    
    book_to_author = load_gz_json("book_to_author.json.gz")
    book_to_category = load_gz_json("book_to_category.json.gz")
    book_to_publisher = load_gz_json("book_to_publisher.json.gz")
    book_to_review = load_gz_json("book_to_review.json.gz")
    
    reviews_raw = load_gz_json("review.json.gz")
    user_to_review = load_gz_json("user_to_review.json.gz")
    
    print("Files loaded successfully. Processing structures...")

    # Map raw items for quick lookup
    authors_map = {a["author_id"]: a for a in authors_raw}
    categories_map = {c["category_id"]: c for c in categories_raw}
    publishers_map = {p["publisher_id"]: p for p in publishers_raw}
    reviews_map = {r["review_id"]: r for r in reviews_raw}
    
    # Map relations
    b_to_a_map = {}
    for rel in book_to_author:
        b_to_a_map.setdefault(str(rel["book_id"]), []).append(str(rel["author_id"]))
        
    b_to_c_map = {}
    for rel in book_to_category:
        b_to_c_map.setdefault(str(rel["book_id"]), []).append(str(rel["category_id"]))
        
    b_to_p_map = {}
    for rel in book_to_publisher:
        b_to_p_map[str(rel["book_id"])] = str(rel["publisher_id"])
        
    b_to_r_map = {}
    for rel in book_to_review:
        b_to_r_map.setdefault(str(rel["book_id"]), []).append(int(rel["review_id"]))
        
    r_to_u_map = {}
    for rel in user_to_review:
        r_to_u_map[int(rel["review_id"])] = rel["user_id"]

    # 2. Select top 200 books based on wished_customer_count (deduplicated by book_id)
    print("Selecting top books...")
    valid_books = [b for b in books_raw if b.get("wished_customer_count") is not None]
    
    seen_ids = set()
    unique_books = []
    for b in valid_books:
        bid = b["book_id"]
        if bid not in seen_ids:
            seen_ids.add(bid)
            unique_books.append(b)
            
    # Sort descending
    unique_books.sort(key=lambda x: x["wished_customer_count"], reverse=True)
    top_books_raw = unique_books[:200]
    
    print(f"Selected {len(top_books_raw)} unique books for seeding.")

    # 3. Database session insertion
    async with AsyncSessionLocal() as session:
        # Recreate all tables to align with the new schema
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)
            
        print("Starting database seeding...")
        
        # Keep track of created entities to avoid duplicates
        seeded_authors = {}
        seeded_genres = {}
        seeded_users = {}
        
        # Create a default system user
        system_hash = create_hash("password123")
        default_user = User(
            username="rokomari_bot",
            email="bot@rokomari.com",
            hashed_password=system_hash,
            full_name="Rokomari Bot",
            role=UserRole.READER,
            bio="Automated curator seeding Bengali classics.",
            avatar_url="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120"
        )
        session.add(default_user)
        await session.flush()
        
        for idx, b_raw in enumerate(top_books_raw):
            b_id_str = str(b_raw["book_id"])
            
            # Resolve publisher name
            pub_name = "Unknown Publisher"
            pub_id = b_to_p_map.get(b_id_str)
            if pub_id and pub_id in publishers_map:
                pub_name = publishers_map[pub_id]["publisher_name"]
                
            # Create Book with pre-initialized collections to prevent async lazy loading
            book = Book(
                google_books_id=f"rokomari-{b_id_str}",
                title=b_raw["book_title"],
                description=b_raw.get("book_summary") or "",
                publisher=pub_name,
                published_year="2020", # Default fallback
                total_pages=int(b_raw.get("book_pages") or 0),
                ISBN=b_raw.get("isbn") or "",
                thumbnail_url=None,
                is_online_available=b_raw.get("book_availability") == "In Stock",
                rating=int(b_raw.get("average_rating") or 0),
                authors=[],
                genres=[]
            )
            session.add(book)
            await session.flush()
            
            # Resolve & link Authors
            author_ids = b_to_a_map.get(b_id_str, [])
            for a_id in author_ids:
                if a_id in authors_map:
                    if a_id not in seeded_authors:
                        author_data = authors_map[a_id]
                        author = Author(
                            name=author_data["author"],
                            description=author_data.get("bio") or ""
                        )
                        session.add(author)
                        await session.flush()
                        seeded_authors[a_id] = author
                    else:
                        author = seeded_authors[a_id]
                    book.authors.append(author)
                    
            # Resolve & link Genres (Categories)
            cat_ids = b_to_c_map.get(b_id_str, [])
            for c_id in cat_ids:
                if c_id in categories_map:
                    if c_id not in seeded_genres:
                        cat_data = categories_map[c_id]
                        genre = Genre(
                            name=cat_data["category_name"]
                        )
                        session.add(genre)
                        await session.flush()
                        seeded_genres[c_id] = genre
                    else:
                        genre = seeded_genres[c_id]
                    book.genres.append(genre)
                    
            # Resolve & insert Reviews
            review_ids = b_to_r_map.get(b_id_str, [])
            # Limit to 3 reviews per book to keep it clean
            for r_id in review_ids[:3]:
                if r_id in reviews_map:
                    rev_data = reviews_map[r_id]
                    user_id_str = r_to_u_map.get(r_id, "USER_GENERIC")
                    
                    # Resolve or create User for review
                    if user_id_str not in seeded_users:
                        user = User(
                            username=user_id_str.lower(),
                            email=f"{user_id_str.lower()}@example.com",
                            hashed_password=system_hash,
                            full_name=f"Reader {user_id_str[-5:]}",
                            avatar_url=f"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120"
                        )
                        session.add(user)
                        await session.flush()
                        seeded_users[user_id_str] = user
                    else:
                        user = seeded_users[user_id_str]
                        
                    # Create Review
                    review = Review(
                        title="Book Review",
                        body=rev_data.get("review_detail") or "অসাধারণ বই!",
                        user_id=user.id,
                        book_id=book.id,
                        status=ReviewStatus.PUBLIC,
                        created_at=datetime.now(timezone.utc)
                    )
                    session.add(review)
            
            if (idx + 1) % 20 == 0:
                print(f"Processed {idx + 1}/200 books...")

        print("Committing transaction...")
        await session.commit()
        print("Seeding completed successfully!")

if __name__ == "__main__":
    asyncio.run(seed_data())
